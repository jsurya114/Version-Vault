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
exports.UploadFileController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let UploadFileController = class UploadFileController {
    _uploadFileUseCase;
    constructor(_uploadFileUseCase) {
        this._uploadFileUseCase = _uploadFileUseCase;
    }
    async fileUpload(req, res, next) {
        try {
            const { repositoryName, branch, commitMessage, repoOwnerUsername } = req.body;
            const ownerId = req.user.id;
            const actorUsername = req.user.userId;
            const ownerEmail = req.user.email;
            const targetOwnerUsername = repoOwnerUsername || actorUsername;
            const files = req.files;
            const parsedFiles = files.map((file) => {
                let frontendRelativePath = file.originalname;
                // Multer does not parse relative folder paths easily by default.
                // We will pass an array of `filePaths` in the body that matches the original names
                // to reconstruct the folder structure uploaded from the frontend.
                if (req.body.filePaths) {
                    const pathArray = Array.isArray(req.body.filePaths)
                        ? req.body.filePaths
                        : [req.body.filePaths];
                    // Attempt to match the exact original bucket
                    const match = pathArray.find((p) => p.endsWith(file.originalname));
                    if (match)
                        frontendRelativePath = match;
                }
                return {
                    filePath: frontendRelativePath,
                    tempDiskPath: file.path,
                };
            });
            await this._uploadFileUseCase.execute({
                ownerId,
                ownerUsername: targetOwnerUsername,
                ownerEmail,
                repoName: repositoryName,
                branch,
                commitMessage,
                files: parsedFiles,
            });
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.OK)
                .json({ success: true, message: 'Files uploaded successfully' });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.UploadFileController = UploadFileController;
exports.UploadFileController = UploadFileController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUploadFileUseCase)),
    __metadata("design:paramtypes", [Object])
], UploadFileController);
