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
exports.CreateBranchUseCase = void 0;
const GitService_1 = require("../../../infrastructure/services/GitService");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
let CreateBranchUseCase = class CreateBranchUseCase {
    _gitService;
    _repoRepo;
    _notificationService;
    _branchRepo;
    constructor(_gitService, _repoRepo, _notificationService, _branchRepo) {
        this._gitService = _gitService;
        this._repoRepo = _repoRepo;
        this._notificationService = _notificationService;
        this._branchRepo = _branchRepo;
    }
    async execute(ownerUsername, repoName, newBranch, fromBranch = 'main', actorId, actorUsername) {
        await this._gitService.createBranch(ownerUsername, repoName, newBranch, fromBranch);
        const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
        if (repo) {
            await this._branchRepo.save({
                repositoryId: repo.id,
                branchName: newBranch,
                createdBy: actorId,
                createdAt: new Date(),
            });
            this._notificationService
                .notifyRepoDevelopers({
                actorId,
                actorUsername,
                type: 'branch_created',
                message: `${actorUsername} created branch "${newBranch}"`,
                repositoryId: repo.id,
                repositoryName: repo.name,
            })
                .catch(() => { });
        }
    }
};
exports.CreateBranchUseCase = CreateBranchUseCase;
exports.CreateBranchUseCase = CreateBranchUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IBranchRepository)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, NotificationService_1.NotificationService, Object])
], CreateBranchUseCase);
