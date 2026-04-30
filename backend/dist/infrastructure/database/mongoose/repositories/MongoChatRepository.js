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
exports.MongoChatRepository = void 0;
const tsyringe_1 = require("tsyringe");
const ChatModel_1 = require("../models/ChatModel");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const ChatMapper_1 = require("../../../../application/mappers/ChatMapper");
let MongoChatRepository = class MongoChatRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(ChatModel_1.ChatModel);
    }
    toEntity(doc) {
        return ChatMapper_1.ChatMapper.toEntity(doc);
    }
    // List chats using Pagination
    async getMessagesByRepositoryId(repositoryId, query) {
        const filter = { repositoryId };
        if (query.search) {
            filter.content = { $regex: query.search, $options: 'i' };
        }
        return this.findWithpagination(filter, query);
    }
};
exports.MongoChatRepository = MongoChatRepository;
exports.MongoChatRepository = MongoChatRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoChatRepository);
