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
exports.RepositoryController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let RepositoryController = class RepositoryController {
    getRepo;
    createRepo;
    listRepo;
    deleteRepo;
    commitUseCase;
    fileContentUseCase;
    filesUseCase;
    branchUseCase;
    _visbilityUseCase;
    _forkRepoUseCase;
    _toggleStarUseCase;
    _getStarsUseCase;
    _getActiveBranch;
    _deleteFileUseCase;
    constructor(getRepo, createRepo, listRepo, deleteRepo, commitUseCase, fileContentUseCase, filesUseCase, branchUseCase, _visbilityUseCase, _forkRepoUseCase, _toggleStarUseCase, _getStarsUseCase, _getActiveBranch, _deleteFileUseCase) {
        this.getRepo = getRepo;
        this.createRepo = createRepo;
        this.listRepo = listRepo;
        this.deleteRepo = deleteRepo;
        this.commitUseCase = commitUseCase;
        this.fileContentUseCase = fileContentUseCase;
        this.filesUseCase = filesUseCase;
        this.branchUseCase = branchUseCase;
        this._visbilityUseCase = _visbilityUseCase;
        this._forkRepoUseCase = _forkRepoUseCase;
        this._toggleStarUseCase = _toggleStarUseCase;
        this._getStarsUseCase = _getStarsUseCase;
        this._getActiveBranch = _getActiveBranch;
        this._deleteFileUseCase = _deleteFileUseCase;
    }
    /**
     * POST /vv/repo
     * Create a new repository
     */
    async createRepository(req, res, next) {
        try {
            const { name, description, visibility } = req.body;
            const { id: ownerId, userId: ownerUsername } = req.user;
            const repo = await this.createRepo.execute({
                name,
                description,
                visibility,
                ownerId,
                ownerUsername,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({ success: true, data: repo });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/repo/:username/:reponame
     * Get a single repository
     */
    async getRepository(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const authRequest = req;
            const authenticatedUserId = authRequest.user?.id;
            const repo = await this.getRepo.execute(username, reponame, authenticatedUserId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: repo });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/repo
     * List all repositories for logged in user
     */
    async listRepository(req, res, next) {
        try {
            const ownerId = req.query.userId || req.user.id;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 5,
                sort: req.query.sort,
                order: req.query.order,
                search: req.query.search,
                status: req.query.status,
                type: req.query.type,
            };
            const authenticatedUserId = req.user?.id;
            const result = await this.listRepo.execute(ownerId, query, authenticatedUserId);
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
    /**
     * DELETE /vv/repo/:username/:reponame
     * Delete a repository
     */
    async deleteRepository(req, res, next) {
        try {
            const { userId: ownerUsername } = req.user;
            const { reponame } = req.params;
            await this.deleteRepo.execute(ownerUsername, reponame);
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.OK)
                .json({ success: true, message: 'Repository deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/repo/:username/:reponame/files
     * Get files in a directory
     */
    async getFiles(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const branch = req.query.branch || 'main';
            const path = req.query.path || '';
            const recursive = req.query.recursive === 'true';
            const files = await this.filesUseCase.execute(username, reponame, branch, path, recursive);
            res.set('Cache-Control', 'no-store');
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: files });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/repo/:username/:reponame/content
     * Get file content
     */
    async getFileContent(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const branch = req.query.branch || 'main';
            const filePath = req.query.path || '';
            const content = await this.fileContentUseCase.execute(username, reponame, filePath, branch);
            res.set('Cache-Control', 'no-store');
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: content });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/repo/:username/:reponame/commits
     * Get commit history
     */
    async getCommit(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const branch = req.query.branch || 'main';
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const commits = await this.commitUseCase.execute(username, reponame, branch, limit);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: commits });
        }
        catch (error) {
            next(error);
        }
    }
    async updateVisibility(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const { visibility } = req.body;
            await this._visbilityUseCase.execute(username, reponame, visibility);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: `Repository is now ${visibility}`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /vv/repo/:username/:reponame/fork
     * Fork an existing repository
     */
    async forkRepository(req, res, next) {
        try {
            const { username: sourceOwnerUsername, reponame: sourceRepoName } = req.params;
            const { id: forkerId, userId: forkerUsername } = req.user;
            const forkedRepo = await this._forkRepoUseCase.execute({
                sourceOwnerUsername,
                sourceRepoName,
                forkerId,
                forkerUsername,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({ success: true, data: forkedRepo });
        }
        catch (error) {
            next(error);
        }
    }
    async toggleStar(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const result = await this._toggleStarUseCase.execute({
                userId,
                ownerUsername: username,
                repoName: reponame,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async getStarredUsers(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const users = await this._getStarsUseCase.execute(username, reponame);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: users });
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveBranches(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const branches = await this._getActiveBranch.execute(username, reponame);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: branches });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteFile(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const { branch, filePath, commitMessage } = req.body;
            const actorId = req.user.id;
            const actorUsername = req.user.userId;
            const actorEmail = req.user.email;
            await this._deleteFileUseCase.execute({
                ownerId: actorId,
                ownerUsername: username || actorUsername,
                ownerEmail: actorEmail,
                repoName: reponame,
                branch,
                filePath,
                commitMessage,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'File deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.RepositoryController = RepositoryController;
exports.RepositoryController = RepositoryController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetRepoUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateRepoUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IListRepoUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDeleteRepoUseCase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetCommitsUseCase)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetFileContentUseCase)),
    __param(6, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetFilesUseCase)),
    __param(7, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetBranchesUseCase)),
    __param(8, (0, tsyringe_1.inject)(tokens_1.TOKENS.IVisibilityUseCase)),
    __param(9, (0, tsyringe_1.inject)(tokens_1.TOKENS.IForkRepoUseCase)),
    __param(10, (0, tsyringe_1.inject)(tokens_1.TOKENS.IToggleStarUseCase)),
    __param(11, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetStarsUseCase)),
    __param(12, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetActiveBranchUseCase)),
    __param(13, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDeleteFileUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], RepositoryController);
