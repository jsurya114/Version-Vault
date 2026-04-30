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
exports.CollaboratorController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let CollaboratorController = class CollaboratorController {
    _addCollab;
    _removeCollab;
    _getCollab;
    _updateCollab;
    _checkCollab;
    _sendInvitation;
    _acceptInvitation;
    _declineInvitation;
    _getInvitationByToken;
    _getPendingInvitations;
    _getAllCollabs;
    _repoRepo;
    _userRepo;
    _inviteRepo;
    constructor(_addCollab, _removeCollab, _getCollab, _updateCollab, _checkCollab, _sendInvitation, _acceptInvitation, _declineInvitation, _getInvitationByToken, _getPendingInvitations, _getAllCollabs, _repoRepo, _userRepo, _inviteRepo) {
        this._addCollab = _addCollab;
        this._removeCollab = _removeCollab;
        this._getCollab = _getCollab;
        this._updateCollab = _updateCollab;
        this._checkCollab = _checkCollab;
        this._sendInvitation = _sendInvitation;
        this._acceptInvitation = _acceptInvitation;
        this._declineInvitation = _declineInvitation;
        this._getInvitationByToken = _getInvitationByToken;
        this._getPendingInvitations = _getPendingInvitations;
        this._getAllCollabs = _getAllCollabs;
        this._repoRepo = _repoRepo;
        this._userRepo = _userRepo;
        this._inviteRepo = _inviteRepo;
    }
    // POST /vv/collaborators/:username/:reponame/invite
    async sendInvitation(req, res, next) {
        try {
            const { id: ownerId, userId: ownerUsername } = req.user;
            const { username, reponame } = req.params;
            const { inviteeEmail, role } = req.body;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            if (repo.ownerId !== ownerId) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.FORBIDDEN)
                    .json({ success: false, message: 'Only the owner can send invitations' });
                return;
            }
            const invitation = await this._sendInvitation.execute(ownerId, ownerUsername, repo.id, repo.name, inviteeEmail, role || 'read');
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.CREATED)
                .json({ success: true, message: `Invitation sent to ${inviteeEmail}`, data: invitation });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/collaborators/invitation/:token
    async getInvitationByToken(req, res, next) {
        try {
            const { token } = req.params;
            const invitation = await this._getInvitationByToken.execute(token);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: invitation });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /vv/collaborators/invitation/:token/accept
    async acceptInvitation(req, res, next) {
        try {
            const { token } = req.params;
            const { id: userId, email: userEmail, userId: username } = req.user;
            await this._acceptInvitation.execute(token, userId, userEmail, username);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Invitation accepted. You are now a collaborator.',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /vv/collaborators/invitation/:token/decline
    async declineInvitation(req, res, next) {
        try {
            const { token } = req.params;
            const { id: userId, email: userEmail } = req.params;
            await this._declineInvitation.execute(token, userId, userEmail);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Invitation declined.',
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/collaborators/invitations/pending
    async getPendingInvitations(req, res, next) {
        try {
            const { email } = req.user;
            const invitations = await this._getPendingInvitations.execute(email);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: invitations });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /vv/collaborators/:username/:reponame
    async addCollaborator(req, res, next) {
        try {
            const { id: ownerId, userId: ownerUsername } = req.user;
            const { username, reponame } = req.params;
            const { collaboratorUsername, role } = req.body;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            if (repo.ownerId !== ownerId) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.FORBIDDEN)
                    .json({ success: false, message: 'Only the owner can manage collaborators' });
                return;
            }
            await this._addCollab.execute(ownerId, ownerUsername, repo.id, repo.name, collaboratorUsername, role || 'read');
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({
                success: true,
                message: `${collaboratorUsername} added as collaborator`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /vv/collaborators/:username/:reponame/:collaboratorUsername
    async removeCollaborator(req, res, next) {
        try {
            const { id: ownerId } = req.user;
            const { username, reponame, collaboratorUsername } = req.params;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            if (repo.ownerId !== ownerId) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.FORBIDDEN)
                    .json({ success: false, message: 'Only the owner can manage collaborators' });
                return;
            }
            const targetUser = await this._userRepo.findByUserId(collaboratorUsername);
            if (!targetUser) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
                return;
            }
            await this._removeCollab.execute(ownerId, repo.id, targetUser.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: `${collaboratorUsername} removed from collaborators`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/collaborators/:username/:reponame
    async getCollaborators(req, res, next) {
        try {
            const { username, reponame } = req.params;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            const collaborators = await this._getCollab.execute(repo.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: collaborators });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/collaborators/:username/:reponame/:collaboratorUsername
    async updateRole(req, res, next) {
        try {
            const { id: ownerId } = req.user;
            const { username, reponame, collaboratorUsername } = req.params;
            const { role } = req.body;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            if (repo.ownerId !== ownerId) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.FORBIDDEN)
                    .json({ success: false, message: 'Only the owner can manage collaborators' });
                return;
            }
            const targetUser = await this._userRepo.findByUserId(collaboratorUsername);
            if (!targetUser) {
                res.status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND).json({ success: false, message: 'User not found' });
                return;
            }
            const updated = await this._updateCollab.execute(ownerId, repo.id, targetUser.id, role);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/collaborators/:username/:reponame/check
    async checkAccess(req, res, next) {
        try {
            const { id: userId } = req.user;
            const { username, reponame } = req.params;
            const repo = await this._repoRepo.findByOwnerAndName(username, reponame);
            if (!repo) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.NOT_FOUND)
                    .json({ success: false, message: 'Repository not found' });
                return;
            }
            if (repo.ownerId === userId) {
                res
                    .status(HttpStatusCodes_1.HttpStatusCodes.OK)
                    .json({ success: true, data: { hasAccess: true, role: 'owner' } });
                return;
            }
            const isCollab = await this._checkCollab.execute(repo.id, userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: { hasAccess: isCollab, role: isCollab ? 'collaborator' : null },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCollabsRepo(req, res, next) {
        try {
            const { id: userId } = req.user;
            const data = await this._getAllCollabs.execute(userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.CollaboratorController = CollaboratorController;
exports.CollaboratorController = CollaboratorController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IAddCollaboratorUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRemoveCollaboratorUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetCollaboratorUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUpdateCollaboratorUseCase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICheckCollaboratorUseCase)),
    __param(5, (0, tsyringe_1.inject)(tokens_1.TOKENS.ISendInvitationUseCase)),
    __param(6, (0, tsyringe_1.inject)(tokens_1.TOKENS.IAcceptInvitationUseCase)),
    __param(7, (0, tsyringe_1.inject)(tokens_1.TOKENS.IDeclineInvitationUseCase)),
    __param(8, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetInvitationByTokenUseCase)),
    __param(9, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetPendingInvitationsUseCase)),
    __param(10, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetAllCollabsUseCase)),
    __param(11, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(12, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(13, (0, tsyringe_1.inject)(tokens_1.TOKENS.IInvitationRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], CollaboratorController);
