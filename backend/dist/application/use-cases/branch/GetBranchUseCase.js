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
exports.GetBranchesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const Logger_1 = require("../../../shared/logger/Logger");
let GetBranchesUseCase = class GetBranchesUseCase {
    gitService;
    _prRepo;
    _repoRepo;
    _userRepo;
    _branchRepo;
    constructor(gitService, _prRepo, _repoRepo, _userRepo, _branchRepo) {
        this.gitService = gitService;
        this._prRepo = _prRepo;
        this._repoRepo = _repoRepo;
        this._userRepo = _userRepo;
        this._branchRepo = _branchRepo;
    }
    async execute(ownerUsername, repoName) {
        const branches = await this.gitService.getBranches(ownerUsername, repoName);
        const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
        if (!repo) {
            Logger_1.logger.warn('Repo not found: ' + ownerUsername + '/' + repoName);
            return branches;
        }
        Logger_1.logger.info('Repo ID: ' + repo.id);
        const prs = await this._prRepo.findByRepo(repo.id, { page: 1, limit: 100 });
        const branchRecords = await this._branchRepo.find({ repositoryId: repo.id });
        return Promise.all(branches.map(async (branch) => {
            // Find the latest PR associated with this branch, regardless of if it's open, closed or merged
            const matchingPr = prs.data.find((pr) => pr.sourceBranch.trim() === branch.name.trim());
            const branchRecord = branchRecords.find((r) => r.branchName === branch.name);
            let createdByUsername = branch.lastCommitAuthor;
            if (branchRecord && branch.ahead === 0) {
                const creator = await this._userRepo.findById(branchRecord.createdBy.toString());
                if (creator) {
                    createdByUsername = creator.username;
                }
            }
            return {
                ...branch,
                lastCommitAuthor: createdByUsername,
                createdBy: branchRecord ? branchRecord.createdBy.toString() : undefined,
                prId: matchingPr ? matchingPr.id : undefined,
                prNumber: matchingPr ? matchingPr.prNumber : undefined,
                prStatus: matchingPr ? matchingPr.status : undefined,
            };
        }));
    }
};
exports.GetBranchesUseCase = GetBranchesUseCase;
exports.GetBranchesUseCase = GetBranchesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IBranchRepository)),
    __metadata("design:paramtypes", [GitService_1.GitService, Object, Object, Object, Object])
], GetBranchesUseCase);
