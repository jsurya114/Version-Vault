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
exports.DeleteCommentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
let DeleteCommentUseCase = class DeleteCommentUseCase {
    _commentRepo;
    _issueRepo;
    _prRepo;
    constructor(_commentRepo, _issueRepo, _prRepo) {
        this._commentRepo = _commentRepo;
        this._issueRepo = _issueRepo;
        this._prRepo = _prRepo;
    }
    async execute(commentId, requestUserId) {
        const comment = await this._commentRepo.findById(commentId);
        if (!comment)
            throw new NotFoundError_1.NotFoundError('Comment not found');
        if (comment.authorId.toString() !== requestUserId) {
            throw new UnauthorizedError_1.UnauthorizedError('Unauthorized to delete this comment');
        }
        const success = await this._commentRepo.delete(commentId);
        if (success) {
            if (comment.targetType === 'issue') {
                const issue = await this._issueRepo.findById(comment.targetId);
                if (issue) {
                    await this._issueRepo.update(comment.targetId, {
                        commentsCount: Math.max(0, (issue.commentsCount || 0) - 1),
                    });
                }
            }
            else if (comment.targetType === 'pr') {
                const pr = await this._prRepo.findById(comment.targetId);
                if (pr) {
                    await this._prRepo.update(comment.targetId, {
                        commentsCount: Math.max(0, (pr.commentsCount || 0) - 1),
                    });
                }
            }
        }
        return success;
    }
};
exports.DeleteCommentUseCase = DeleteCommentUseCase;
exports.DeleteCommentUseCase = DeleteCommentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICommentRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IIssuesRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DeleteCommentUseCase);
