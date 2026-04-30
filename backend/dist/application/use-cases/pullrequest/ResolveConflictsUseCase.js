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
exports.ResolveConflictsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const PullRequestMapper_1 = require("../../mappers/PullRequestMapper");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const PRValidator_1 = require("../validators/PRValidator");
let ResolveConflictsUseCase = class ResolveConflictsUseCase {
    _prRepository;
    _repoRepository;
    _gitService;
    constructor(_prRepository, _repoRepository, _gitService) {
        this._prRepository = _prRepository;
        this._repoRepository = _repoRepository;
        this._gitService = _gitService;
    }
    async execute(input) {
        const { prId, resolvedFiles, authorName, authorEmail } = input;
        const pr = await PRValidator_1.PRValidator.findOrFail(this._prRepository, prId);
        PRValidator_1.PRValidator.assertOpen(pr, 'merged');
        const repo = await this._repoRepository.findById(pr.repositoryId);
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repository not found');
        // Get commit hashes BEFORE the merge (after merge, branches are identical so diff would be empty)
        const baseCommits = await this._gitService.getCommits(repo.ownerUsername, repo.name, pr.targetBranch, 1);
        const headCommits = await this._gitService.getCommits(repo.ownerUsername, repo.name, pr.sourceBranch, 1);
        // Resolve conflicts and create merge commit
        await this._gitService.resolveConflictsAndMerge(repo.ownerUsername, repo.name, pr.sourceBranch, pr.targetBranch, resolvedFiles, authorName, authorEmail);
        // Mark PR as merged with the pre-merge commit hashes
        const updated = await this._prRepository.update(prId, {
            status: 'merged',
            baseCommitHash: baseCommits[0]?.hash,
            headCommitHash: headCommits[0]?.hash,
        });
        return PullRequestMapper_1.PullRequestMapper.toDTO(updated);
    }
};
exports.ResolveConflictsUseCase = ResolveConflictsUseCase;
exports.ResolveConflictsUseCase = ResolveConflictsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [Object, Object, GitService_1.GitService])
], ResolveConflictsUseCase);
