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
exports.GetConflictsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
let GetConflictsUseCase = class GetConflictsUseCase {
    _prRepository;
    _repoRepository;
    _gitService;
    constructor(_prRepository, _repoRepository, _gitService) {
        this._prRepository = _prRepository;
        this._repoRepository = _repoRepository;
        this._gitService = _gitService;
    }
    async execute(prId) {
        const pr = await this._prRepository.findById(prId);
        if (!pr)
            throw new NotFoundError_1.NotFoundError('PR not found');
        const repo = await this._repoRepository.findById(pr.repositoryId);
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repository not found');
        return this._gitService.getConflictDetails(repo.ownerUsername, repo.name, pr.sourceBranch, pr.targetBranch);
    }
};
exports.GetConflictsUseCase = GetConflictsUseCase;
exports.GetConflictsUseCase = GetConflictsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [Object, Object, GitService_1.GitService])
], GetConflictsUseCase);
