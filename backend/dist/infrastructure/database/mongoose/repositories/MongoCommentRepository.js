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
exports.MongoCommentRepository = void 0;
const tsyringe_1 = require("tsyringe");
const CommentModel_1 = require("../models/CommentModel");
const CommentMapper_1 = require("../../../../application/mappers/CommentMapper");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const mongoose_1 = __importDefault(require("mongoose"));
let MongoCommentRepository = class MongoCommentRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(CommentModel_1.CommentModel);
    }
    toEntity(doc) {
        return CommentMapper_1.CommentMapper.toEntity(doc);
    }
    async findByTargetId(targetId, targetType, query) {
        const filter = {
            targetId: new mongoose_1.default.Types.ObjectId(targetId),
            targetType,
        };
        return this.findWithpagination(filter, query);
    }
    async deleteManyByTargetId(targetId, targetType) {
        await CommentModel_1.CommentModel.deleteMany({ targetId, targetType }).exec();
    }
};
exports.MongoCommentRepository = MongoCommentRepository;
exports.MongoCommentRepository = MongoCommentRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoCommentRepository);
