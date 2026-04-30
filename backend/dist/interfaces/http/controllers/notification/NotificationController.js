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
exports.NotificationController = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../../shared/constants/tokens");
const HttpStatusCodes_1 = require("../../../../shared/constants/HttpStatusCodes");
let NotificationController = class NotificationController {
    _getNotifications;
    _markRead;
    _markAllRead;
    _notifRepo;
    constructor(_getNotifications, _markRead, _markAllRead, _notifRepo) {
        this._getNotifications = _getNotifications;
        this._markRead = _markRead;
        this._markAllRead = _markAllRead;
        this._notifRepo = _notifRepo;
    }
    // GET /vv/notifications
    async list(req, res, next) {
        try {
            const { id: userId } = req.user;
            const query = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
                sort: 'createdAt',
                order: 'desc',
            };
            const result = await this._getNotifications.execute(userId, query);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({
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
    // GET /vv/notifications/unread-count
    async unreadCount(req, res, next) {
        try {
            const { id: userId } = req.user;
            const count = await this._notifRepo.countUnread(userId);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: { count } });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/notifications/:id/read
    async markRead(req, res, next) {
        try {
            const { id } = req.params;
            const notification = await this._markRead.execute(id);
            res.status(HttpStatusCodes_1.HttpStatusCodes.OK).json({ success: true, data: notification });
        }
        catch (error) {
            next(error);
        }
    }
    // PATCH /vv/notifications/read-all
    async markAllRead(req, res, next) {
        try {
            const { id: userId } = req.user;
            await this._markAllRead.execute(userId);
            res
                .status(HttpStatusCodes_1.HttpStatusCodes.OK)
                .json({ success: true, message: 'All notifications marked as read' });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGetNotificationsUseCase)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.IMarkNotificationReadUseCase)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.IMarkAllReadUseCase)),
    __param(3, (0, tsyringe_1.inject)(tokens_1.TOKENS.INotificationRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotificationController);
