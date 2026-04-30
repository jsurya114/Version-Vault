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
exports.TriggerWorkflowUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const bullmq_1 = require("bullmq");
const YAMLParserService_1 = require("../../../infrastructure/services/cicd/YAMLParserService");
const WorkflowRunModel_1 = require("../../../infrastructure/database/mongoose/models/WorkflowRunModel");
const BullMQConnection_1 = require("../../../infrastructure/Redis/BullMQConnection");
let TriggerWorkflowUseCase = class TriggerWorkflowUseCase {
    yamlParser;
    cicdQueue;
    constructor(yamlParser) {
        this.yamlParser = yamlParser;
        this.cicdQueue = new bullmq_1.Queue('cicd-queue', {
            connection: BullMQConnection_1.bullmqConnection
        });
    }
    async execute(repositoryId, commitHash, yamlContent, repoCloneUrl) {
        //parse the users yaml file
        const workflow = this.yamlParser.parse(yamlContent);
        //save the initial queue state to the db
        const run = await WorkflowRunModel_1.WorkflowRunModel.create({
            repositoryId,
            commitHash,
            status: 'QUEUED',
            logs: ''
        });
        //queue the jobs(Assuming a simple single-job workflow for now)
        const jobs = Object.values(workflow.jobs);
        for (const job of jobs) {
            await this.cicdQueue.add('execute-workflow', {
                workflowJob: job,
                runId: run.id,
                repoCloneUrl,
                commitHash
            });
        }
    }
};
exports.TriggerWorkflowUseCase = TriggerWorkflowUseCase;
exports.TriggerWorkflowUseCase = TriggerWorkflowUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(YAMLParserService_1.YAMLParserService)),
    __metadata("design:paramtypes", [Object])
], TriggerWorkflowUseCase);
