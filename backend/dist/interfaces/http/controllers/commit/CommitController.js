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
exports.CommitController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let CommitController = class CommitController {
    _createCommitUseCase;
    _compareCommitUseCase;
    constructor(_createCommitUseCase, _compareCommitUseCase) {
        this._createCommitUseCase = _createCommitUseCase;
        this._compareCommitUseCase = _compareCommitUseCase;
    }
    async createCommit(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const { branch, message, filePath, content } = req.body;
            const { id: actorId, userId: authorUsername, email: authorEmail } = req.user;
            await this._createCommitUseCase.execute(username, reponame, {
                branch,
                message,
                filePath,
                content,
                authorName: authorUsername,
                authorEmail: authorEmail,
            }, actorId, authorUsername);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Changes committed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async compareCommit(req, res, next) {
        try {
            const { username, reponame, base, head } = req.params;
            const result = await this._compareCommitUseCase.execute(username, reponame, base, head);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json(result);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.CommitController = CommitController;
exports.CommitController = CommitController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateCommitUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICompareCommitUseCase)),
    __metadata("design:paramtypes", [Object, Object])
], CommitController);
