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
exports.FollowController = void 0;
const tsyringe_1 = require("tsyringe");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
const tokens_1 = require("../../../../shared/constants/tokens");
let FollowController = class FollowController {
    _followUseCase;
    _unfollowUseCase;
    _getFollowerUseCase;
    _getFollowingUseCase;
    _userRepository;
    constructor(_followUseCase, _unfollowUseCase, _getFollowerUseCase, _getFollowingUseCase, _userRepository) {
        this._followUseCase = _followUseCase;
        this._unfollowUseCase = _unfollowUseCase;
        this._getFollowerUseCase = _getFollowerUseCase;
        this._getFollowingUseCase = _getFollowingUseCase;
        this._userRepository = _userRepository;
    }
    // POST /vv/follow/:userId
    async follow(req, res, next) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { id: followerId, userId: followerUsername } = req.user;
            const { userId: targetId } = req.params;
            const targetUser = (await this._userRepository.findByUserId(targetId)) ||
                (await this._userRepository.findByUserName(targetId));
            if (!targetUser) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            await this._followUseCase.execute(followerId, followerUsername, targetUser.id, targetUser.userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'Followed successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /vv/follow/:userId
    async unfollow(req, res, next) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { id: followerId } = req.user;
            const { userId: targetUsername } = req.params;
            const targetUser = (await this._userRepository.findByUserId(targetUsername)) ||
                (await this._userRepository.findByUserName(targetUsername));
            if (!targetUser)
                throw new Error('User not found');
            await this._unfollowUseCase.execute(followerId, targetUser.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, message: 'Unfollowed successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/follow/:userId/followers
    async getFollowers(req, res, next) {
        try {
            const { userId: targetId } = req.params;
            const targetUser = (await this._userRepository.findByUserId(targetId)) ||
                (await this._userRepository.findByUserName(targetId));
            if (!targetUser) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            const followers = await this._getFollowerUseCase.execute(targetUser.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: followers });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /vv/follow/:userId/following
    async getFollowing(req, res, next) {
        try {
            const { userId: targetId } = req.params;
            const targetUser = (await this._userRepository.findByUserId(targetId)) ||
                (await this._userRepository.findByUserName(targetId));
            if (!targetUser) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            const following = await this._getFollowingUseCase.execute(targetUser.id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: following });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.FollowController = FollowController;
exports.FollowController = FollowController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IFollowUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUnfollowUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetFollowersUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetFollowingUseCase)),
    __param(4, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], FollowController);
