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
exports.MongoFollowRepository = void 0;
const tsyringe_1 = require("tsyringe");
const FollowMapper_1 = require("../../../../application/mappers/FollowMapper");
const FollowModel_1 = require("../models/FollowModel");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
let MongoFollowRepository = class MongoFollowRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(FollowModel_1.FollowModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toEntity(doc) {
        return FollowMapper_1.FollowMapper.toIFollow(doc);
    }
    async findByFollowerAndFollowing(followerId, followingId) {
        const doc = await FollowModel_1.FollowModel.findOne({ followerId, followingId });
        return doc ? this.toEntity(doc) : null;
    }
    async findFollowers(userId) {
        const docs = await FollowModel_1.FollowModel.find({ followingId: userId });
        return docs.map(this.toEntity.bind(this));
    }
    async findFollowing(userId) {
        const docs = await FollowModel_1.FollowModel.find({ followerId: userId });
        return docs.map(this.toEntity.bind(this));
    }
    async deleteByFollowerAndFollowing(followerId, followingId) {
        const result = await FollowModel_1.FollowModel.deleteOne({ followerId, followingId });
        return result.deletedCount > 0;
    }
};
exports.MongoFollowRepository = MongoFollowRepository;
exports.MongoFollowRepository = MongoFollowRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoFollowRepository);
