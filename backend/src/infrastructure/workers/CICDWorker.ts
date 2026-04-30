import { Worker, Job } from 'bullmq';
import { container } from 'tsyringe';
import { DockerRunnerService } from '../services/cicd/DockerRunnerService';
import { WorkflowRunModel } from '../database/mongoose/models/WorkflowRunModel';
import { bullmqConnection } from '../Redis/BullMQConnection';
import { logger } from '../../shared/logger/Logger';

//initialize the runner from the DI container
const runnerService = container.resolve(DockerRunnerService);

export const cicdWorker = new Worker(
  'cicd-queue',
  async (job: Job) => {
    const { workflowJob, runId, repoCloneUrl, commitHash } = job.data;

    //mark run as running
    await WorkflowRunModel.findByIdAndUpdate(runId, { status: 'RUNNING' });

    //execute the job
    const isSuccess = await runnerService.executeJob(workflowJob, runId, repoCloneUrl, commitHash);

    //update final status
    await WorkflowRunModel.findByIdAndUpdate(runId, {
      status: isSuccess ? 'SUCCESS' : 'FAILED',
    });
  },
  { connection: bullmqConnection },
);

cicdWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} has completed!`);
});

cicdWorker.on('failed', (job, err) => {
  logger.info(`Job ${job?.id} has failed with ${err.message}`);
});
