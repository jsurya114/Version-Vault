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
exports.CommentController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let CommentController = class CommentController {
    _createComment;
    _listComment;
    _deleteComment;
    _getRepo;
    constructor(_createComment, _listComment, _deleteComment, _getRepo) {
        this._createComment = _createComment;
        this._listComment = _listComment;
        this._deleteComment = _deleteComment;
        this._getRepo = _getRepo;
    }
    async createComment(req, res, next) {
        try {
            const { targetType, targetId } = req.params;
            const { content } = req.body;
            const user = req.user;
            // Safety check for the repo from middleware
            const repo = res.locals.repo;
            if (!repo) {
                return next(new Error('Repository context is missing. Verify repoAccessMiddleware is setting res.locals.repo'));
            }
            const comment = await this._createComment.execute({
                targetId,
                targetType: targetType,
                repositoryId: repo.id,
                authorId: user.id,
                authorUsername: user.userId, // Double check if this is .userId or .username in your token!
                content,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({ success: true, data: comment });
        }
        catch (error) {
            next(error);
        }
    }
    async listComment(req, res, next) {
        try {
            const { targetType, targetId } = req.params;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 5,
            };
            const result = await this._listComment.execute(targetId, targetType, query);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { commentId } = req.params;
            const { id: requestUserId } = req.user;
            await this._deleteComment.execute(commentId, requestUserId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'Deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.CommentController = CommentController;
exports.CommentController = CommentController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateCommentUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IListCommentUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDeleteCommentUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetRepoUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CommentController);
