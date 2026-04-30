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
exports.RenameBranchUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
let RenameBranchUseCase = class RenameBranchUseCase {
    _gitService;
    _repoRepo;
    _notifyService;
    _branchRepo;
    constructor(_gitService, _repoRepo, _notifyService, _branchRepo) {
        this._gitService = _gitService;
        this._repoRepo = _repoRepo;
        this._notifyService = _notifyService;
        this._branchRepo = _branchRepo;
    }
    async execute(username, reponame, oldBranchName, newBranchName, actorId, actorUsername) {
        if (oldBranchName === 'main' || oldBranchName === 'master') {
            throw new UnauthorizedError_1.UnauthorizedError('cannot rename the main/master branch');
        }
        const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
        if (!repo) {
            throw new NotFoundError_1.NotFoundError('Repository not found');
        }
        const isOwner = repo.ownerId.toString() === actorId;
        if (!isOwner) {
            const branchRecord = await this._branchRepo.findByRepoAndBranch(repo.id, oldBranchName);
            if (!branchRecord || branchRecord.createdBy.toString() !== actorId) {
                throw new UnauthorizedError_1.UnauthorizedError('You can only rename branches that you created');
            }
        }
        // Git physically renaming the branch
        await this._gitService.renameBranch(username, reponame, oldBranchName, newBranchName);
        // Update in Mongo
        await this._branchRepo.updateBranchName(repo.id, oldBranchName, newBranchName);
        this._notifyService
            .notifyRepoDevelopers({
            actorId,
            actorUsername,
            type: 'branch_updated',
            message: `${actorUsername} renamed branch "${oldBranchName}" to "${newBranchName}"`,
            repositoryId: repo.id,
            repositoryName: repo.name,
        })
            .catch(() => { });
    }
};
exports.RenameBranchUseCase = RenameBranchUseCase;
exports.RenameBranchUseCase = RenameBranchUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IBranchRepository)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, NotificationService_1.NotificationService, Object])
], RenameBranchUseCase);
