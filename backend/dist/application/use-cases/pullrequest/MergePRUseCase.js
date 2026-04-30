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
exports.MergePRUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const PullRequestMapper_1 = require("../../../application/mappers/PullRequestMapper");
const tokens_1 = require("../../../shared/constants/tokens");
const PRValidator_1 = require("../validators/PRValidator");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
const TriggerWorkflowUseCase_1 = require("../cicd/TriggerWorkflowUseCase");
const env_config_1 = require("../../../shared/config/env.config");
const defaultPipeline_1 = require("../../../shared/constants/defaultPipeline");
let MergePRUseCase = class MergePRUseCase {
    _prRepository;
    _repoRepository;
    _gitService;
    _notificationService;
    _triggerWorkflowUseCase;
    _getLatestStatusUseCase;
    constructor(_prRepository, _repoRepository, _gitService, _notificationService, _triggerWorkflowUseCase, _getLatestStatusUseCase) {
        this._prRepository = _prRepository;
        this._repoRepository = _repoRepository;
        this._gitService = _gitService;
        this._notificationService = _notificationService;
        this._triggerWorkflowUseCase = _triggerWorkflowUseCase;
        this._getLatestStatusUseCase = _getLatestStatusUseCase;
    }
    async execute(id) {
        const pr = await PRValidator_1.PRValidator.findOrFail(this._prRepository, id);
        PRValidator_1.PRValidator.assertOpen(pr, 'merged');
        //  we need the Repository details to get the ownerUsername and repo name
        const repo = await this._repoRepository.findById(pr.repositoryId);
        if (!repo) {
            throw new NotFoundError_1.NotFoundError('Repository not found for this pull request');
        }
        // Branch Protection: Block merge if the latest CI/CD pipeline has failed
        const latestRun = await this._getLatestStatusUseCase.execute(repo.id);
        if (latestRun) {
            if (latestRun.status === 'FAILED') {
                throw new Error('Cannot merge: the latest CI/CD pipeline has failed. Fix the issues and push again.');
            }
            if (latestRun.status === 'RUNNING' || latestRun.status === 'QUEUED') {
                throw new Error('Cannot merge: a CI/CD pipeline is still in progress. Wait for it to complete.');
            }
        }
        const baseCommits = await this._gitService.getCommits(repo.ownerUsername, repo.name, pr.targetBranch, 1);
        const headCommits = await this._gitService.getCommits(repo.ownerUsername, repo.name, pr.sourceBranch, 1);
        // Perform the actual Git merge using your new GitService method
        await this._gitService.mergeBranch(repo.ownerUsername, repo.name, pr.sourceBranch, pr.targetBranch);
        const updated = await this._prRepository.update(id, {
            status: 'merged',
            baseCommitHash: baseCommits[0]?.hash,
            headCommitHash: headCommits[0]?.hash,
        });
        this._notificationService
            .notifyRepoDevelopers({
            actorId: pr.authorId,
            actorUsername: pr.authorUsername,
            type: 'pr_merged',
            message: `Pull request "${pr.title}" was merged`,
            repositoryId: pr.repositoryId,
            repositoryName: repo.name,
            metadata: { prId: pr.id },
        })
            .catch(() => { });
        // CI/CD: Auto-trigger pipeline after merge
        try {
            const mergeCommits = await this._gitService.getCommits(repo.ownerUsername, repo.name, pr.targetBranch, 1);
            const commitHash = mergeCommits.length > 0 ? mergeCommits[0].hash : 'merge';
            const repoCloneUrl = `http://host.docker.internal:${env_config_1.envConfig.PORT}/vv/git/${repo.ownerUsername}/${repo.name}.git`;
            await this._triggerWorkflowUseCase.execute(repo.id, commitHash, defaultPipeline_1.DEFAULT_PIPELINE, repoCloneUrl);
        }
        catch (error) {
            console.error('Failed to trigger CI/CD after PR merge:', error);
        }
        return PullRequestMapper_1.PullRequestMapper.toDTO(updated);
    }
};
exports.MergePRUseCase = MergePRUseCase;
exports.MergePRUseCase = MergePRUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(4, (0, tsyringe_1.inject)(TriggerWorkflowUseCase_1.TriggerWorkflowUseCase)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetLatestWorkflowStatusUseCase)),
    __metadata("design:paramtypes", [Object, Object, GitService_1.GitService,
        NotificationService_1.NotificationService,
        TriggerWorkflowUseCase_1.TriggerWorkflowUseCase, Object])
], MergePRUseCase);
