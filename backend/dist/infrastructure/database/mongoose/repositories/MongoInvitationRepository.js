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
exports.MongoInvitationRepository = void 0;
const tsyringe_1 = require("tsyringe");
const InvitationModel_1 = require("../models/InvitationModel");
const MongoBaseRepository_1 = require("./MongoBaseRepository");
const InvitationMapper_1 = require("../../../../application/mappers/InvitationMapper");
let MongoInvitationRepository = class MongoInvitationRepository extends MongoBaseRepository_1.MongoBaseRepository {
    constructor() {
        super(InvitationModel_1.InvitationModel);
    }
    toEntity(doc) {
        return InvitationMapper_1.InvitationMapper.toEntity(doc);
    }
    async findByToken(token) {
        const doc = await InvitationModel_1.InvitationModel.findOne({ token });
        return doc ? this.toEntity(doc) : null;
    }
    async findPendingByEmail(email) {
        const doc = await InvitationModel_1.InvitationModel.find({ inviteeEmail: email, status: 'pending' });
        return doc.map(this.toEntity.bind(this));
    }
    async findByRepository(repositoryId) {
        const docs = await InvitationModel_1.InvitationModel.find({ repositoryId });
        return docs.map(this.toEntity.bind(this));
    }
    async findPendingByRepoAndEmail(repositoryId, email) {
        const doc = await InvitationModel_1.InvitationModel.findOne({
            repositoryId,
            inviteeEmail: email,
            status: 'pending',
        });
        return doc ? this.toEntity(doc) : null;
    }
    async updateStatus(token, status) {
        const doc = await InvitationModel_1.InvitationModel.findOneAndUpdate({ token }, { status }, { new: true });
        return doc ? this.toEntity(doc) : null;
    }
};
exports.MongoInvitationRepository = MongoInvitationRepository;
exports.MongoInvitationRepository = MongoInvitationRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoInvitationRepository);
