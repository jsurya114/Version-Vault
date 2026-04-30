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
exports.DownloadZipUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
let DownloadZipUseCase = class DownloadZipUseCase {
    _gitService;
    constructor(_gitService) {
        this._gitService = _gitService;
    }
    async excute(ownerUsername, repoName, branch) {
        return this._gitService.archiveRepo(ownerUsername, repoName, branch);
    }
};
exports.DownloadZipUseCase = DownloadZipUseCase;
exports.DownloadZipUseCase = DownloadZipUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [GitService_1.GitService])
], DownloadZipUseCase);
