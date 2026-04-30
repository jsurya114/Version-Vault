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
exports.IssueController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let IssueController = class IssueController {
    _createIssue;
    _getIssue;
    _listIssue;
    _closeIssue;
    _getRepo;
    constructor(_createIssue, _getIssue, _listIssue, _closeIssue, _getRepo) {
        this._createIssue = _createIssue;
        this._getIssue = _getIssue;
        this._listIssue = _listIssue;
        this._closeIssue = _closeIssue;
        this._getRepo = _getRepo;
    }
    // POST /vv/issues/:username/:reponame
    async create(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const { title, description, priority, labels } = req.body;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { id: authorId, userId: authorUsername } = req.user;
            const repo = await this._getRepo.execute(username, reponame);
            const issue = await this._createIssue.execute({
                title,
                description,
                priority,
                labels,
                repositoryId: repo.id,
                authorId,
                authorUsername,
            });
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({ success: true, data: issue });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/issues/:username/:reponame
    async list(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 5,
                sort: req.query.sort,
                order: req.query.order,
                search: req.query.search,
                status: req.query.status,
            };
            const repo = await this._getRepo.execute(username, reponame);
            const result = await this._listIssue.execute(repo.id, query);
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
    // GET /vv/issues/:username/:reponame/:id
    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const issue = await this._getIssue.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: issue });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/issues/:username/:reponame/:id/close
    async close(req, res, next) {
        try {
            const { id } = req.params;
            const issue = await this._closeIssue.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: issue });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.IssueController = IssueController;
exports.IssueController = IssueController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateIssueUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetIssueUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IListIssuesUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICloseIssueUseCase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetRepoUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], IssueController);
