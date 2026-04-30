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
exports.GetRepoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
const enums_1 = require("../../../domain/enums");
const RedisClient_1 = require("../../../infrastructure/Redis/RedisClient");
let GetRepoUseCase = class GetRepoUseCase {
    repoRepository;
    _collabRepo;
    constructor(repoRepository, _collabRepo) {
        this.repoRepository = repoRepository;
        this._collabRepo = _collabRepo;
    }
    async execute(ownerUsername, name, authenticatedUserId) {
        const cacheKey = `repo:${ownerUsername}:${name}`;
        let repo;
        const cachedRepo = await RedisClient_1.redisClient.get(cacheKey);
        if (cachedRepo) {
            repo = JSON.parse(cachedRepo);
        }
        else {
            repo = await this.repoRepository.findByOwnerAndName(ownerUsername, name);
            if (repo) {
                // Cache the raw repository entity for 5 minutes
                await RedisClient_1.redisClient.setex(cacheKey, 300, JSON.stringify(repo));
            }
        }
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repository not found');
        if (repo.isBlocked) {
            throw new NotFoundError_1.NotFoundError('Repository not found or is currently suspended');
        }
        if (repo.isDeleted) {
            throw new NotFoundError_1.NotFoundError('Repository not found');
        }
        if (repo.visibility === enums_1.RepositoryVisibility.PRIVATE) {
            const isOwner = authenticatedUserId && repo.ownerId?.toString() === authenticatedUserId.toString();
            let iscollabed = false;
            if (!isOwner && authenticatedUserId) {
                const collabCacheKey = `collab:${repo.id}:${authenticatedUserId}`;
                const cachedCollab = await RedisClient_1.redisClient.get(collabCacheKey);
                if (cachedCollab) {
                    iscollabed = JSON.parse(cachedCollab);
                }
                else {
                    const collab = await this._collabRepo.findByRepoAndUser(repo.id, authenticatedUserId);
                    iscollabed = !!collab;
                    await RedisClient_1.redisClient.setex(collabCacheKey, 300, JSON.stringify(iscollabed));
                }
            }
            if (!isOwner && !iscollabed) {
                throw new Error('Repository not found');
            }
        }
        return RepositoryMapper_1.RepositoryMapper.toDTO(repo);
    }
};
exports.GetRepoUseCase = GetRepoUseCase;
exports.GetRepoUseCase = GetRepoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __metadata("design:paramtypes", [Object, Object])
], GetRepoUseCase);
