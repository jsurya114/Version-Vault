import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IListWorkflowRunsUseCase } from '../../../../application/use-cases/interfaces/cicd/IListWorkflowRunsUseCase';
import { IGetWorkflowRunUseCase } from '../../../../application/use-cases/interfaces/cicd/IGetWorkflowRunUseCase';
import { IGetLatestWorkflowStatusUseCase } from '../../../../application/use-cases/interfaces/cicd/IGetLatestWorkflowStatusUseCase';
import { IRepoRepository } from '../../../../domain/interfaces/repositories/IRepoRepository';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';

@injectable()
export class WorkflowController {
  constructor(
    @inject(TOKENS.IListWorkflowRunsUseCase) private _listRunsUseCase: IListWorkflowRunsUseCase,
    @inject(TOKENS.IGetWorkflowRunUseCase) private _getRunUseCase: IGetWorkflowRunUseCase,
    @inject(TOKENS.IGetLatestWorkflowStatusUseCase)
    private _getLatestStatusUseCase: IGetLatestWorkflowStatusUseCase,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
  ) {}

  async listRuns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);

      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }

      const runs = await this._listRunsUseCase.execute(repo.id as string);
      res.status(HttpStatusCodes.OK).json({ success: true, data: runs });
    } catch (error) {
      next(error);
    }
  }

  async getRun(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { runId } = req.params;
      const run = await this._getRunUseCase.execute(runId);

      if (!run) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Workflow run not found' });
        return;
      }

      res.status(HttpStatusCodes.OK).json({ success: true, data: run });
    } catch (error) {
      next(error);
    }
  }

  async getLatestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);

      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }

      const latestRun = await this._getLatestStatusUseCase.execute(repo.id as string);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: latestRun,
      });
    } catch (error) {
      next(error);
    }
  }
}
