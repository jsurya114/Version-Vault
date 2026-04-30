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
exports.DownloadZipController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const Logger_1 = require("../../../../shared/logger/Logger");
let DownloadZipController = class DownloadZipController {
    _downloadZipUseCase;
    constructor(_downloadZipUseCase) {
        this._downloadZipUseCase = _downloadZipUseCase;
    }
    async downloadZip(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const branch = req.query.branch || 'main';
            const zipStream = await this._downloadZipUseCase.excute(username, reponame, branch);
            //set headers for file download
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${reponame}-${branch}.zip"`);
            //pipe the zip stream directly to the http reponse
            zipStream.pipe(res);
            zipStream.on('error', (err) => {
                Logger_1.logger.error('Error streaming ZIP:', err);
                if (!res.headersSent) {
                    next(err);
                }
                else {
                    res.end();
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.DownloadZipController = DownloadZipController;
exports.DownloadZipController = DownloadZipController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDownloadZipUseCase)),
    __metadata("design:paramtypes", [Object])
], DownloadZipController);
