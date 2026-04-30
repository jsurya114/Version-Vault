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
exports.AcceptInvitationUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
let AcceptInvitationUseCase = class AcceptInvitationUseCase {
    _inviteRepo;
    _collabRepo;
    constructor(_inviteRepo, _collabRepo) {
        this._inviteRepo = _inviteRepo;
        this._collabRepo = _collabRepo;
    }
    async execute(token, userId, userEmail, username) {
        const invitation = await this._inviteRepo.findByToken(token);
        if (!invitation) {
            throw new NotFoundError_1.NotFoundError('Invitation not found');
        }
        if (invitation.status !== 'pending') {
            throw new ConflictError_1.ConflictError(`Invitation has already been ${invitation.status}`);
        }
        if (new Date() > new Date(invitation.expiresAt)) {
            await this._inviteRepo.updateStatus(token, 'expired');
            throw new ConflictError_1.ConflictError('Invitation has expired');
        }
        // Verify the logged-in user matches the invitee email
        if (invitation.inviteeEmail !== userEmail) {
            throw new UnauthorizedError_1.UnauthorizedError('This invitation was sent to a different email address');
        }
        // Check if already a collaborator
        const existingCollab = await this._collabRepo.findByRepoAndUser(invitation.repositoryId, userId);
        if (existingCollab) {
            await this._inviteRepo.updateStatus(token, 'accepted');
            throw new ConflictError_1.ConflictError('You are already a collaborator on this repository');
        }
        await this._collabRepo.save({
            repositoryId: invitation.repositoryId,
            repositoryName: invitation.repositoryName,
            ownerId: invitation.ownerId,
            ownerUsername: invitation.ownerUsername,
            collaboratorId: userId,
            collaboratorUsername: username,
            role: invitation.role,
        });
        await this._inviteRepo.updateStatus(token, 'accepted');
    }
};
exports.AcceptInvitationUseCase = AcceptInvitationUseCase;
exports.AcceptInvitationUseCase = AcceptInvitationUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IInvitationRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __metadata("design:paramtypes", [Object, Object])
], AcceptInvitationUseCase);
