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
exports.PRController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const GitService_1 = require("../../../../infrastructure/services/GitService");
let PRController = class PRController {
    _createPR;
    _getPR;
    _listPRs;
    _mergePR;
    _closePR;
    _getRepo;
    _prReository;
    _gitService;
    _getConflicts;
    _resolveConflicts;
    constructor(_createPR, _getPR, _listPRs, _mergePR, _closePR, _getRepo, _prReository, _gitService, _getConflicts, _resolveConflicts) {
        this._createPR = _createPR;
        this._getPR = _getPR;
        this._listPRs = _listPRs;
        this._mergePR = _mergePR;
        this._closePR = _closePR;
        this._getRepo = _getRepo;
        this._prReository = _prReository;
        this._gitService = _gitService;
        this._getConflicts = _getConflicts;
        this._resolveConflicts = _resolveConflicts;
    }
    // POST /vv/pr/:username/:reponame
    async create(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const { title, description, sourceBranch, targetBranch } = req.body;
            const { id: authorId, userId: authorUsername } = req.user;
            const repo = await this._getRepo.execute(username, reponame, authorId);
            const pr = await this._createPR.execute({
                title,
                description,
                sourceBranch,
                targetBranch,
                repositoryId: repo.id,
                authorId,
                authorUsername,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({ success: true, data: pr });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/pr/:username/:reponame
    async listPr(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const authenticateUser = req.user;
            const authenticateUserId = authenticateUser?.id;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 5,
                sort: req.query.sort,
                order: req.query.order,
                search: req.query.search,
                status: req.query.status,
            };
            const repo = await this._getRepo.execute(username, reponame, authenticateUserId);
            const result = await this._listPRs.execute(repo.id, query);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/pr/:username/:reponame/:id
    async getPr(req, res, next) {
        try {
            const { id } = req.params;
            const pr = await this._getPR.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: pr });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/pr/:username/:reponame/:id/merge
    async merge(req, res, next) {
        try {
            const { id } = req.params;
            const pr = await this._mergePR.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: pr });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/pr/:username/:reponame/:id/close
    async close(req, res, next) {
        try {
            const { id } = req.params;
            const pr = await this._closePR.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: pr });
        }
        catch (error) {
            next(error);
        }
    }
    // Collaborator requests merge approval
    async requestMerge(req, res, next) {
        try {
            const { id } = req.params;
            const pr = await this._prReository.findById(id);
            if (!pr) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'PR not found' });
                return;
            }
            if (pr.status !== 'open') {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.BAD_REQUEST)
                    .json({ success: false, message: 'only open pr can request merge' });
                return;
            }
            if (pr.mergeApproval === 'pending') {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.BAD_REQUEST)
                    .json({ success: false, message: 'Merge request already pending' });
                return;
            }
            await this._prReository.update(id, { mergeApproval: 'pending' });
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.OK)
                .json({ success: true, message: 'Merge request sent to owner for approval' });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/pr/:username/:reponame/:id/approve-merge — Owner approves and merges
    async approveMerge(req, res, next) {
        try {
            const { id } = req.params;
            const pr = await this._prReository.findById(id);
            if (!pr) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'PR not found' });
                return;
            }
            if (pr.mergeApproval !== 'pending') {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.BAD_REQUEST)
                    .json({ success: false, message: 'No pending merge request to approve' });
                return;
            }
            const upatedPr = await this._prReository.update(id, { mergeApproval: 'approved' });
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.OK)
                .json({ success: true, message: 'PR approved and merged', data: upatedPr });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/pr/:username/:reponame/:id/reject-merge — Owner rejects merge request
    async rejectMerge(req, res, next) {
        try {
            const { id } = req.params;
            const pr = await this._prReository.findById(id);
            if (!pr) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'PR not found' });
                return;
            }
            if (pr.mergeApproval !== 'pending') {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.BAD_REQUEST)
                    .json({ success: false, message: 'No pending merge request to approve' });
                return;
            }
            await this._prReository.update(id, { mergeApproval: 'rejected' });
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'Merge request rejected' });
        }
        catch (error) {
            next(error);
        }
    }
    async getConflicts(req, res, next) {
        try {
            const { id } = req.params;
            const conflicts = await this._getConflicts.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: conflicts });
        }
        catch (_error) {
            next(_error);
        }
    }
    async resolveConflicts(req, res, next) {
        try {
            const { id } = req.params;
            const { resolvedFiles } = req.body;
            const { userId: authorUsername } = req.user;
            const pr = await this._resolveConflicts.execute({
                prId: id,
                resolvedFiles,
                authorName: authorUsername,
                authorEmail: `${authorUsername}@version-vault.local`,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Conflicts resolved and PR merged successfully',
                data: pr,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.PRController = PRController;
exports.PRController = PRController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreatePRUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetPRUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IListPRsUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IMergePRUseCase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IClosePRUseCase)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetRepoUseCase)),
    __param(6, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(7, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(8, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetConflictsUseCase)),
    __param(9, (0, tsyringe_1.inject)(tokens_1.TOKENS.IResolveConflictsUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, GitService_1.GitService, Object, Object])
], PRController);
