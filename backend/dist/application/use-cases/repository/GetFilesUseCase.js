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
exports.GetFilesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const RedisClient_1 = require("../../../infrastructure/Redis/RedisClient");
let GetFilesUseCase = class GetFilesUseCase {
    gitService;
    constructor(gitService) {
        this.gitService = gitService;
    }
    async execute(ownerUsername, repoName, branch = 'main', path = '', recursive = false) {
        const cacheKey = `git:files:${ownerUsername}:${repoName}:${branch}:${path}:${recursive}`;
        const cachedFiles = await RedisClient_1.redisClient.get(cacheKey);
        if (cachedFiles) {
            return JSON.parse(cachedFiles);
        }
        const files = await this.gitService.getFiles(ownerUsername, repoName, branch, path, recursive);
        // Cache for 30 seconds to drastically reduce disk I/O during heavy traffic 
        // while ensuring code changes show up quickly after a push
        await RedisClient_1.redisClient.setex(cacheKey, 30, JSON.stringify(files));
        return files;
    }
};
exports.GetFilesUseCase = GetFilesUseCase;
exports.GetFilesUseCase = GetFilesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __metadata("design:paramtypes", [GitService_1.GitService])
], GetFilesUseCase);
