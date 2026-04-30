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
exports.UnfollowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let UnfollowUseCase = class UnfollowUseCase {
    _followRepo;
    _userRepo;
    _notificationService;
    constructor(_followRepo, _userRepo, _notificationService) {
        this._followRepo = _followRepo;
        this._userRepo = _userRepo;
        this._notificationService = _notificationService;
    }
    async execute(followerId, followingId) {
        const existing = await this._followRepo.findByFollowerAndFollowing(followerId, followingId);
        if (!existing)
            throw new Error('Not Following this user');
        await this._followRepo.deleteByFollowerAndFollowing(followerId, followingId);
        const follower = await this._userRepo.findById(followerId);
        const following = await this._userRepo.findById(followingId);
        if (follower)
            await this._userRepo.update(followerId, {
                followingCount: Math.max((follower.followingCount || 0) - 1, 0),
            });
        if (following)
            await this._userRepo.update(followingId, {
                followersCount: Math.max((following.followersCount || 0) - 1, 0),
            });
        this._notificationService
            .notifyUser({
            recipientId: followingId,
            actorId: followerId,
            actorUsername: follower?.username || 'Someone',
            type: 'unfollowed',
            message: `${follower?.username || 'Someone'} unfollowed you`,
        })
            .catch(() => { });
    }
};
exports.UnfollowUseCase = UnfollowUseCase;
exports.UnfollowUseCase = UnfollowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IFollowRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, NotificationService_1.NotificationService])
], UnfollowUseCase);
