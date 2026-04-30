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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoNotificationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const NotificationModel_1 = require("../models/NotificationModel");
const NotificationMapper_1 = require("../../../../application/mappers/NotificationMapper");
let MongoNotificationRepository = class MongoNotificationRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(NotificationModel_1.NotificationModel);
    }
    toEntity(doc) {
        return NotificationMapper_1.NotificationMapper.toEntity(doc);
    }
    async findByRecipient(recipientId, query) {
        return this.findWithpagination({ recipientId }, query);
    }
    async markAsRead(id) {
        return this.update(id, { isRead: true });
    }
    async markAllAsRead(recipientId) {
        await NotificationModel_1.NotificationModel.updateMany({ recipientId, isRead: false }, { isRead: true });
    }
    async countUnread(recipientId) {
        return NotificationModel_1.NotificationModel.countDocuments({ recipientId, isRead: false });
    }
};
exports.MongoNotificationRepository = MongoNotificationRepository;
exports.MongoNotificationRepository = MongoNotificationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoNotificationRepository);
