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
exports.BlockRepoUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../..//shared/constants/tokens");
const RepositoryMapper_1 = require("../../../application/mappers/RepositoryMapper");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
let BlockRepoUseCase = class BlockRepoUseCase {
    _adminRepo;
    constructor(_adminRepo) {
        this._adminRepo = _adminRepo;
    }
    async execute(id) {
        const repo = await this._adminRepo.blockRepo(id);
        if (!repo)
            throw new NotFoundError_1.NotFoundError('Repo not found');
        return RepositoryMapper_1.RepositoryMapper.toDTO(repo);
    }
};
exports.BlockRepoUseCase = BlockRepoUseCase;
exports.BlockRepoUseCase = BlockRepoUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IAdminRepoRepository)),
    __metadata("design:paramtypes", [Object])
], BlockRepoUseCase);
