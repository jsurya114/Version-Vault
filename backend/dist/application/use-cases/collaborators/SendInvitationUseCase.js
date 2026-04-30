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
exports.SendInvitationUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const crypto_1 = require("crypto");
const tokens_1 = require("../../../shared/constants/tokens");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const env_config_1 = require("../../../shared/config/env.config");
let SendInvitationUseCase = class SendInvitationUseCase {
    _inviteRepo;
    _collabRepo;
    _emailService;
    _userRepo;
    constructor(_inviteRepo, _collabRepo, _emailService, _userRepo) {
        this._inviteRepo = _inviteRepo;
        this._collabRepo = _collabRepo;
        this._emailService = _emailService;
        this._userRepo = _userRepo;
    }
    async execute(ownerId, ownerUsername, repositoryId, repositoryName, inviteeEmail, role) {
        const owner = await this._userRepo.findById(ownerId);
        if (owner && owner.email === inviteeEmail) {
            throw new ConflictError_1.ConflictError('You cannot invite yourself');
        }
        const existingUser = await this._userRepo.findByEmail(inviteeEmail);
        if (existingUser) {
            const existingCollab = await this._collabRepo.findByRepoAndUser(repositoryId, existingUser.id);
            if (existingCollab) {
                throw new ConflictError_1.ConflictError('User is already a collaborator');
            }
        }
        const existingInvitation = await this._inviteRepo.findPendingByRepoAndEmail(repositoryId, inviteeEmail);
        if (existingInvitation) {
            throw new ConflictError_1.ConflictError('An invitation is already pending for this user');
        }
        const token = (0, crypto_1.randomUUID)();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //7days
        const invitation = await this._inviteRepo.save({
            token,
            repositoryId,
            repositoryName,
            ownerId,
            ownerUsername,
            inviteeEmail,
            inviteeUserId: existingUser?.id,
            inviteeUsername: existingUser?.userId,
            role: role || 'read',
            status: 'pending',
            expiresAt,
        });
        const inviteLink = `${env_config_1.envConfig.CLIENT_URL}/invitation/accept/${token}`;
        // Fire and forget the email so a network timeout doesn't block the API response for 75 seconds.
        this._emailService
            .sendInvitationEmail(inviteeEmail, ownerUsername, repositoryName, role || 'read', inviteLink)
            .catch((err) => console.error('Email failed to send, but invitation created in DB:', err.message));
        return invitation;
    }
};
exports.SendInvitationUseCase = SendInvitationUseCase;
exports.SendInvitationUseCase = SendInvitationUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IInvitationRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IEmailService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], SendInvitationUseCase);
