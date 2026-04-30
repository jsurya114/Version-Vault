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
exports.MongoAdminRepoRepository = void 0;
const RepositoryModel_1 = require("../models/RepositoryModel");
const RepositoryMapper_1 = require("../../../../application/mappers/RepositoryMapper");
const tsyringe_1 = require("tsyringe");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
let MongoAdminRepoRepository = class MongoAdminRepoRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(RepositoryModel_1.RepositoryModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toEntity(doc) {
        return RepositoryMapper_1.RepositoryMapper.toIRepository(doc);
    }
    async getAllRepos(query) {
        const filter = { isDeleted: false };
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { ownerUsername: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.status) {
            if (query.status === 'blocked') {
                filter.isBlocked = true;
            }
            else if (query.status === 'active') {
                filter.isBlocked = { $ne: true };
            }
        }
        const [baseResult, stats] = await Promise.all([
            this.findWithpagination(filter, query),
            this.model.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalStars: { $sum: '$stars' },
                        totalForks: { $sum: '$forks' },
                    },
                },
            ]),
        ]);
        return {
            ...baseResult,
            extraStats: stats[0]
                ? {
                    totalStars: stats[0].totalStars || 0,
                    totalForks: stats[0].totalForks || 0,
                }
                : { totalStars: 0, totalForks: 0 },
        };
    }
    async blockRepo(id) {
        return this.update(id, { isBlocked: true });
    }
    async unblockRepo(id) {
        return this.update(id, { isBlocked: false });
    }
};
exports.MongoAdminRepoRepository = MongoAdminRepoRepository;
exports.MongoAdminRepoRepository = MongoAdminRepoRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoAdminRepoRepository);
