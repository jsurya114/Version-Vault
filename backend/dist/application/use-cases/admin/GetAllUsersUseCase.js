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
exports.GetAllUsersUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
const enums_1 = require("../../../domain/enums");
let GetAllUsersUseCase = class GetAllUsersUseCase {
    _adminRepo;
    constructor(_adminRepo) {
        this._adminRepo = _adminRepo;
    }
    async execute(query) {
        const result = await this._adminRepo.getAllUsers(query);
        return {
            data: result.data
                .filter((p) => p.role !== enums_1.UserRole.ADMIN)
                .map((user) => ({
                id: user.id,
                userId: user.userId,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role,
                isVerified: user.isVerified,
                isBlocked: user.isBlocked,
                provider: user.provider,
                subscriptionPlan: user.subscriptionPlan,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetAllUsersUseCase = GetAllUsersUseCase;
exports.GetAllUsersUseCase = GetAllUsersUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IAdminRepository)),
    __metadata("design:paramtypes", [Object])
], GetAllUsersUseCase);
