import { injectable, inject } from 'tsyringe';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../repository/RepositoryController';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';
import { IAIAgentUseCase } from '../../../../application/use-cases/interfaces/ai-agent/IAIAgentUseCase';

@injectable()
export class AIAgentController {
  constructor(@inject(TOKENS.IAIAgentUseCase) private _aiAgent: IAIAgentUseCase) {}

  async chat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = req.body;
      const { id: ownerId, userId: ownerUsername } = req.user;
      const result = await this._aiAgent.execute(config, ownerId, ownerUsername);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
