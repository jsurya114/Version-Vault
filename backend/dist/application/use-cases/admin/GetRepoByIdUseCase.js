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
exports.GetRepoByIdUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
const GitService_1 = require("../../../infrastructure/services/GitService");
const RedisClient_1 = require("../../../infrastructure/Redis/RedisClient");
let GetRepoByIdUseCase = class GetRepoByIdUseCase {
    _repoRepo;
    _gitService;
    constructor(_repoRepo, _gitService) {
        this._repoRepo = _repoRepo;
        this._gitService = _gitService;
    }
    async execute(id) {
        const cacheKey = `admin:repo:${id}`;
        const cachedData = await RedisClient_1.redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
        const repo = await this._repoRepo.findById(id);
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repository not found');
        const dto = RepositoryMapper_1.RepositoryMapper.toDTO(repo);
        const [branchCount, storageBytes, languages] = await Promise.all([
            this._gitService.getBranchCount(repo.ownerUsername, repo.name),
            Promise.resolve(this._gitService.getRepoStorageBytes(repo.ownerUsername, repo.name)),
            this._gitService.getLanguageStats(repo.ownerUsername, repo.name, repo.defaultBranch),
        ]);
        dto.branchCount = branchCount;
        dto.storageBytes = storageBytes;
        dto.languages = languages;
        // Cache the fully populated DTO for 5 minutes (300 seconds)
        await RedisClient_1.redisClient.setex(cacheKey, 300, JSON.stringify(dto));
        return dto;
    }
};
exports.GetRepoByIdUseCase = GetRepoByIdUseCase;
exports.GetRepoByIdUseCase = GetRepoByIdUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [Object, GitService_1.GitService])
], GetRepoByIdUseCase);
