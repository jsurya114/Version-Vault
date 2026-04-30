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
exports.RegisterValidator = void 0;
const tsyringe_1 = require("tsyringe");
const ConflictError_1 = require("../../../domain/errors/ConflictError");
const tokens_1 = require("../../../shared/constants/tokens");
let RegisterValidator = class RegisterValidator {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async validate(validateDto) {
        const existingEmail = await this.userRepo.findByEmail(validateDto.email); //find user by email
        if (existingEmail) {
            throw new ConflictError_1.ConflictError('Email already in use');
        }
        const existingUserId = await this.userRepo.findByUserId(validateDto.userId); //find user by userid
        if (existingUserId) {
            throw new ConflictError_1.ConflictError('UserId already exists');
        }
        const existingUserName = await this.userRepo.findByUserName(validateDto.username); //find user by username
        if (existingUserName) {
            throw new ConflictError_1.ConflictError('Username already exists');
        }
    }
};
exports.RegisterValidator = RegisterValidator;
exports.RegisterValidator = RegisterValidator = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUserRepository)),
    __metadata("design:paramtypes", [Object])
], RegisterValidator);
