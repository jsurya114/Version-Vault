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
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let UserController = class UserController {
    _updateProfileUseCase;
    _getProfilUseCase;
    constructor(_updateProfileUseCase, _getProfilUseCase) {
        this._updateProfileUseCase = _updateProfileUseCase;
        this._getProfilUseCase = _getProfilUseCase;
    }
    /**
     * GET /vv/user/:username
     * Fetches public data for any searched user
     */
    async getPublicProfile(req, res, next) {
        try {
            const { username } = req.params;
            const user = await this._getProfilUseCase.execute(username);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /vv/user/profile
     * Updates the logged-in user's profile (name, bio, avatar)
     */
    async updateProfile(req, res, next) {
        try {
            const { id: userId } = req.user;
            const { username, bio } = req.body;
            const avatar = req.file ? req.file.path : undefined;
            const data = { username, bio, avatar };
            const updatedUser = await this._updateProfileUseCase.execute(userId, data);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUpdateProfileUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetProfileUseCase)),
    __metadata("design:paramtypes", [Object, Object])
], UserController);
