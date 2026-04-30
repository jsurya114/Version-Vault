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
exports.MongoAdminRepository = void 0;
const UserModel_1 = require("../models/UserModel");
const UserMapper_1 = require("../../../../application/mappers/UserMapper");
const tsyringe_1 = require("tsyringe");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const enums_1 = require("../../../../domain/enums");
let MongoAdminRepository = class MongoAdminRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(UserModel_1.UserModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toEntity(doc) {
        return UserMapper_1.UserMapper.toIUser(doc);
    }
    async getAllUsers(query) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter = {
            role: { $ne: enums_1.UserRole.ADMIN },
        };
        if (query.search) {
            filter.$or = [
                { username: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } },
                { userId: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.status) {
            if (query.status === 'active') {
                filter.isVerified = true;
                filter.isBlocked = { $ne: true };
            }
            else if (query.status === 'blocked') {
                filter.isBlocked = true;
            }
            else if (query.status === 'pending') {
                filter.isVerified = false;
                filter.isBlocked = { $ne: true };
            }
        }
        return this.findWithpagination(filter, query);
    }
    async getUserById(id) {
        return this.findById(id);
    }
    async blockUser(id) {
        return this.update(id, { isBlocked: true });
    }
    async unblockUser(id) {
        return this.update(id, { isBlocked: false });
    }
};
exports.MongoAdminRepository = MongoAdminRepository;
exports.MongoAdminRepository = MongoAdminRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoAdminRepository);
