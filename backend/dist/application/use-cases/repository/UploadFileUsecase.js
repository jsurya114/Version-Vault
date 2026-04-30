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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
const TriggerWorkflowUseCase_1 = require("../cicd/TriggerWorkflowUseCase");
const env_config_1 = require("../../../shared/config/env.config");
const defaultPipeline_1 = require("../../../shared/constants/defaultPipeline");
const fs_1 = __importDefault(require("fs"));
const RedisClient_1 = require("../../../infrastructure/Redis/RedisClient");
let UploadFileUseCase = class UploadFileUseCase {
    _gitService;
    _repoRepo;
    _notificationService;
    _triggerWorkflowUseCase;
    constructor(_gitService, _repoRepo, _notificationService, _triggerWorkflowUseCase) {
        this._gitService = _gitService;
        this._repoRepo = _repoRepo;
        this._notificationService = _notificationService;
        this._triggerWorkflowUseCase = _triggerWorkflowUseCase;
    }
    async execute(dto) {
        try {
            // Filter out files inside .git directories as Git will reject them
            const validFiles = dto.files.filter((file) => {
                const isGitInternal = file.filePath.startsWith('.git/') || file.filePath.includes('/.git/');
                if (isGitInternal) {
                    // Attempt to cleanup right away if we are ignoring them
                    if (fs_1.default.existsSync(file.tempDiskPath)) {
                        fs_1.default.unlinkSync(file.tempDiskPath);
                    }
                }
                return !isGitInternal;
            });
            if (validFiles.length === 0) {
                return; // Nothing to commit
            }
            await this._gitService.commitMultipleFiles(dto.ownerUsername, dto.repoName, dto.branch || 'main', dto.commitMessage || 'Initial commit via web upload', validFiles, dto.ownerUsername, dto.ownerEmail);
            // Invalidate git caches so the UI updates immediately
            const branch = dto.branch || 'main';
            const keys1 = await RedisClient_1.redisClient.keys(`git:filecontent:${dto.ownerUsername}:${dto.repoName}:${branch}:*`);
            const keys2 = await RedisClient_1.redisClient.keys(`git:files:${dto.ownerUsername}:${dto.repoName}:${branch}:*`);
            const allKeys = [...keys1, ...keys2];
            if (allKeys.length > 0) {
                await RedisClient_1.redisClient.del(...allKeys);
            }
            const repo = await this._repoRepo.findByOwnerAndName(dto.ownerUsername, dto.repoName);
            if (repo) {
                const fileCount = dto.files.length;
                this._notificationService
                    .notifyRepoDevelopers({
                    actorId: dto.ownerId,
                    actorUsername: dto.ownerUsername,
                    type: 'file_added',
                    message: `${dto.ownerUsername} uploaded ${fileCount} file${fileCount > 1 ? 's' : ''}`,
                    repositoryId: repo.id,
                    repositoryName: repo.name,
                })
                    .catch(() => { });
                // CI/CD: Trigger pipeline automatically on upload
                try {
                    const commits = await this._gitService.getCommits(dto.ownerUsername, dto.repoName, dto.branch || 'main', 1);
                    const commitHash = commits.length > 0 ? commits[0].hash : 'latest';
                    const repoCloneUrl = `http://host.docker.internal:${env_config_1.envConfig.PORT}/vv/git/${dto.ownerUsername}/${dto.repoName}.git`;
                    await this._triggerWorkflowUseCase.execute(repo.id, commitHash, defaultPipeline_1.DEFAULT_PIPELINE, repoCloneUrl);
                }
                catch (error) {
                    console.error('Failed to trigger CI/CD workflow:', error);
                }
            }
        }
        finally {
            // Cleanup multer files after they securely exist in Git Object s
            for (const file of dto.files) {
                if (fs_1.default.existsSync(file.tempDiskPath)) {
                    fs_1.default.unlinkSync(file.tempDiskPath);
                }
            }
        }
    }
};
exports.UploadFileUseCase = UploadFileUseCase;
exports.UploadFileUseCase = UploadFileUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(TriggerWorkflowUseCase_1.TriggerWorkflowUseCase)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, NotificationService_1.NotificationService,
        TriggerWorkflowUseCase_1.TriggerWorkflowUseCase])
], UploadFileUseCase);
