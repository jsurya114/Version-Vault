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
exports.ListChatRepoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
const Logger_1 = require("../../../shared/logger/Logger");
let ListChatRepoUseCase = class ListChatRepoUseCase {
    _repoRepo;
    _collabRepo;
    constructor(_repoRepo, _collabRepo) {
        this._repoRepo = _repoRepo;
        this._collabRepo = _collabRepo;
    }
    async execute(userId) {
        Logger_1.logger.info(`Fetching chat repositories for user ID: ${userId}`);
        const collaborations = await this._collabRepo.findCollabedRepos(userId);
        Logger_1.logger.info(`Found ${collaborations.length} collaboration records for user ${userId}`);
        const repoIds = [...new Set(collaborations.map((c) => c.repositoryId))];
        if (collaborations.length === 0) {
            Logger_1.logger.warn(`No collaborations found in DB for user ${userId}. Sidebar will be empty.`);
            return [];
        }
        Logger_1.logger.info(`Unique repository IDs to fetch: ${repoIds.join(', ')}`);
        const repos = await Promise.all(repoIds.map(async (id) => {
            const repo = await this._repoRepo.findById(id);
            if (!repo) {
                Logger_1.logger.error(`REPOSITORY DATA MISSING: Found collaboration for repo ID ${id}, but repository document does not exist.`);
            }
            return repo;
        }));
        const filteredRepos = repos.filter((r) => r !== null);
        Logger_1.logger.info(`Successfully mapped ${filteredRepos.length} repositories to DTOs.`);
        return filteredRepos.map(RepositoryMapper_1.RepositoryMapper.toDTO);
    }
};
exports.ListChatRepoUseCase = ListChatRepoUseCase;
exports.ListChatRepoUseCase = ListChatRepoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ListChatRepoUseCase);
