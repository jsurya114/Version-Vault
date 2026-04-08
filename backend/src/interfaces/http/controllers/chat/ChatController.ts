import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IGetChatHistoryUseCase } from '../../../../application/use-cases/interfaces/chats/IGetChatHistoryUseCase';
import { IDeleteMessageUseCase } from '../../../../application/use-cases/interfaces/chats/IDeleteMessageUsecase';
import { IGetMessageUseCase } from '../../../../application/use-cases/interfaces/chats/IGetMessageUseCase';
import { ISendMessageUseCase } from '../../../../application/use-cases/interfaces/chats/ISendMessageUseCase';
import { PaginationQueryDTO } from '../../../../application/dtos/reusable/PaginationDTO';
import { HttpStatusCodes } from '../../../../shared/constants/HttpStatusCodes';
import { TOKENS } from '../../../../shared/constants/tokens';

import { AuthRequest } from '../repository/RepositoryController';
import { IRepoRepository } from '../../../../domain/interfaces/repositories/IRepoRepository';
@injectable()
export class ChatController {
  constructor(
    @inject(TOKENS.ISendMessageUseCase) private _sendMessageUseCase: ISendMessageUseCase,
    @inject(TOKENS.IDeleteMessageUseCase) private _deleteMessageUseCase: IDeleteMessageUseCase,
    @inject(TOKENS.IGetChatHistoryUseCase) private _getChatUseCase: IGetChatHistoryUseCase,
    @inject(TOKENS.IGetMessageUsecase) private _getMessageUseCase: IGetMessageUseCase,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
  ) {}

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, reponame } = req.params;
      const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
      if (!repo) {
        res
          .status(HttpStatusCodes.NOT_FOUND)
          .json({ success: false, message: 'Repository not found' });
        return;
      }
      const query: PaginationQueryDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: req.query.sort as string,
        order: (req.query.order as 'asc' | 'desc') || 'asc',
        search: req.query.search as string,
      };

      const history = await this._getChatUseCase.execute(repo.id!, query);
      res.status(HttpStatusCodes.OK).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      const { id: userId } = req.user;
      await this._deleteMessageUseCase.execute(messageId, userId);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      const message = await this._getMessageUseCase.execute(messageId);
      if (!message) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Message not found',
        });
        return;
      }
      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { repositoryId } = req.params;
      const { content } = req.body;
      const { id: senderId, userId: senderUsername } = req.user;
      const newMessage = await this._sendMessageUseCase.execute({
        repositoryId,
        senderId,
        senderUsername,
        content,
      });
      res.status(HttpStatusCodes.CREATED).json({
        success: true,
        data: newMessage,
        message: 'Message sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
