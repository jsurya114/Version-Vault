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
exports.ForkRepoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
const enums_1 = require("../../../domain/enums");
const GitService_1 = require("../../../infrastructure/services/GitService");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let ForkRepoUseCase = class ForkRepoUseCase {
    _repoRepo;
    _collabRepo;
    _userRepo;
    _gitService;
    _notificationService;
    _recordActivityUseCase;
    constructor(_repoRepo, _collabRepo, _userRepo, _gitService, _notificationService, _recordActivityUseCase) {
        this._repoRepo = _repoRepo;
        this._collabRepo = _collabRepo;
        this._userRepo = _userRepo;
        this._gitService = _gitService;
        this._notificationService = _notificationService;
        this._recordActivityUseCase = _recordActivityUseCase;
    }
    async execute(dto) {
        //verify source reository exists
        const sourceRepo = await this._repoRepo.findByOwnerAndName(dto.sourceOwnerUsername, dto.sourceRepoName);
        if (!sourceRepo || sourceRepo.isDeleted || sourceRepo.isBlocked) {
            throw new NotFoundError_1.NotFoundError('Source Repository is not found');
        }
        //validate permission must be public or user must be collaborator/owner
        const isOwner = sourceRepo.ownerId.toString() === dto.forkerId;
        let isCollaborator = false;
        if (!isOwner) {
            const collab = await this._collabRepo.findByRepoAndUser(sourceRepo.id, dto.forkerId);
            if (collab)
                isCollaborator = true;
        }
        if (sourceRepo.visibility === enums_1.RepositoryVisibility.PRIVATE && !isOwner && !isCollaborator) {
            throw new UnauthorizedError_1.UnauthorizedError('You do not have permission to fork this repository');
        }
        //ensure the user doesnt already have a repo with the exact same name
        const existingFork = await this._repoRepo.findByOwnerAndName(dto.forkerUsername, sourceRepo.name);
        if (existingFork) {
            throw new ConflictError_1.ConflictError('You already have a repository wiht this name');
        }
        const forkRepo = await this._repoRepo.save({
            name: sourceRepo.name,
            description: sourceRepo.description,
            visibility: sourceRepo.visibility,
            ownerId: dto.forkerId,
            ownerUsername: dto.forkerUsername,
            defaultBranch: sourceRepo.defaultBranch || 'main',
            stars: 0,
            forks: 0,
            size: sourceRepo.size,
            isBlocked: false,
            isDeleted: false,
            isFork: true,
            parentRepoId: sourceRepo.id,
            parentRepoOwnerUsername: sourceRepo.ownerUsername,
        });
        await this._gitService.forkBareRepo(dto.sourceOwnerUsername, dto.sourceRepoName, dto.forkerUsername, dto.sourceRepoName);
        await this._repoRepo.update(sourceRepo.id, {
            forks: (sourceRepo.forks || 0) + 1,
        });
        this._notificationService
            .notifyUser({
            recipientId: sourceRepo.ownerId,
            actorId: dto.forkerId,
            actorUsername: dto.forkerUsername,
            type: 'repo_forked',
            message: `${dto.forkerUsername} forked your repository "${sourceRepo.name}"`,
            repositoryId: sourceRepo.id,
            repositoryName: sourceRepo.name,
        })
            .catch(() => { });
        const forker = await this._userRepo.findById(dto.forkerId);
        this._recordActivityUseCase
            .execute({
            actorId: dto.forkerId,
            actorUsername: dto.forkerUsername,
            actorAvatar: forker?.avatar,
            isPrivate: forkRepo.visibility === enums_1.RepositoryVisibility.PRIVATE,
            actionType: 'forked_repo',
            targetId: forkRepo.id,
            targetName: `${dto.forkerUsername}/${forkRepo.name}`,
        })
            .catch(() => { });
        return RepositoryMapper_1.RepositoryMapper.toDTO(forkRepo);
    }
};
exports.ForkRepoUseCase = ForkRepoUseCase;
exports.ForkRepoUseCase = ForkRepoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(3, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRecordActivityUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, GitService_1.GitService,
        NotificationService_1.NotificationService, Object])
], ForkRepoUseCase);
