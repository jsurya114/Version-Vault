"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cicdWorker = void 0;
const bullmq_1 = require("bullmq");
const tsyringe_1 = require("tsyringe");
const DockerRunnerService_1 = require("../services/cicd/DockerRunnerService");
const WorkflowRunModel_1 = require("../database/mongoose/models/WorkflowRunModel");
const BullMQConnection_1 = require("../Redis/BullMQConnection");
const Logger_1 = require("../../shared/logger/Logger");
//initialize the runner from the DI container
const runnerService = tsyringe_1.container.resolve(DockerRunnerService_1.DockerRunnerService);
exports.cicdWorker = new bullmq_1.Worker('cicd-queue', async (job) => {
    const { workflowJob, runId, repoCloneUrl, commitHash } = job.data;
    //mark run as running
    await WorkflowRunModel_1.WorkflowRunModel.findByIdAndUpdate(runId, { status: 'RUNNING' });
    //execute the job
    const isSuccess = await runnerService.executeJob(workflowJob, runId, repoCloneUrl, commitHash);
    //update final status
    await WorkflowRunModel_1.WorkflowRunModel.findByIdAndUpdate(runId, {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
    });
}, { connection: BullMQConnection_1.bullmqConnection });
exports.cicdWorker.on('completed', (job) => {
    Logger_1.logger.info(`Job ${job.id} has completed!`);
});
exports.cicdWorker.on('failed', (job, err) => {
    Logger_1.logger.info(`Job ${job?.id} has failed with ${err.message}`);
});
