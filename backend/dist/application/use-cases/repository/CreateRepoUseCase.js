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
exports.CreateRepoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
const GitService_1 = require("../../../infrastructure/services/GitService");
let CreateRepoUseCase = class CreateRepoUseCase {
    repoRepository;
    userRepository;
    gitService;
    _recordActivityUseCase;
    constructor(repoRepository, userRepository, gitService, _recordActivityUseCase) {
        this.repoRepository = repoRepository;
        this.userRepository = userRepository;
        this.gitService = gitService;
        this._recordActivityUseCase = _recordActivityUseCase;
    }
    async execute(dto) {
        //check the repository exists
        const existing = await this.repoRepository.findByOwnerAndName(dto.ownerUsername, dto.name);
        if (existing)
            throw new ConflictError_1.ConflictError('Repository with this name already exists');
        const repo = await this.repoRepository.save({
            name: dto.name,
            description: dto.description,
            visibility: dto.visibility,
            ownerId: dto.ownerId,
            ownerUsername: dto.ownerUsername,
            defaultBranch: 'main',
            stars: 0,
            forks: 0,
            size: 0,
            isBlocked: false,
            isDeleted: false,
        });
        //initialize base repo on disk
        await this.gitService.initBareRepo(dto.ownerUsername, dto.name);
        const actor = await this.userRepository.findById(dto.ownerId);
        this._recordActivityUseCase
            .execute({
            actorId: dto.ownerId,
            actorUsername: dto.ownerUsername,
            actorAvatar: actor?.avatar,
            isPrivate: dto.visibility === 'private',
            actionType: 'created_repo',
            targetId: repo.id,
            targetName: `${dto.ownerUsername}/${repo.name}`,
        })
            .catch(() => { });
        return RepositoryMapper_1.RepositoryMapper.toDTO(repo);
    }
};
exports.CreateRepoUseCase = CreateRepoUseCase;
exports.CreateRepoUseCase = CreateRepoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(2, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRecordActivityUseCase)),
    __metadata("design:paramtypes", [Object, Object, GitService_1.GitService, Object])
], CreateRepoUseCase);
