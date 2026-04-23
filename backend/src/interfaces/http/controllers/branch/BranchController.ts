import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IGetBranchesUseCase } from '../../../../application/use-cases/interfaces/branch/IGetBranchesUseCase';
import { ICreateBranchUseCase } from '../../../../application/use-cases/interfaces/branch/ICreateBranchUseCase';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IDeleteBranchUseCase } from '../../../../application/use-cases/interfaces/branch/IDeleteBranchUseCase';
import { AuthRequest } from '../repository/RepositoryController';
import { IRenameBranchUseCase } from '../../../../application/use-cases/interfaces/branch/IRenameBranchUseCase';

@injectable()
export class BranchController {
  constructor(
    @inject(TOKENS.IGetBranchesUseCase) private _getBranchUseCase: IGetBranchesUseCase,
    @inject(TOKENS.ICreateBranchUseCase) private _createBranchUseCase: ICreateBranchUseCase,
    @inject(TOKENS.IDeleteBranchUseCase) private _deleteBranchUseCase: IDeleteBranchUseCase,
    @inject(TOKENS.IRenameBranchUseCase) private _renameBranchUseCase: IRenameBranchUseCase,
  ) {}

  async getBranches(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const branches = await this._getBranchUseCase.execute(username, reponame);
      res.status(HttpStatusCodes.OK).json({ success: true, data: branches });
    } catch (error) {
      next(error);
    }
  }
  async createBranch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const { newBranch, fromBranch } = req.body;
      const user = (req as AuthRequest).user;
      await this._createBranchUseCase.execute(
        username,
        reponame,
        newBranch,
        fromBranch || 'main',
        user.id,
        user.userId,
      );
      res
        .status(HttpStatusCodes.CREATED)
        .json({ success: true, message: `Branch '${newBranch}' created` });
    } catch (error) {
      next(error);
    }
  }

  async deleteBranch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame, branchName } = req.params;
      const user = (req as AuthRequest).user;
      await this._deleteBranchUseCase.execute(username, reponame, branchName, user.id, user.userId);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: `Branch '${branchName}' deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
  async renameBranch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame, branchName } = req.params;
      const { newBranchName } = req.body;
      const user = req.user;
      await this._renameBranchUseCase.execute(
        username,
        reponame,
        branchName,
        newBranchName,
        user.id,
        user.userId,
      );
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: `Branch '${branchName}' renamed successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
}
