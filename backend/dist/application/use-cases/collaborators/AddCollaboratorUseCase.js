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
exports.AddCollaboratorUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
let AddCollaboratorUseCase = class AddCollaboratorUseCase {
    _collabRepo;
    _userRepo;
    constructor(_collabRepo, _userRepo) {
        this._collabRepo = _collabRepo;
        this._userRepo = _userRepo;
    }
    async execute(ownerId, ownerUsername, repositoryId, repositoryName, collaboratorUsername, role) {
        if (ownerUsername === collaboratorUsername) {
            throw new ConflictError_1.ConflictError('You cannot add yourself as a collaborator');
        }
        const targetUser = (await this._userRepo.findByUserId(collaboratorUsername)) ||
            (await this._userRepo.findByUserName(collaboratorUsername));
        if (!targetUser) {
            throw new NotFoundError_1.NotFoundError('User not found');
        }
        const existing = await this._collabRepo.findByRepoAndUser(repositoryId, targetUser.id);
        if (existing) {
            throw new ConflictError_1.ConflictError('User is already a collaborator');
        }
        await this._collabRepo.save({
            repositoryId,
            repositoryName,
            ownerId,
            ownerUsername,
            collaboratorId: targetUser.id,
            collaboratorUsername: targetUser.userId,
            role: role || 'read',
        });
    }
};
exports.AddCollaboratorUseCase = AddCollaboratorUseCase;
exports.AddCollaboratorUseCase = AddCollaboratorUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object])
], AddCollaboratorUseCase);
