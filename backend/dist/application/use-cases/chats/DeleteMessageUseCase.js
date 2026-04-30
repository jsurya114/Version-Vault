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
exports.DeleteMessageUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const NotFoundError_1 = require("../../../domain/errors/NotFoundError");
const tokens_1 = require("../../../shared/constants/tokens");
const UnauthorizedError_1 = require("../../../domain/errors/UnauthorizedError");
let DeleteMessageUseCase = class DeleteMessageUseCase {
    _chatRepo;
    constructor(_chatRepo) {
        this._chatRepo = _chatRepo;
    }
    async execute(messageId, userId) {
        const existingMessage = await this._chatRepo.findById(messageId);
        if (!existingMessage) {
            throw new NotFoundError_1.NotFoundError('Message not found');
        }
        if (existingMessage.senderId !== userId) {
            throw new UnauthorizedError_1.UnauthorizedError('Unauthorized. You can only delete your own messages.');
        }
        return await this._chatRepo.delete(messageId);
    }
};
exports.DeleteMessageUseCase = DeleteMessageUseCase;
exports.DeleteMessageUseCase = DeleteMessageUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IChatRepository)),
    __metadata("design:paramtypes", [Object])
], DeleteMessageUseCase);
