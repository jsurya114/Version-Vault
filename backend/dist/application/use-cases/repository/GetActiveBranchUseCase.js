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
exports.GetActiveBranchUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
let GetActiveBranchUseCase = class GetActiveBranchUseCase {
    _repoRepo;
    _pullrequestRepo;
    _gitService;
    constructor(_repoRepo, _pullrequestRepo, _gitService) {
        this._repoRepo = _repoRepo;
        this._pullrequestRepo = _pullrequestRepo;
        this._gitService = _gitService;
    }
    async execute(ownerUsername, repoName) {
        const repo = await this._repoRepo.findByOwnerAndName(ownerUsername, repoName);
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repository not found');
        const branches = await this._gitService.getBranches(ownerUsername, repoName);
        const defaultBranch = repo.defaultBranch || 'main';
        const activeBranches = [];
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();
        for (const b of branches) {
            if (b.name === defaultBranch)
                continue;
            //is it recent(pushed in last 24h)
            const lastCommitTime = b.lastCommitDate ? new Date(b.lastCommitDate).getTime() : 0;
            if (now - lastCommitTime > ONE_DAY_MS)
                continue;
            //is it ahead of default?
            const ahead = await this._gitService.isAhead(ownerUsername, repoName, defaultBranch, b.name);
            if (!ahead)
                continue;
            //does it already have an open pr
            const pr = await this._pullrequestRepo.findLatestOpenPR(repo.id, b.name, defaultBranch);
            if (pr && pr.mergeApproval !== 'rejected')
                continue;
            activeBranches.push({
                name: b.name,
                lastCommitDate: b.lastCommitDate || '',
                lastCommitAuthor: b.lastCommitAuthor || '',
                lastCommitMessage: b.lastCommitMessage || '',
                isRejected: pr?.mergeApproval === 'rejected',
            });
        }
        //sort by most recently updated
        return activeBranches.sort((a, b) => new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime());
    }
};
exports.GetActiveBranchUseCase = GetActiveBranchUseCase;
exports.GetActiveBranchUseCase = GetActiveBranchUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(2, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [Object, Object, GitService_1.GitService])
], GetActiveBranchUseCase);
