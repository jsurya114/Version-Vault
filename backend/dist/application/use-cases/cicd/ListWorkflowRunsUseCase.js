"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListWorkflowRunsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const WorkflowRunModel_1 = require("../../../infrastructure/database/mongoose/models/WorkflowRunModel");
let ListWorkflowRunsUseCase = class ListWorkflowRunsUseCase {
    async execute(repositoryId) {
        const runs = await WorkflowRunModel_1.WorkflowRunModel.find({ repositoryId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        return runs;
    }
};
exports.ListWorkflowRunsUseCase = ListWorkflowRunsUseCase;
exports.ListWorkflowRunsUseCase = ListWorkflowRunsUseCase = __decorate([
    (0, tsyringe_1.injectable)()
], ListWorkflowRunsUseCase);
