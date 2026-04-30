import { injectable, inject } from 'tsyringe';
import { Queue } from 'bullmq';
import { IYAMLParserService } from '../../../domain/interfaces/services/IYAMLParseService';
import { YAMLParserService } from '../../../infrastructure/services/cicd/YAMLParserService';
import { WorkflowRunModel } from '../../../infrastructure/database/mongoose/models/WorkflowRunModel';

import { bullmqConnection } from '../../../infrastructure/Redis/BullMQConnection';

@injectable()
export class TriggerWorkflowUseCase {
  private cicdQueue: Queue;
  constructor(@inject(YAMLParserService) private yamlParser: IYAMLParserService) {
    this.cicdQueue = new Queue('cicd-queue', {
      connection: bullmqConnection,
    });
  }

  async execute(
    repositoryId: string,
    commitHash: string,
    yamlContent: string,
    repoCloneUrl: string,
  ): Promise<void> {
    //parse the users yaml file
    const workflow = this.yamlParser.parse(yamlContent);
    //save the initial queue state to the db
    const run = await WorkflowRunModel.create({
      repositoryId,
      commitHash,
      status: 'QUEUED',
      logs: '',
    });

    //queue the jobs(Assuming a simple single-job workflow for now)
    const jobs = Object.values(workflow.jobs);
    for (const job of jobs) {
      await this.cicdQueue.add('execute-workflow', {
        workflowJob: job,
        runId: run.id,
        repoCloneUrl,
        commitHash,
      });
    }
  }
}
