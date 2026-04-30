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
exports.AdminRepoController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let AdminRepoController = class AdminRepoController {
    _getAllRepo;
    _getRepo;
    _blockRepo;
    _unblockRepo;
    constructor(_getAllRepo, _getRepo, _blockRepo, _unblockRepo) {
        this._getAllRepo = _getAllRepo;
        this._getRepo = _getRepo;
        this._blockRepo = _blockRepo;
        this._unblockRepo = _unblockRepo;
    }
    async getAllRepositories(req, res, next) {
        try {
            const query = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 5,
                search: req.query.search,
                status: req.query.status,
                sort: req.query.sort,
                order: req.query.order,
            };
            const result = await this._getAllRepo.execute(query);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    extraStats: result.extraStats,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getRepoById(req, res, next) {
        try {
            const { id } = req.params;
            const repo = await this._getRepo.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: repo });
        }
        catch (error) {
            next(error);
        }
    }
    async blockRepository(req, res, next) {
        try {
            const { id } = req.params;
            const repo = await this._blockRepo.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: repo });
        }
        catch (error) {
            next(error);
        }
    }
    async unblockRepository(req, res, next) {
        try {
            const { id } = req.params;
            const repo = await this._unblockRepo.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: repo });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.AdminRepoController = AdminRepoController;
exports.AdminRepoController = AdminRepoController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetAllRepoUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetRepoByIdUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IBlockRepoUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUnblockRepoUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AdminRepoController);
