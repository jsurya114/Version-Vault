import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { container } from 'tsyringe';
import { TOKENS } from '../../shared/constants/tokens';
import { ISendMessageUseCase } from '../../application/use-cases/interfaces/chats/ISendMessageUseCase';
import { ITokenService } from '../../domain/interfaces/services/ITokenService';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { logger } from '../../shared/logger/Logger';
import { injectable, inject } from 'tsyringe';

@injectable()
export class SocketService {
  private io: SocketIOServer;
  constructor(
    server: HttpServer,
    @inject(TOKENS.ITokenService) private _tokenService: ITokenService,
    @inject(TOKENS.ISendMessageUseCase) private _sendMessage: ISendMessageUseCase,
  ) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    this.initialize();
  }

  private initialize() {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new UnauthorizedError('Authentication Error'));

      const tokenService = this._tokenService;

      try {
        const decoded = tokenService.verifyAccessToken(token);
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new UnauthorizedError('Authentication Error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`User connected to socket: ${socket.data.user.id}`);
      //user join a repository room
      socket.on('join_repo', (repositoryId: string) => {
        socket.join(repositoryId);
        logger.info(`User ${socket.data.user.userId} joined repo ${repositoryId}`);
      });

      //user sends message
      socket.on('send_message', async (data: { repositoryId: string; content: string }) => {
        try {
          const sendMessageUseCase = this._sendMessage;
          const savedMessage = await sendMessageUseCase.execute({
            repositoryId: data.repositoryId,
            senderId: socket.data.user.id,
            senderUsername: socket.data.user.userId,
            content: data.content,
          });

          this.io.to(data.repositoryId).emit('receive_message', savedMessage);
        } catch (error) {
          logger.error('Error saving message', error);
        }
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected from socket: ${socket.data.user.id}`);
      });
    });
  }
}
