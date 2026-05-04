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
exports.CreateCommentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const CommentMapper_1 = require("../../../application/mappers/CommentMapper");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let CreateCommentUseCase = class CreateCommentUseCase {
    _commentRepo;
    _issueRepo;
    _prRepo;
    _notificationService;
    constructor(_commentRepo, _issueRepo, _prRepo, _notificationService) {
        this._commentRepo = _commentRepo;
        this._issueRepo = _issueRepo;
        this._prRepo = _prRepo;
        this._notificationService = _notificationService;
    }
    async execute(dto) {
        const comment = await this._commentRepo.save({
            targetId: dto.targetId,
            targetType: dto.targetType,
            repositoryId: dto.repositoryId,
            authorId: dto.authorId,
            authorUsername: dto.authorUsername,
            content: dto.content,
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
        });
        if (dto.targetType === 'issue') {
            const issue = await this._issueRepo.findById(dto.targetId);
            if (issue) {
                await this._issueRepo.update(dto.targetId, {
                    commentsCount: (issue.commentsCount || 0) + 1,
                });
            }
        }
        else if (dto.targetType === 'pr') {
            const pr = await this._prRepo.findById(dto.targetId);
            if (pr) {
                await this._prRepo.update(dto.targetId, {
                    commentsCount: (pr.commentsCount || 0) + 1,
                });
            }
        }
        // Send mention notifications for @username in comment content
        if (dto.content) {
            let contextTitle = '';
            if (dto.targetType === 'issue') {
                const issue = await this._issueRepo.findById(dto.targetId);
                contextTitle = issue?.title || 'an issue';
            }
            else if (dto.targetType === 'pr') {
                const pr = await this._prRepo.findById(dto.targetId);
                contextTitle = pr?.title || 'a pull request';
            }
            this._notificationService
                .notifyMentionedUsers({
                text: dto.content,
                actorId: dto.authorId,
                actorUsername: dto.authorUsername,
                repositoryId: dto.repositoryId,
                contextType: 'comment',
                contextTitle,
            })
                .catch(() => { });
        }
        return CommentMapper_1.CommentMapper.toResponseDTO(comment);
    }
};
exports.CreateCommentUseCase = CreateCommentUseCase;
exports.CreateCommentUseCase = CreateCommentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICommentRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IIssuesRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, NotificationService_1.NotificationService])
], CreateCommentUseCase);
