"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const tokens_1 = require("../../shared/constants/tokens");
const UnauthorizedError_1 = require("../../domain/errors/UnauthorizedError");
const Logger_1 = require("../../shared/logger/Logger");
const tsyringe_1 = require("tsyringe");
let SocketService = class SocketService {
    _tokenService;
    _repoRepo;
    io;
    constructor(_tokenService, _repoRepo, server) {
        this._tokenService = _tokenService;
        this._repoRepo = _repoRepo;
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        this.initialize();
    }
    getSendMessageUseCase() {
        return tsyringe_1.container.resolve(tokens_1.TOKENS.ISendMessageUseCase);
    }
    initialize() {
        this.io.use((socket, next) => {
            let token = socket.handshake.auth.token;
            if (!token && socket.handshake.headers.cookie) {
                const cookies = {};
                socket.handshake.headers.cookie.split(';').forEach((c) => {
                    const [key, val] = c.trim().split('=');
                    cookies[key] = val;
                });
                token = cookies.accessToken;
            }
            if (!token)
                return next(new UnauthorizedError_1.UnauthorizedError('Authentication Error'));
            const tokenService = this._tokenService;
            try {
                const decoded = tokenService.verifyAccessToken(token);
                socket.data.user = decoded;
                socket.join(`user:${socket.data.user.id}`);
                next();
            }
            catch (error) {
                next(new UnauthorizedError_1.UnauthorizedError('Authentication Error'));
                Logger_1.logger.error(error);
            }
        });
        this.io.on('connection', (socket) => {
            Logger_1.logger.info(`User connected to socket: ${socket.data.user.id}`);
            //user join a repository room
            socket.on('join_repo', (repositoryId) => {
                socket.join(repositoryId);
                Logger_1.logger.info(`User ${socket.data.user.userId} joined repo ${repositoryId}`);
            });
            //user sends message
            socket.on('send_message', async (data) => {
                try {
                    const [ownerUsername, name] = data.repositoryId.split('/');
                    const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, name);
                    if (!repo) {
                        Logger_1.logger.error(`Repository not found for socket message: ${data.repositoryId}`);
                        return;
                    }
                    const sendMessage = this.getSendMessageUseCase();
                    const savedMessage = await sendMessage.execute({
                        repositoryId: repo.id,
                        senderId: socket.data.user.id,
                        senderUsername: socket.data.user.userId,
                        content: data.content,
                    });
                    //Notification is now handled inside SendMessageUseCase (SRP)
                    const room = data.repositoryId;
                    const rooms = this.io.sockets.adapter.rooms.get(room);
                    const numClients = rooms ? rooms.size : 0;
                    Logger_1.logger.info(`Emitting message to room: ${room} (Clients in room: ${numClients})`);
                    this.io.to(data.repositoryId).emit('receive_message', savedMessage);
                }
                catch (error) {
                    Logger_1.logger.error('Error saving message', error);
                }
            });
            socket.on('disconnect', () => {
                Logger_1.logger.info(`User disconnected from socket: ${socket.data.user.id}`);
            });
        });
    }
    /**
     * Emit an event to a specific user (by userId).
     * Works because each user joins their own room on connection.
     */
    emitToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ITokenService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.HttpServer)),
    __metadata("design:paramtypes", [Object, Object, http_1.Server])
], SocketService);
