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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoRepoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tsyringe_1 = require("tsyringe");
const RepositoryModel_1 = require("../models/RepositoryModel");
const CollaboratorModel_1 = require("../models/CollaboratorModel");
const RepositoryMapper_1 = require("../../../../application/mappers/RepositoryMapper");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
let MongoRepoRepository = class MongoRepoRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(RepositoryModel_1.RepositoryModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toEntity(doc) {
        return RepositoryMapper_1.RepositoryMapper.toIRepository(doc);
    }
    async findByOwner(ownerId, query, authenticatedUserId) {
        const filter = { ownerId, isDeleted: false, isBlocked: false };
        if (ownerId !== authenticatedUserId) {
            filter.visibility = 'public';
        }
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        if (query.status) {
            filter.visibility = query.status;
        }
        return this.findWithpagination(filter, query);
    }
    async findByOwnerAndName(ownerUsername, name) {
        const doc = await this.model
            .findOne({ ownerUsername, name, isDeleted: false, isBlocked: false })
            .lean();
        if (!doc)
            return null;
        return this.toEntity(doc);
    }
    async findAll(query) {
        const filter = { isDeleted: false, isBlocked: false };
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        if (query.status) {
            filter.visibility = query.status;
        }
        return this.findWithpagination(filter, query);
    }
    async findUserRepositories(userId, query) {
        // 1. Get collaborator repo IDs and roles
        const collaborations = await CollaboratorModel_1.CollaboratorModel.find({ collaboratorId: userId }).lean();
        const collabMap = new Map(collaborations.map((c) => [c.repositoryId, c.role]));
        const collabRepoIds = Array.from(collabMap.keys())
            .map((id) => {
            try {
                return new mongoose_1.default.Types.ObjectId(id);
            }
            catch {
                return null;
            }
        })
            .filter((id) => id !== null);
        // 2. Build filter for Owned OR Collaborated
        const filter = {
            isDeleted: false,
            isBlocked: false,
        };
        const type = query.type;
        if (type === 'owned') {
            filter.ownerId = userId;
        }
        else if (type === 'collab') {
            filter._id = { $in: collabRepoIds };
        }
        else {
            // Default: show both
            filter.$or = [{ ownerId: userId }, { _id: { $in: collabRepoIds } }];
        }
        if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }
        if (query.status) {
            filter.visibility = query.status;
        }
        const result = await this.findWithpagination(filter, query);
        // 3. Assign roles
        result.data = result.data.map((repo) => {
            const repoIdStr = repo.id?.toString();
            // Ensure we compare strings
            if (String(repo.ownerId) === String(userId)) {
                repo.role = 'owner';
            }
            else if (repoIdStr && collabMap.has(repoIdStr)) {
                repo.role = collabMap.get(repoIdStr);
            }
            return repo;
        });
        return result;
    }
};
exports.MongoRepoRepository = MongoRepoRepository;
exports.MongoRepoRepository = MongoRepoRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoRepoRepository);
