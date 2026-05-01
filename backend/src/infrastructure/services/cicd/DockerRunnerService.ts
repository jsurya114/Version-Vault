import { injectable, container } from 'tsyringe';
import Docker from 'dockerode';
import { TOKENS } from '../../../shared/constants/tokens';
import { ISocketEmitter } from '../../../domain/interfaces/services/ISocketEmitter';
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
    let dockerContainer: Docker.Container | null = null;
    try {
      // 1. Determine image (e.g., ubuntu-latest -> ubuntu:latest)
      const image = job.runsOn.replace('-latest', ':latest');

      // Build a list of all steps (system + user-defined)
      const allSteps = [
        { name: 'Set up runner', run: undefined, isSystem: true },
        { name: 'Clone repository', run: undefined, isSystem: true },
        { name: 'Checkout commit', run: undefined, isSystem: true },
        ...job.steps.map((s) => ({ name: s.name, run: s.run, isSystem: false })),
      ];

      // Initialize steps in DB
      await WorkflowRunModel.findByIdAndUpdate(runId, {
        steps: allSteps.map((s) => ({ name: s.name, status: 'pending', logs: '' })),
      });

      // Emit initial steps to frontend
      this.emitStepUpdate(runId, {
        type: 'steps_init',
        steps: allSteps.map((s) => ({ name: s.name, status: 'pending', logs: '' })),
      });

      // ---- Step 0: Set up runner (pull image) ----
      await this.markStepRunning(runId, 0, 'Set up runner');

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
      dockerContainer = await this.docker.createContainer({
        Image: image,
        Cmd: ['/bin/sh', '-c', 'sleep 3600'], // Keep container alive to run execs
        Tty: true,
        // HostConfig: {
        //   ExtraHosts: ['host.docker.internal:172.17.0.1'],
        // },
      });
      await dockerContainer.start();

      await this.appendStepLog(runId, 0, `Container started with image: ${image}\n`);
      await this.markStepDone(runId, 0, 'success');

      // ---- Step 1: Clone repository ----
      await this.markStepRunning(runId, 1, 'Clone repository');

      let finalCloneUrl = repoCloneUrl;
      if (process.platform === 'linux') {
        finalCloneUrl = finalCloneUrl
          .replace('localhost', '172.31.28.158')
          .replace('host.docker.internal', '172.31.28.158');
      }

      const cloneSuccess = await this.runCommandInContainer(
        dockerContainer,
        runId,
        1,
        `git clone ${finalCloneUrl} workspace`,
      );
      if (!cloneSuccess) {
        await this.markStepDone(runId, 1, 'failed');
        throw new Error(
          'Failed to clone repository. Make sure git is installed in the runner image.',
        );
      }
      await this.markStepDone(runId, 1, 'success');

      // ---- Step 2: Checkout commit ----
      await this.markStepRunning(runId, 2, 'Checkout commit');

      const checkoutSuccess = await this.runCommandInContainer(
        dockerContainer,
        runId,
        2,
        `cd workspace && git checkout ${commitHash}`,
      );
      if (!checkoutSuccess) {
        await this.markStepDone(runId, 2, 'failed');
        throw new Error(`Failed to checkout commit ${commitHash}`);
      }
      await this.markStepDone(runId, 2, 'success');

      // ---- User-defined steps ----
      for (let i = 0; i < job.steps.length; i++) {
        const step = job.steps[i];
        const stepIndex = i + 3; // offset by system steps

        await this.markStepRunning(runId, stepIndex, step.name);

        if (step.run) {
          const success = await this.runCommandInContainer(
            dockerContainer,
            runId,
            stepIndex,
            `cd workspace && ${step.run}`,
          );
          if (!success) {
            await this.markStepDone(runId, stepIndex, 'failed');
            // Mark remaining steps as skipped
            for (let j = i + 1; j < job.steps.length; j++) {
              await this.markStepDone(runId, j + 3, 'skipped');
            }
            throw new Error(`Step '${step.name}' failed.`);
          }
        }
        await this.markStepDone(runId, stepIndex, 'success');
      }

      // Also keep the old logs field for backward compatibility
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
      if (dockerContainer) {
        await dockerContainer.stop();
        await dockerContainer.remove();
      }
    }
  }

  // ---- Step-level helpers ----

  private async markStepRunning(runId: string, stepIndex: number, stepName: string) {
    const now = new Date();
    await WorkflowRunModel.findByIdAndUpdate(runId, {
      $set: {
        [`steps.${stepIndex}.status`]: 'running',
        [`steps.${stepIndex}.startedAt`]: now,
      },
    });
    this.emitStepUpdate(runId, {
      type: 'step_status',
      stepIndex,
      stepName,
      status: 'running',
      startedAt: now.toISOString(),
    });
  }

  private async markStepDone(
    runId: string,
    stepIndex: number,
    status: 'success' | 'failed' | 'skipped',
  ) {
    const now = new Date();
    const run = await WorkflowRunModel.findById(runId);
    const startedAt = run?.steps?.[stepIndex]?.startedAt;
    const duration = startedAt ? now.getTime() - new Date(startedAt).getTime() : 0;

    await WorkflowRunModel.findByIdAndUpdate(runId, {
      $set: {
        [`steps.${stepIndex}.status`]: status,
        [`steps.${stepIndex}.completedAt`]: now,
        [`steps.${stepIndex}.duration`]: duration,
      },
    });

    this.emitStepUpdate(runId, {
      type: 'step_status',
      stepIndex,
      stepName: run?.steps?.[stepIndex]?.name || '',
      status,
      completedAt: now.toISOString(),
      duration,
    });
  }

  private async appendStepLog(runId: string, stepIndex: number, logChunk: string) {
    this.emitStepUpdate(runId, {
      type: 'step_log',
      stepIndex,
      logChunk,
    });
    // Buffer and flush to DB
    this.appendStepLogBuffered(runId, stepIndex, logChunk);
    await this.flushStepLog(runId, stepIndex);
    // Also append to overall logs for backward compat
    await this.appendLog(runId, logChunk);
  }

  private emitStepUpdate(runId: string, data: Record<string, unknown>) {
    try {
      const socketEmitter = container.resolve<ISocketEmitter>(TOKENS.ISocketEmitter);
      socketEmitter.emitToRoom(`run:${runId}`, 'run_step', { runId, ...data });
    } catch {
      // Ignore if socket not ready
    }
  }

  // ---- Container execution ----

  private stepLogBuffers: Map<string, string> = new Map(); // key: `${runId}:${stepIndex}`
  private stepFlushTimers: Map<string, NodeJS.Timeout> = new Map();
  private stepLogQueues: Map<string, Promise<void>> = new Map();

  private async runCommandInContainer(
    dockerContainer: Docker.Container,
    runId: string,
    stepIndex: number,
    cmd: string,
  ): Promise<boolean> {
    const exec = await dockerContainer.exec({
      Cmd: ['/bin/sh', '-c', cmd],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true, // Prevent Docker multiplexing stream headers
    });
    const stream = (await exec.start({
      Detach: false,
      Tty: true,
    })) as unknown as NodeJS.ReadWriteStream;

    // Stream logs per step in real-time
    stream.on('data', async (chunk: Buffer) => {
      const logString = chunk.toString('utf8');

      // Emit per-step log to frontend immediately
      this.emitStepUpdate(runId, {
        type: 'step_log',
        stepIndex,
        logChunk: logString,
      });

      // Buffer step logs for batched DB writes
      this.appendStepLogBuffered(runId, stepIndex, logString);

      // Also append to overall logs
      await this.appendLog(runId, logString);
    });

    return new Promise((resolve) => {
      stream.on('end', async () => {
        // Flush any remaining step logs to DB
        await this.flushStepLog(runId, stepIndex);
        const inspect = await exec.inspect();
        resolve(inspect.ExitCode === 0);
      });
    });
  }

  private appendStepLogBuffered(runId: string, stepIndex: number, logChunk: string) {
    const key = `${runId}:${stepIndex}`;
    const current = this.stepLogBuffers.get(key) || '';
    this.stepLogBuffers.set(key, current + logChunk);

    if (!this.stepFlushTimers.has(key)) {
      const timer = setTimeout(async () => {
        this.stepFlushTimers.delete(key);
        await this.flushStepLog(runId, stepIndex);
      }, 300);
      this.stepFlushTimers.set(key, timer);
    }
  }

  private async flushStepLog(runId: string, stepIndex: number): Promise<void> {
    const key = `${runId}:${stepIndex}`;

    if (this.stepFlushTimers.has(key)) {
      clearTimeout(this.stepFlushTimers.get(key)!);
      this.stepFlushTimers.delete(key);
    }

    const chunkToSave = this.stepLogBuffers.get(key) || '';
    this.stepLogBuffers.delete(key);

    if (!chunkToSave) return;

    const queue = this.stepLogQueues.get(key) || Promise.resolve();
    const nextQueue = queue.then(async () => {
      try {
        // Use $concat to atomically append logs to the step
        const run = await WorkflowRunModel.findById(runId);
        if (run && run.steps[stepIndex]) {
          run.steps[stepIndex].logs = (run.steps[stepIndex].logs || '') + chunkToSave;
          await run.save();
        }
      } catch (err) {
        console.error('Failed to flush step log:', err);
      }
    });
    this.stepLogQueues.set(key, nextQueue);
    await nextQueue;
  }

  // ---- Legacy log buffering (for the overall `logs` field) ----

  private logQueues: Map<string, Promise<void>> = new Map();
  private logBuffers: Map<string, string> = new Map();
  private flushTimers: Map<string, NodeJS.Timeout> = new Map();

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

  private async appendLog(runId: string, logChunk: string) {
    try {
      const socketEmitter = container.resolve<ISocketEmitter>(TOKENS.ISocketEmitter);
      socketEmitter.emitToRoom(`run:${runId}`, 'run_log', { runId, logChunk });
    } catch {
      // Ignore if socket not ready
    }

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
