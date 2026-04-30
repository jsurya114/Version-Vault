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
exports.MongoBranchRepository = void 0;
const tsyringe_1 = require("tsyringe");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const BranchModel_1 = require("../models/BranchModel");
const BranchMapper_1 = require("../../../../application/mappers/BranchMapper");
let MongoBranchRepository = class MongoBranchRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(BranchModel_1.BranchModel);
    }
    toEntity(doc) {
        return BranchMapper_1.BranchMapper.toEntity(doc);
    }
    async findByRepoAndBranch(repositoryId, branchName) {
        const doc = await this.model.findOne({ repositoryId, branchName });
        return doc ? this.toEntity(doc) : null;
    }
    async deleteByRepoAndBranch(repositoryId, branchName) {
        const result = await this.model.deleteOne({ repositoryId, branchName });
        return result.deletedCount > 0;
    }
    async updateBranchName(repositoryId, oldBranch, newBranch) {
        await this.model.updateOne({ repositoryId, branchName: oldBranch }, { $set: { branchName: newBranch } });
    }
};
exports.MongoBranchRepository = MongoBranchRepository;
exports.MongoBranchRepository = MongoBranchRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoBranchRepository);
