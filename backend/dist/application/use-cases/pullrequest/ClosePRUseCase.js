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
exports.ClosePRUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const PullRequestMapper_1 = require("../../../application/mappers/PullRequestMapper");
const tokens_1 = require("../../../shared/constants/tokens");
const PRValidator_1 = require("../validators/PRValidator");
const NotificationService_1 = require("../../../infrastructure/services/NotificationService");
let ClosePRUseCase = class ClosePRUseCase {
    _prRepository;
    _notificationService;
    constructor(_prRepository, _notificationService) {
        this._prRepository = _prRepository;
        this._notificationService = _notificationService;
    }
    async execute(id) {
        const pr = await PRValidator_1.PRValidator.findOrFail(this._prRepository, id);
        PRValidator_1.PRValidator.assertOpen(pr, 'closed');
        const updated = await this._prRepository.update(id, { status: 'closed' });
        this._notificationService
            .notifyRepoDevelopers({
            actorId: pr.authorId,
            actorUsername: pr.authorUsername,
            type: 'pr_closed',
            message: `${pr.authorUsername} closed pull request "${pr.title}"`,
            repositoryId: pr.repositoryId,
            metadata: { prId: pr.id },
        })
            .catch(() => { });
        return PullRequestMapper_1.PullRequestMapper.toDTO(updated);
    }
};
exports.ClosePRUseCase = ClosePRUseCase;
exports.ClosePRUseCase = ClosePRUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IPullRequestRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.NotificationService)),
    __metadata("design:paramtypes", [Object, NotificationService_1.NotificationService])
], ClosePRUseCase);
