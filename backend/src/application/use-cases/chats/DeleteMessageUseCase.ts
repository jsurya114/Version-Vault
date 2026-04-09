import { injectable, inject } from 'tsyringe';
import { IDeleteMessageUseCase } from '../interfaces/chats/IDeleteMessageUsecase';
import { IChatRepository } from '../../../domain/interfaces/repositories/IChatRepository';
import { NotFoundError } from '../../../domain/errors/NotFoundError';
import { TOKENS } from '../../../shared/constants/tokens';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

@injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(@inject(TOKENS.IChatRepository) private _chatRepo: IChatRepository) {}
  async execute(messageId: string, userId: string): Promise<boolean> {
    const existingMessage = await this._chatRepo.findById(messageId);

    if (!existingMessage) {
      throw new NotFoundError('Message not found');
    }

    if (existingMessage.senderId !== userId) {
      throw new UnauthorizedError('Unauthorized. You can only delete your own messages.');
    }
    return await this._chatRepo.delete(messageId);
  }
}
