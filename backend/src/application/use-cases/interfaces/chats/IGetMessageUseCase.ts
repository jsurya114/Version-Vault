import { MessageResponseDTO } from '../../../../application/dtos/user/MessageResponseDTO';

export interface IGetMessageUseCase {
  execute(messageId: string): Promise<MessageResponseDTO | null>;
}
