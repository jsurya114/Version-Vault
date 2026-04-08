import { CreateMessageDTO } from '../../../../application/dtos/user/CreateMessageDTO';
import { MessageResponseDTO } from '../../../../application/dtos/user/MessageResponseDTO';

export interface ISendMessageUseCase {
  execute(dto: CreateMessageDTO): Promise<MessageResponseDTO>;
}
