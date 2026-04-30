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
exports.AdminUserController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let AdminUserController = class AdminUserController {
    iGetAllUsers;
    getUser;
    blockUserUseCase;
    unblockUserUseCase;
    constructor(iGetAllUsers, getUser, blockUserUseCase, unblockUserUseCase) {
        this.iGetAllUsers = iGetAllUsers;
        this.getUser = getUser;
        this.blockUserUseCase = blockUserUseCase;
        this.unblockUserUseCase = unblockUserUseCase;
    }
    /**
     * GET /vv/admin/users
     * Returns all users
     */
    async getAllUsers(req, res, next) {
        try {
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 5,
                sort: req.query.sort,
                order: req.query.order,
                search: req.query.search,
                status: req.query.status,
            };
            const result = await this.iGetAllUsers.execute(query);
            res.status(HttpStatusCodes_1.HttpStatusCodes.CREATED).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /vv/admin/users/:id
     * Returns a single user by id
     */
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.getUser.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async blockUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.blockUserUseCase.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async unBlockUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.unblockUserUseCase.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.AdminUserController = AdminUserController;
exports.AdminUserController = AdminUserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetAllUsersUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetUserByIdUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IBlockUserUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.IUnblockUserUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AdminUserController);
