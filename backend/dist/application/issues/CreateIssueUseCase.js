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
exports.CreateIssueUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const IssuesMapper_1 = require("../mappers/IssuesMapper");
const tokens_1 = require("../../shared/constants/tokens");
const NotificationService_1 = require("../../infrastructure/services/NotificationService");
let CreateIssueUseCase = class CreateIssueUseCase {
    _issueRepo;
    _notificationService;
    constructor(_issueRepo, _notificationService) {
        this._issueRepo = _issueRepo;
        this._notificationService = _notificationService;
    }
    async execute(dto) {
        const issue = await this._issueRepo.save({
            title: dto.title,
            description: dto.description,
            status: 'open',
            priority: dto.priority || 'medium',
            repositoryId: dto.repositoryId,
            authorId: dto.authorId,
            authorUsername: dto.authorUsername,
            assignees: dto.assignees || [],
            labels: dto.labels || [],
            commentsCount: 0,
        });
        this._notificationService
            .notifyRepoDevelopers({
            actorId: dto.authorId,
            actorUsername: dto.authorUsername,
            type: 'issue_created',
            message: `${dto.authorUsername} opened issue "${dto.title}"`,
            repositoryId: dto.repositoryId,
            metadata: { issueId: issue.id },
        })
            .catch(() => { });
        // Send mention notifications for @username in description
        if (dto.description) {
            this._notificationService
                .notifyMentionedUsers({
                text: dto.description,
                actorId: dto.authorId,
                actorUsername: dto.authorUsername,
                repositoryId: dto.repositoryId,
                contextType: 'issue',
                contextTitle: dto.title,
            })
                .catch(() => { });
        }
        return IssuesMapper_1.IssueMapper.toDTO(issue);
    }
};
exports.CreateIssueUseCase = CreateIssueUseCase;
exports.CreateIssueUseCase = CreateIssueUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IIssuesRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, NotificationService_1.NotificationService])
], CreateIssueUseCase);
