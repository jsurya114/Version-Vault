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
exports.MongoIssuesRepository = void 0;
const tsyringe_1 = require("tsyringe");
const IssuesMapper_1 = require("../../../../application/mappers/IssuesMapper");
const IssuesModel_1 = require("../models/IssuesModel");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
let MongoIssuesRepository = class MongoIssuesRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(IssuesModel_1.IssueModel);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toEntity(doc) {
        return IssuesMapper_1.IssueMapper.toIIssues(doc);
    }
    async findByRepo(repositoryId, query) {
        const filter = { repositoryId };
        if (query.status)
            filter.status = query.status;
        if (query.search)
            filter.title = { $regex: query.search, $options: 'i' };
        return this.findWithpagination(filter, query);
    }
};
exports.MongoIssuesRepository = MongoIssuesRepository;
exports.MongoIssuesRepository = MongoIssuesRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoIssuesRepository);
