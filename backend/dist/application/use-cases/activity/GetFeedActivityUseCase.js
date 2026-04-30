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
exports.GetActivityFeedUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
let GetActivityFeedUseCase = class GetActivityFeedUseCase {
    _activityRepo;
    _followRepo;
    constructor(_activityRepo, _followRepo) {
        this._activityRepo = _activityRepo;
        this._followRepo = _followRepo;
    }
    async execute(userId, query) {
        // 1. Get everyone the user is following
        const following = await this._followRepo.findFollowing(userId);
        const followingIds = following.map((f) => f.followingId);
        if (followingIds.length === 0) {
            return { data: [], total: 0, page: query.page || 1, limit: query.limit || 10, totalPages: 0 };
        }
        // 2. Query the activities for those specific users
        return await this._activityRepo.getFeedForUsers(followingIds, query);
    }
};
exports.GetActivityFeedUseCase = GetActivityFeedUseCase;
exports.GetActivityFeedUseCase = GetActivityFeedUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IActivityRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IFollowRepository)),
    __metadata("design:paramtypes", [Object, Object])
], GetActivityFeedUseCase);
