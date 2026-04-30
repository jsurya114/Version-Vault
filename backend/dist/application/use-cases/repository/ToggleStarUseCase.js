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
exports.ToggleStarUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let ToggleStarUseCase = class ToggleStarUseCase {
    _repoRepo;
    _userRepo;
    _notificationService;
    _recordActivityUseCase;
    constructor(_repoRepo, _userRepo, _notificationService, _recordActivityUseCase) {
        this._repoRepo = _repoRepo;
        this._userRepo = _userRepo;
        this._notificationService = _notificationService;
        this._recordActivityUseCase = _recordActivityUseCase;
    }
    async execute(dto) {
        const repo = await this._repoRepo.findByOwnerAndName(dto.ownerUsername, dto.repoName);
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repository not found');
        const starredByArray = repo.starredBy || [];
        const hasStarred = starredByArray.includes(dto.userId);
        if (repo.ownerId === dto.userId) {
            throw new ValidationError_1.ValidationError('You cannot star your own repository');
        }
        let newStarsCount = repo.stars || 0;
        let newStarredBy = [...starredByArray];
        if (hasStarred) {
            newStarredBy = newStarredBy.filter((id) => id !== dto.userId);
            newStarsCount = Math.max(0, newStarsCount - 1);
        }
        else {
            newStarredBy.push(dto.userId);
            newStarsCount += 1;
        }
        await this._repoRepo.update(repo.id, {
            stars: newStarsCount,
            starredBy: newStarredBy,
        });
        // Only notify on star (not unstar)
        if (!hasStarred) {
            const actor = await this._userRepo.findById(dto.userId);
            const actorUsername = actor?.username || 'Someone';
            this._notificationService
                .notifyUser({
                recipientId: repo.ownerId,
                actorId: dto.userId,
                actorUsername,
                type: 'repo_starred',
                message: `${actorUsername} starred your repository "${repo.name}"`,
                repositoryId: repo.id,
                repositoryName: repo.name,
            })
                .catch(() => { });
            this._recordActivityUseCase
                .execute({
                actorId: dto.userId,
                actorUsername,
                actorAvatar: actor?.avatar,
                isPrivate: repo.visibility === 'private',
                actionType: 'starred_repo',
                targetId: repo.id,
                targetName: `${dto.ownerUsername}/${repo.name}`,
            })
                .catch(() => { });
        }
        return { isStarred: !hasStarred, starsCount: newStarsCount };
    }
};
exports.ToggleStarUseCase = ToggleStarUseCase;
exports.ToggleStarUseCase = ToggleStarUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRecordActivityUseCase)),
    __metadata("design:paramtypes", [Object, Object, NotificationService_1.NotificationService, Object])
], ToggleStarUseCase);
