import { injectable } from 'tsyringe';
import Docker from 'dockerode';
import { IJobRunnerService } from '../../../domain/interfaces/services/IJobRunService';
import { IWorkflowJob } from '../../../domain/interfaces/ICICD';
import { WorkflowRunModel } from '../../database/mongoose/models/WorkflowRunModel';

@injectable()
export class DockerRunnerService implements IJobRunnerService {
  private docker: Docker;
  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }
  async executeJob(
    job: IWorkflowJob,
    runId: string,
    repoCloneUrl: string,
    commitHash: string,
  ): Promise<boolean> {
    let container: Docker.Container | null = null;
    try {
      // 1. Determine image (e.g., ubuntu-latest -> ubuntu:latest)
      const image = job.runsOn.replace('-latest', ':latest');

      // 2. Pull the image if not exists
      await new Promise((resolve, reject) => {
        this.docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, onFinished);
          function onFinished(err: Error | null, output: unknown[]) {
            if (err) return reject(err);
            resolve(output);
          }
        });
      });
      // 3. Create the container
      container = await this.docker.createContainer({
        Image: image,
        Cmd: ['/bin/sh', '-c', 'sleep 3600'], // Keep container alive to run execs
        Tty: true,
        HostConfig: {
          ExtraHosts: ['host.docker.internal:172.17.0.1'],
        },
      });
      await container.start();
      await this.appendLog(runId, `[System] Container started with image: ${image}\n`);
      // 4. Clone the repository inside the container
      let finalCloneUrl = repoCloneUrl;
      if (process.env.NODE_ENV === 'production') {
        finalCloneUrl = finalCloneUrl.replace('host.docker.internal', '172.17.0.1');
      }

      const cloneSuccess = await this.runCommandInContainer(
        container,
        runId,
        `git clone ${finalCloneUrl} workspace`,
      );
      if (!cloneSuccess)
        throw new Error(
          'Failed to clone repository. Make sure git is installed in the runner image.',
        );

      const checkoutSuccess = await this.runCommandInContainer(
        container,
        runId,
        `cd workspace && git checkout ${commitHash}`,
      );
      if (!checkoutSuccess) throw new Error(`Failed to checkout commit ${commitHash}`);
      // 5. Execute user defined steps
      for (const step of job.steps) {
        await this.appendLog(runId, `[Step] Running: ${step.name}\n`);

        if (step.run) {
          const success = await this.runCommandInContainer(
            container,
            runId,
            `cd workspace && ${step.run}`,
          );
          if (!success) {
            throw new Error(`Step '${step.name}' failed.`);
          }
        }
      }
      await this.appendLog(runId, `[System] Job completed successfully.\n`);
      await this.waitForLogs(runId);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.appendLog(runId, `[System Error] ${errorMessage}\n`);
      await this.waitForLogs(runId);
      return false;
    } finally {
      // Clean up the container
      if (container) {
        await container.stop();
        await container.remove();
      }
    }
  }

  private async waitForLogs(runId: string) {
    if (this.flushTimers.has(runId)) {
      clearTimeout(this.flushTimers.get(runId)!);
      this.flushTimers.delete(runId);

      const chunkToSave = this.logBuffers.get(runId) || '';
      this.logBuffers.delete(runId);

      if (chunkToSave) {
        const queue = this.logQueues.get(runId) || Promise.resolve();
        const nextQueue = queue.then(async () => {
          try {
            const run = await WorkflowRunModel.findById(runId);
            if (run) {
              run.logs = (run.logs || '') + chunkToSave;
              await run.save();
            }
          } catch {
            // Ignore error
          }
        });
        this.logQueues.set(runId, nextQueue);
      }
    }
    await (this.logQueues.get(runId) || Promise.resolve());
  }
  private async runCommandInContainer(
    container: Docker.Container,
    runId: string,
    cmd: string,
  ): Promise<boolean> {
    const exec = await container.exec({
      Cmd: ['/bin/sh', '-c', cmd],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true, // Prevent Docker multiplexing stream headers
    });
    const stream = (await exec.start({
      Detach: false,
      Tty: true,
    })) as unknown as NodeJS.ReadWriteStream;
    // Stream logs to database (or Redis/Socket.IO)
    stream.on('data', async (chunk: Buffer) => {
      await this.appendLog(runId, chunk.toString('utf8'));
    });
    return new Promise((resolve) => {
      stream.on('end', async () => {
        const inspect = await exec.inspect();
        resolve(inspect.ExitCode === 0);
      });
    });
  }
  private logQueues: Map<string, Promise<void>> = new Map();
  private logBuffers: Map<string, string> = new Map();
  private flushTimers: Map<string, NodeJS.Timeout> = new Map();

  private async appendLog(runId: string, logChunk: string) {
    const current = this.logBuffers.get(runId) || '';
    this.logBuffers.set(runId, current + logChunk);

    if (!this.flushTimers.has(runId)) {
      const timer = setTimeout(async () => {
        this.flushTimers.delete(runId);
        const chunkToSave = this.logBuffers.get(runId) || '';
        this.logBuffers.delete(runId);

        if (!chunkToSave) return;

        const queue = this.logQueues.get(runId) || Promise.resolve();
        const nextQueue = queue.then(async () => {
          try {
            const run = await WorkflowRunModel.findById(runId);
            if (run) {
              run.logs = (run.logs || '') + chunkToSave;
              await run.save();
            }
          } catch (err) {
            console.error('Failed to append log:', err);
          }
        });
        this.logQueues.set(runId, nextQueue);
      }, 200);
      this.flushTimers.set(runId, timer);
    }
  }
}
