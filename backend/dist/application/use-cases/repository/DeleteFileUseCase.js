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
exports.DeleteFileUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let DeleteFileUseCase = class DeleteFileUseCase {
    _gitService;
    _repoRepo;
    _notificationService;
    constructor(_gitService, _repoRepo, _notificationService) {
        this._gitService = _gitService;
        this._repoRepo = _repoRepo;
        this._notificationService = _notificationService;
    }
    async execute(dto) {
        await this._gitService.deleteFile(dto.ownerUsername, dto.repoName, dto.branch || 'main', dto.commitMessage || `Delete ${dto.filePath}`, dto.filePath, dto.ownerUsername, dto.ownerEmail);
        const repo = await this._repoRepo.findByOwnerAndName(dto.ownerUsername, dto.repoName);
        if (repo) {
            this._notificationService
                .notifyRepoDevelopers({
                actorId: dto.ownerId,
                actorUsername: dto.ownerUsername,
                type: 'file_deleted',
                message: `${dto.ownerUsername} deleted "${dto.filePath}"`,
                repositoryId: repo.id,
                repositoryName: repo.name,
            })
                .catch(() => { });
        }
    }
};
exports.DeleteFileUseCase = DeleteFileUseCase;
exports.DeleteFileUseCase = DeleteFileUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, NotificationService_1.NotificationService])
], DeleteFileUseCase);
