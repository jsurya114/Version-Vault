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
exports.MongoUserRepository = void 0;
const tsyringe_1 = require("tsyringe");
const UserModel_1 = require("../models/UserModel");
const UserMapper_1 = require("../../../../application/mappers/UserMapper");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
let MongoUserRepository = class MongoUserRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(UserModel_1.UserModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toEntity(doc) {
        return UserMapper_1.UserMapper.toIUser(doc);
    }
    async findByEmail(email) {
        const doc = await this.model.findOne({ email }).lean();
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findByUserId(userId) {
        const doc = await this.model.findOne({ userId }).lean();
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findByUserName(username) {
        const doc = await this.model.findOne({ username }).lean();
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findManyByIds(ids) {
        const docs = await this.model.find({ userId: { $in: ids } }).lean();
        if (!docs)
            return [];
        return docs.map((doc) => this.toEntity(doc));
    }
};
exports.MongoUserRepository = MongoUserRepository;
exports.MongoUserRepository = MongoUserRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoUserRepository);
