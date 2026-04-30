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
exports.WorkflowController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let WorkflowController = class WorkflowController {
    _listRunsUseCase;
    _getRunUseCase;
    _getLatestStatusUseCase;
    _repoRepo;
    constructor(_listRunsUseCase, _getRunUseCase, _getLatestStatusUseCase, _repoRepo) {
        this._listRunsUseCase = _listRunsUseCase;
        this._getRunUseCase = _getRunUseCase;
        this._getLatestStatusUseCase = _getLatestStatusUseCase;
        this._repoRepo = _repoRepo;
    }
    async listRuns(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'Repository not found' });
                return;
            }
            const runs = await this._listRunsUseCase.execute(repo.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: runs });
        }
        catch (error) {
            next(error);
        }
    }
    async getRun(req, res, next) {
        try {
            const { runId } = req.params;
            const run = await this._getRunUseCase.execute(runId);
            if (!run) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'Workflow run not found' });
                return;
            }
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: run });
        }
        catch (error) {
            next(error);
        }
    }
    async getLatestStatus(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'Repository not found' });
                return;
            }
            const latestRun = await this._getLatestStatusUseCase.execute(repo.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: latestRun,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.WorkflowController = WorkflowController;
exports.WorkflowController = WorkflowController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IListWorkflowRunsUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetWorkflowRunUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetLatestWorkflowStatusUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkflowController);
