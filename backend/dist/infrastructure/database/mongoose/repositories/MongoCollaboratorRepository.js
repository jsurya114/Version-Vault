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
exports.MongoCollaboratorRepository = void 0;
const tsyringe_1 = require("tsyringe");
const CollaboratorModel_1 = require("../models/CollaboratorModel");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const CollaboratorMapper_1 = require("../../../../application/mappers/CollaboratorMapper");
let MongoCollaboratorRepository = class MongoCollaboratorRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(CollaboratorModel_1.CollaboratorModel);
    }
    toEntity(doc) {
        return CollaboratorMapper_1.CollaboratorMapper.toICollaborator(doc);
    }
    async findByRepoAndUser(repositoryId, collaboratorId) {
        const doc = await CollaboratorModel_1.CollaboratorModel.findOne({ repositoryId, collaboratorId });
        return doc ? this.toEntity(doc) : null;
    }
    async findByRepository(repositoryId) {
        const docs = await CollaboratorModel_1.CollaboratorModel.find({ repositoryId });
        return docs.map(this.toEntity.bind(this));
    }
    async findByUser(collaboratorId) {
        const docs = await CollaboratorModel_1.CollaboratorModel.find({ collaboratorId });
        return docs.map(this.toEntity.bind(this));
    }
    async deleteByRepoAndUser(repositoryId, collaboratorId) {
        const result = await CollaboratorModel_1.CollaboratorModel.deleteOne({ repositoryId, collaboratorId });
        return result.deletedCount > 0;
    }
    async updateRole(repositoryId, collaboratorId, role) {
        const doc = await CollaboratorModel_1.CollaboratorModel.findOneAndUpdate({ repositoryId, collaboratorId }, { role }, { new: true });
        return doc ? this.toEntity(doc) : null;
    }
    async findCollabedRepos(userId) {
        const docs = await CollaboratorModel_1.CollaboratorModel.find({
            $or: [{ collaboratorId: userId }, { ownerId: userId }],
        });
        return docs.map(this.toEntity.bind(this));
    }
};
exports.MongoCollaboratorRepository = MongoCollaboratorRepository;
exports.MongoCollaboratorRepository = MongoCollaboratorRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoCollaboratorRepository);
