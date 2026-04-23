import { injectable, inject } from 'tsyringe';
import { Response, NextFunction } from 'express';
import { IGetActivityFeedUseCase } from '../../../../application/use-cases/interfaces/activity/IGetFeedActivityFeedUseCase';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';
import { AuthRequest } from '../repository/RepositoryController';
import { PaginationQueryDTO } from 'src/application/dtos/reusable/PaginationDTO';

@injectable()
export class ActivityController {
  constructor(
    @inject(TOKENS.IGetActivityFeedUseCase) private _getFeedUseCase: IGetActivityFeedUseCase,
  ) {}
  async getFeed(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;
      const query: PaginationQueryDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sort: 'createdAt',
        order: req.query.sort === 'oldest' ? 'asc' : 'desc',
      };
      const feed = await this._getFeedUseCase.execute(user.id, query);

      res.status(HttpStatusCodes.OK).json({ success: true, data: feed });
    } catch (error) {
      next(error);
    }
  }
}
