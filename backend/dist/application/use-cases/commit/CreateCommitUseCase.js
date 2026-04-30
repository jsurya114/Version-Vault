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
exports.CreateCommitUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
const TriggerWorkflowUseCase_1 = require("../cicd/TriggerWorkflowUseCase");
const env_config_1 = require("../../../shared/config/env.config");
const defaultPipeline_1 = require("../../../shared/constants/defaultPipeline");
const RedisClient_1 = require("../../../infrastructure/Redis/RedisClient");
let CreateCommitUseCase = class CreateCommitUseCase {
    gitService;
    _repoRepo;
    _notificationService;
    _triggerWorkflowUseCase;
    constructor(gitService, _repoRepo, _notificationService, _triggerWorkflowUseCase) {
        this.gitService = gitService;
        this._repoRepo = _repoRepo;
        this._notificationService = _notificationService;
        this._triggerWorkflowUseCase = _triggerWorkflowUseCase;
    }
    async execute(username, reponame, data, actorId, actorUsername) {
        await this.gitService.commitChanges(username, reponame, data.branch, data.message, data.filePath, data.content, data.authorName, data.authorEmail);
        // Invalidate git caches so the UI updates immediately
        const keys1 = await RedisClient_1.redisClient.keys(`git:filecontent:${username}:${reponame}:${data.branch}:*`);
        const keys2 = await RedisClient_1.redisClient.keys(`git:files:${username}:${reponame}:${data.branch}:*`);
        const allKeys = [...keys1, ...keys2];
        if (allKeys.length > 0) {
            await RedisClient_1.redisClient.del(...allKeys);
        }
        const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
        if (repo) {
            // 1. Notify developers
            this._notificationService
                .notifyRepoDevelopers({
                actorId,
                actorUsername,
                type: 'new_commit',
                message: `${actorUsername} pushed a commit: "${data.message}"`,
                repositoryId: repo.id,
                repositoryName: repo.name,
            })
                .catch(() => { });
            // 2. CI/CD: Trigger pipeline automatically on every push
            try {
                const commits = await this.gitService.getCommits(username, reponame, data.branch, 1);
                const commitHash = commits.length > 0 ? commits[0].hash : 'latest';
                const repoCloneUrl = `http://host.docker.internal:${env_config_1.envConfig.PORT}/vv/git/${username}/${reponame}.git`;
                await this._triggerWorkflowUseCase.execute(repo.id, commitHash, defaultPipeline_1.DEFAULT_PIPELINE, repoCloneUrl);
            }
            catch (error) {
                console.error('Failed to trigger CI/CD workflow:', error);
            }
        }
    }
};
exports.CreateCommitUseCase = CreateCommitUseCase;
exports.CreateCommitUseCase = CreateCommitUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(TriggerWorkflowUseCase_1.TriggerWorkflowUseCase)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, NotificationService_1.NotificationService,
        TriggerWorkflowUseCase_1.TriggerWorkflowUseCase])
], CreateCommitUseCase);
