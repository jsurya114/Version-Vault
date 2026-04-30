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
exports.BranchController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let BranchController = class BranchController {
    _getBranchUseCase;
    _createBranchUseCase;
    _deleteBranchUseCase;
    _renameBranchUseCase;
    constructor(_getBranchUseCase, _createBranchUseCase, _deleteBranchUseCase, _renameBranchUseCase) {
        this._getBranchUseCase = _getBranchUseCase;
        this._createBranchUseCase = _createBranchUseCase;
        this._deleteBranchUseCase = _deleteBranchUseCase;
        this._renameBranchUseCase = _renameBranchUseCase;
    }
    async getBranches(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const branches = await this._getBranchUseCase.execute(username, reponame);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: branches });
        }
        catch (error) {
            next(error);
        }
    }
    async createBranch(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const { newBranch, fromBranch } = req.body;
            const user = req.user;
            await this._createBranchUseCase.execute(username, reponame, newBranch, fromBranch || 'main', user.id, user.userId);
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.CREATED)
                .json({ success: true, message: `Branch '${newBranch}' created` });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteBranch(req, res, next) {
        try {
            const { username, reponame, branchName } = req.params;
            const user = req.user;
            await this._deleteBranchUseCase.execute(username, reponame, branchName, user.id, user.userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: `Branch '${branchName}' deleted successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async renameBranch(req, res, next) {
        try {
            const { username, reponame, branchName } = req.params;
            const { newBranchName } = req.body;
            const user = req.user;
            await this._renameBranchUseCase.execute(username, reponame, branchName, newBranchName, user.id, user.userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: `Branch '${branchName}' renamed successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.BranchController = BranchController;
exports.BranchController = BranchController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetBranchesUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateBranchUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDeleteBranchUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRenameBranchUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], BranchController);
