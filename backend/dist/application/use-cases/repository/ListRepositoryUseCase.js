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
exports.ListRepoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
//for listing users own repositories
let ListRepoUseCase = class ListRepoUseCase {
    repoRepository;
    constructor(repoRepository) {
        this.repoRepository = repoRepository;
    }
    async execute(ownerId, query, authenticatedUserId) {
        let result;
        if (ownerId === authenticatedUserId) {
            // If user is viewing their own list, show owned + collaborated repos
            result = await this.repoRepository.findUserRepositories(ownerId, query);
        }
        else {
            // If viewing someone else's list, show only their public owned repos
            result = await this.repoRepository.findByOwner(ownerId, query, authenticatedUserId);
        }
        return {
            data: result.data.map(RepositoryMapper_1.RepositoryMapper.toDTO),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.ListRepoUseCase = ListRepoUseCase;
exports.ListRepoUseCase = ListRepoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __metadata("design:paramtypes", [Object])
], ListRepoUseCase);
