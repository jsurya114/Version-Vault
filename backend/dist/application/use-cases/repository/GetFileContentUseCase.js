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
exports.GetFileContentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const RedisClient_1 = require("../../../infrastructure/Redis/RedisClient");
let GetFileContentUseCase = class GetFileContentUseCase {
    gitService;
    constructor(gitService) {
        this.gitService = gitService;
    }
    async execute(ownerUsername, repoName, filePath, branch = 'main') {
        const cacheKey = `git:filecontent:${ownerUsername}:${repoName}:${branch}:${filePath}`;
        const cachedContent = await RedisClient_1.redisClient.get(cacheKey);
        if (cachedContent) {
            return cachedContent;
        }
        const content = await this.gitService.getFileContent(ownerUsername, repoName, filePath, branch);
        // Cache file content for 30 seconds to drop disk I/O on active files
        await RedisClient_1.redisClient.setex(cacheKey, 30, content);
        return content;
    }
};
exports.GetFileContentUseCase = GetFileContentUseCase;
exports.GetFileContentUseCase = GetFileContentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [GitService_1.GitService])
], GetFileContentUseCase);
