import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { TOKENS } from '../../shared/constants/tokens';
import { ISendMessageUseCase } from '../../application/use-cases/interfaces/chats/ISendMessageUseCase';
import { ITokenService } from '../../domain/interfaces/services/ITokenService';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { logger } from '../../shared/logger/Logger';
import { injectable, inject, container } from 'tsyringe';
import { IRepoRepository } from '../../domain/interfaces/repositories/IRepoRepository';

import { ISocketEmitter } from '../../domain/interfaces/services/ISocketEmitter';

@injectable()
export class SocketService implements ISocketEmitter {
  private io: SocketIOServer;
  constructor(
    @inject(TOKENS.ITokenService) private _tokenService: ITokenService,
    @inject(TOKENS.IRepoRepository) private _repoRepo: IRepoRepository,
    @inject(TOKENS.HttpServer) server: HttpServer,
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

  private getSendMessageUseCase(): ISendMessageUseCase {
    return container.resolve<ISendMessageUseCase>(TOKENS.ISendMessageUseCase);
  }

  private initialize() {
    this.io.use((socket: Socket, next) => {
      let token = socket.handshake.auth.token;
      if (!token && socket.handshake.headers.cookie) {
        const cookies: Record<string, string> = {};
        socket.handshake.headers.cookie.split(';').forEach((c) => {
          const [key, val] = c.trim().split('=');
          cookies[key] = val;
        });
        token = cookies.accessToken;
      }
      if (!token) return next(new UnauthorizedError('Authentication Error'));
      const tokenService = this._tokenService;
      try {
        const decoded = tokenService.verifyAccessToken(token);
        socket.data.user = decoded;
        socket.join(`user:${socket.data.user.id}`);
        next();
      } catch (error) {
        next(new UnauthorizedError('Authentication Error'));
        logger.error(error);
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
          const [ownerUsername, name] = data.repositoryId.split('/');
          const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, name);
          if (!repo) {
            logger.error(`Repository not found for socket message: ${data.repositoryId}`);
            return;
          }
          const sendMessage = this.getSendMessageUseCase();
          const savedMessage = await sendMessage.execute({
            repositoryId: repo.id!,
            senderId: socket.data.user.id,
            senderUsername: socket.data.user.userId,
            content: data.content,
          });
          //Notification is now handled inside SendMessageUseCase (SRP)
          const room = data.repositoryId;
          const rooms = this.io.sockets.adapter.rooms.get(room);
          const numClients = rooms ? rooms.size : 0;
          logger.info(`Emitting message to room: ${room} (Clients in room: ${numClients})`);
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

  /**
   * Emit an event to a specific user (by userId).
   * Works because each user joins their own room on connection.
   */
  emitToUser(userId: string, event: string, data: unknown): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}
