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
exports.FollowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let FollowUseCase = class FollowUseCase {
    _followRepo;
    _userRepo;
    _notificationService;
    _recordActivityUseCase;
    constructor(_followRepo, _userRepo, _notificationService, _recordActivityUseCase) {
        this._followRepo = _followRepo;
        this._userRepo = _userRepo;
        this._notificationService = _notificationService;
        this._recordActivityUseCase = _recordActivityUseCase;
    }
    async execute(followerId, followerUsername, followingId, followingUsername) {
        if (followerId === followingId)
            throw new Error('You cannot follow yourself');
        const existing = await this._followRepo.findByFollowerAndFollowing(followerId, followingId);
        if (existing)
            throw new ConflictError_1.ConflictError('Already following this user');
        await this._followRepo.save({ followerId, followerUsername, followingId, followingUsername });
        //update counts
        const follower = await this._userRepo.findById(followerId);
        const following = await this._userRepo.findById(followingId);
        if (follower) {
            await this._userRepo.update(followerId, {
                followingCount: (follower.followingCount || 0) + 1,
            });
        }
        if (following) {
            await this._userRepo.update(followingId, {
                followersCount: (following.followersCount || 0) + 1,
            });
        }
        this._notificationService
            .notifyUser({
            recipientId: followingId,
            actorId: followerId,
            actorUsername: followerUsername,
            type: 'followed',
            message: `${followerUsername} started following you`,
        })
            .catch(() => { });
        this._recordActivityUseCase
            .execute({
            actorId: followerId,
            actorUsername: followerUsername,
            actorAvatar: follower?.avatar,
            isPrivate: false,
            actionType: 'followed_user',
            targetId: followingId,
            targetName: followingUsername,
        })
            .catch(() => { });
    }
};
exports.FollowUseCase = FollowUseCase;
exports.FollowUseCase = FollowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IFollowRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IRecordActivityUseCase)),
    __metadata("design:paramtypes", [Object, Object, NotificationService_1.NotificationService, Object])
], FollowUseCase);
