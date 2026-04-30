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
exports.UpdateProfileUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../shared/constants/tokens");
let UpdateProfileUseCase = class UpdateProfileUseCase {
    _userRepository;
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(userId, data) {
        const user = await this._userRepository.findById(userId);
        if (!user)
            throw new Error('User not found');
        if (data.username)
            user.username = data.username;
        if (data.bio)
            user.bio = data.bio;
        if (data.avatar)
            user.avatar = data.avatar;
        const updatedUser = await this._userRepository.update(userId, user);
        if (!updatedUser) {
            throw new Error('Could not update profile information');
        }
        return updatedUser;
    }
};
exports.UpdateProfileUseCase = UpdateProfileUseCase;
exports.UpdateProfileUseCase = UpdateProfileUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __metadata("design:paramtypes", [Object])
], UpdateProfileUseCase);
