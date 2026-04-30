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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetIssueUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const IssuesMapper_1 = require("../mappers/IssuesMapper");
const tokens_1 = require("../../shared/constants/tokens");
const IssueValidator_1 = require("../use-cases/validators/IssueValidator");
let GetIssueUseCase = class GetIssueUseCase {
    _issueRepo;
    constructor(_issueRepo) {
        this._issueRepo = _issueRepo;
    }
    async execute(id) {
        const issue = await IssueValidator_1.IssueValidator.findOrFail(this._issueRepo, id);
        return IssuesMapper_1.IssueMapper.toDTO(issue);
    }
};
exports.GetIssueUseCase = GetIssueUseCase;
exports.GetIssueUseCase = GetIssueUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IIssuesRepository)),
    __metadata("design:paramtypes", [Object])
], GetIssueUseCase);
