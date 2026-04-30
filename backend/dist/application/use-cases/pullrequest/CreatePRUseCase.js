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
exports.CreatePRUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const PullRequestMapper_1 = require("../../../application/mappers/PullRequestMapper");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let CreatePRUseCase = class CreatePRUseCase {
    prRepo;
    _notificationService;
    constructor(prRepo, _notificationService) {
        this.prRepo = prRepo;
        this._notificationService = _notificationService;
    }
    async execute(dto) {
        const totalExistingPRs = await this.prRepo.countPRsByRepo(dto.repositoryId);
        const nextPrNumber = totalExistingPRs + 1;
        const pr = await this.prRepo.save({
            prNumber: nextPrNumber,
            title: dto.title,
            description: dto.description,
            status: 'open',
            sourceBranch: dto.sourceBranch,
            targetBranch: dto.targetBranch,
            repositoryId: dto.repositoryId,
            authorId: dto.authorId,
            authorUsername: dto.authorUsername,
            reviewers: [],
            commentsCount: 0,
            baseCommitHash: dto.baseCommitHash,
            headCommitHash: dto.headCommitHash,
        });
        this._notificationService
            .notifyRepoDevelopers({
            actorId: dto.authorId,
            actorUsername: dto.authorUsername,
            type: 'pr_created',
            message: `${dto.authorUsername} opened pull request "${dto.title}"`,
            repositoryId: dto.repositoryId,
            metadata: { prId: pr.id },
        })
            .catch(() => { });
        return PullRequestMapper_1.PullRequestMapper.toDTO(pr);
    }
};
exports.CreatePRUseCase = CreatePRUseCase;
exports.CreatePRUseCase = CreatePRUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, NotificationService_1.NotificationService])
], CreatePRUseCase);
