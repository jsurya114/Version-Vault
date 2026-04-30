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
exports.DeleteBranchUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let DeleteBranchUseCase = class DeleteBranchUseCase {
    _gitService;
    _repoRepository;
    _notificationService;
    _branchRepo;
    constructor(_gitService, _repoRepository, _notificationService, _branchRepo) {
        this._gitService = _gitService;
        this._repoRepository = _repoRepository;
        this._notificationService = _notificationService;
        this._branchRepo = _branchRepo;
    }
    async execute(username, reponame, branchName, actorId, actorUsername) {
        // check the branch is protected
        if (branchName === 'main' || branchName === 'master') {
            throw new Error('cannot be deleted the main branch');
        }
        const repo = await this._repoRepository.findByOwnerAndName(username, reponame);
        if (!repo) {
            throw new NotFoundError_1.NotFoundError('Repository not found');
        }
        // Owner can delete any branch
        const isOwner = repo.ownerId.toString() === actorId;
        if (!isOwner) {
            // Collaborators can only delete branches they created
            const branchRecord = await this._branchRepo.findByRepoAndBranch(repo.id, branchName);
            if (!branchRecord || branchRecord.createdBy.toString() !== actorId) {
                throw new Error('You can only delete branches that you created');
            }
        }
        await this._gitService.deleteBranch(username, reponame, branchName);
        await this._branchRepo.deleteByRepoAndBranch(repo.id, branchName);
        this._notificationService
            .notifyRepoDevelopers({
            actorId,
            actorUsername,
            type: 'branch_deleted',
            message: `${actorUsername} deleted branch "${branchName}"`,
            repositoryId: repo.id,
            repositoryName: repo.name,
        })
            .catch(() => { });
    }
};
exports.DeleteBranchUseCase = DeleteBranchUseCase;
exports.DeleteBranchUseCase = DeleteBranchUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IBranchRepository)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, NotificationService_1.NotificationService, Object])
], DeleteBranchUseCase);
