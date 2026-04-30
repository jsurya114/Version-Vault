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
exports.ChatController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let ChatController = class ChatController {
    _sendMessageUseCase;
    _deleteMessageUseCase;
    _getChatUseCase;
    _getMessageUseCase;
    _listChatUseCase;
    _repoRepo;
    constructor(_sendMessageUseCase, _deleteMessageUseCase, _getChatUseCase, _getMessageUseCase, _listChatUseCase, _repoRepo) {
        this._sendMessageUseCase = _sendMessageUseCase;
        this._deleteMessageUseCase = _deleteMessageUseCase;
        this._getChatUseCase = _getChatUseCase;
        this._getMessageUseCase = _getMessageUseCase;
        this._listChatUseCase = _listChatUseCase;
        this._repoRepo = _repoRepo;
    }
    async getHistory(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                sort: req.query.sort,
                order: req.query.order || 'asc',
                search: req.query.search,
            };
            const history = await this._getChatUseCase.execute(repo.id, query);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: {
                    data: history.data,
                    meta: {
                        total: history.total,
                        page: history.page,
                        limit: history.limit,
                        totalPages: history.totalPages
                    }
                } });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            const { messageId } = req.params;
            const { id: userId } = req.user;
            await this._deleteMessageUseCase.execute(messageId, userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Message deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMessage(req, res, next) {
        try {
            const { messageId } = req.params;
            const message = await this._getMessageUseCase.execute(messageId);
            if (!message) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Message not found',
                });
                return;
            }
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sendMessage(req, res, next) {
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
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({
                success: true,
                data: newMessage,
                message: 'Message sent successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getChatRepo(req, res, next) {
        try {
            const { id: userId } = req.user;
            const repos = await this._listChatUseCase.execute(userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: repos });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ISendMessageUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDeleteMessageUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetChatHistoryUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetMessageUsecase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IListChatRepoUseCase)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ChatController);
