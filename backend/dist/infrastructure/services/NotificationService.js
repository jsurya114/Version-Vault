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
exports.NotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../shared/constants/tokens");
const Logger_1 = require("../../shared/logger/Logger");
let NotificationService = class NotificationService {
    _notificationRepo;
    _collabRepo;
    _repoRepo;
    _socketEmitter;
    constructor(_notificationRepo, _collabRepo, _repoRepo, _socketEmitter) {
        this._notificationRepo = _notificationRepo;
        this._collabRepo = _collabRepo;
        this._repoRepo = _repoRepo;
        this._socketEmitter = _socketEmitter;
    }
    /**
     * Send notification to a SINGLE user.
     * Use for: follow, unfollow, fork, star
     */
    async notifyUser(params) {
        try {
            //dont notify yourself
            if (params.actorId === params.recipientId)
                return;
            const notification = await this._notificationRepo.save({
                ...params,
                isRead: false,
            });
            this._socketEmitter.emitToUser(params.recipientId, 'notification', notification);
        }
        catch (error) {
            Logger_1.logger.error('failed to send notification:', error);
        }
    }
    /**
     * Send notification to ALL developers on a repo (owner + collaborators),
     * excluding the actor.
     * Use for: branch, PR, issue, file, commit, chat events
     */
    async notifyRepoDevelopers(params) {
        try {
            //get repo to find the owner
            const repo = await this._repoRepo.findById(params.repositoryId);
            if (!repo)
                return;
            //get all collaborators on this repo
            const collaborators = await this._collabRepo.findByRepository(params.repositoryId);
            //build reciept list:onwer+all collaborator IDs, minus the actor
            const recipientIds = new Set();
            recipientIds.add(repo.ownerId); //add owner
            for (const collab of collaborators) {
                recipientIds.add(collab.collaboratorId);
            }
            recipientIds.delete(params.actorId); //exculde the actor
            // Create all notifications in a single batch insert
            const notificationPayloads = Array.from(recipientIds).map((recipientId) => ({
                recipientId,
                actorId: params.actorId,
                actorUsername: params.actorUsername,
                type: params.type,
                message: params.message,
                repositoryId: params.repositoryId,
                repositoryName: params.repositoryName || repo.name,
                metadata: params.metadata,
                isRead: false,
            }));
            if (notificationPayloads.length > 0) {
                const notifications = await this._notificationRepo.insertMany(notificationPayloads);
                // Emit socket events for each created notification
                notifications.forEach((notification) => {
                    this._socketEmitter.emitToUser(notification.recipientId, 'notification', notification);
                });
            }
        }
        catch (error) {
            Logger_1.logger.error('Failed to send repo notifications:', error);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.INotificationRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICollaboratorRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRepoRepository)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.ISocketEmitter)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotificationService);
