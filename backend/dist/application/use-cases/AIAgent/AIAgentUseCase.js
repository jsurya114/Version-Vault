"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const GitService_1 = require("../../../infrastructure/services/GitService");
const tokens_1 = require("../../../shared/constants/tokens");
const TriggerWorkflowUseCase_1 = require("../cicd/TriggerWorkflowUseCase");
const env_config_1 = require("../../../shared/config/env.config");
const defaultPipeline_1 = require("../../../shared/constants/defaultPipeline");
const Aiagentsystemprompt_1 = require("./Aiagentsystemprompt");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let AIAgentUseCase = class AIAgentUseCase {
    _groqService;
    _createRepo;
    _gitService;
    _triggerWorkflowUseCase;
    constructor(_groqService, _createRepo, _gitService, _triggerWorkflowUseCase) {
        this._groqService = _groqService;
        this._createRepo = _createRepo;
        this._gitService = _gitService;
        this._triggerWorkflowUseCase = _triggerWorkflowUseCase;
    }
    async execute(config, ownerId, ownerUsername) {
        const hasArchitecture = config.architecture && config.architecture !== 'None' && config.architecture !== '';
        const hasTechStack = config.techStack && config.techStack.length > 0;
        const hasDependencies = config.dependencies && config.dependencies.trim() !== '';
        const userPrompt = `
Generate a complete, production-ready project with the following specifications.

═══════════════════
PROJECT DETAILS
═══════════════════
Repository Name: ${config.name}
Description: ${config.description || 'No description provided.'}

Project Brief:
${config.projectBrief || 'No specific brief provided.'}

═══════════════════
REQUIRED CONFIGURATION
═══════════════════
Tech Stack: ${hasTechStack ? config.techStack.join(', ') : 'None selected.'}
Architecture Style: ${hasArchitecture ? config.architecture : 'None — use a simple appropriate structure.'}
Extra Dependencies: ${hasDependencies ? config.dependencies : 'None.'}

═══════════════════
STRICT REQUIREMENTS
═══════════════════
${hasArchitecture
            ? `ARCHITECTURE REQUIREMENT (CRITICAL):
You MUST implement ${config.architecture} architecture.
- Generate the COMPLETE folder structure defined for ${config.architecture} in the system prompt.
- Every folder in the architecture MUST contain at least one real, working file.
- Strictly follow ALL layer separation rules for ${config.architecture}.
- Do NOT collapse layers or skip folders.`
            : 'Use a simple, appropriate folder structure for the project.'}

${hasTechStack
            ? `TECH STACK REQUIREMENT:
You MUST generate all necessary configuration files for: ${config.techStack.join(', ')}.
- Generate package.json / requirements.txt / go.mod with ALL required dependencies.
- Use the correct file extension for every file.
- Include tsconfig.json if TypeScript is in the stack.
- Include .env.example with all required environment variables.`
            : hasDependencies
                ? 'Only generate files needed for the described task.'
                : 'Only generate the specific file(s) requested. No config files, no extra folders.'}

PROJECT TO BUILD:
${config.projectBrief}

Generate ALL files needed so a developer can clone the repo, run npm install (or pip install, etc.), and immediately start the application. Every file must contain real, working code.
`;
        const aiResponse = await this._groqService.chat([
            { role: 'system', content: Aiagentsystemprompt_1.AI_AGENT_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ], true);
        let generatedFiles;
        try {
            const cleaned = aiResponse
                .replace(/^```(json)?/, '')
                .replace(/```$/, '')
                .trim();
            const parsed = JSON.parse(cleaned);
            if (parsed.files && Array.isArray(parsed.files)) {
                generatedFiles = parsed.files
                    .filter((f) => f.path && !f.path.endsWith('/') && !f.path.endsWith('\\'))
                    .map((file) => {
                    let filePath = file.path;
                    filePath = filePath.replace(/^[./\\]+/, '');
                    filePath = filePath.replace(/^(?:\.\.[/\\])+/, '');
                    const repoPrefix = config.name + '/';
                    if (filePath.startsWith(repoPrefix)) {
                        filePath = filePath.substring(repoPrefix.length);
                    }
                    filePath = filePath.replace(/^[./\\]+/, '');
                    let content = file.content;
                    if (content.includes('\\n')) {
                        content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                    }
                    return { ...file, path: filePath, content };
                });
            }
            else {
                throw new Error('Invalid JSON Schema format returned from AI model.');
            }
            const createdRepo = await this._createRepo.execute({
                name: config.name,
                description: config.description,
                visibility: config.visibility.toLowerCase() === 'public' ? 'public' : 'private',
                ownerId,
                ownerUsername,
            });
            const tmpDir = path.join(process.cwd(), '.tmp', crypto.randomUUID());
            fs.mkdirSync(tmpDir, { recursive: true });
            try {
                const filesToCommit = generatedFiles.map((file) => {
                    const tempDiskPath = path.join(tmpDir, crypto.randomUUID() + '.tmp');
                    fs.writeFileSync(tempDiskPath, file.content);
                    return {
                        filePath: file.path,
                        tempDiskPath: tempDiskPath,
                    };
                });
                await this._gitService.commitMultipleFiles(ownerUsername, config.name, 'main', 'init: AI Boilerplate Project Setup', filesToCommit, 'AI Assistant', 'ai@versionvault.com');
                try {
                    const commits = await this._gitService.getCommits(ownerUsername, config.name, 'main', 1);
                    const commitHash = commits.length > 0 ? commits[0].hash : 'ai-init';
                    const repoCloneUrl = `http://host.docker.internal:${env_config_1.envConfig.PORT}/vv/git/${ownerUsername}/${config.name}.git`;
                    await this._triggerWorkflowUseCase.execute(createdRepo.id, commitHash, defaultPipeline_1.DEFAULT_PIPELINE, repoCloneUrl);
                }
                catch {
                    // CI/CD trigger is non-critical
                }
            }
            finally {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            }
            return {
                status: 'completed',
                response: 'Project codebase scaffolded successfully',
                repo: createdRepo,
            };
        }
        catch (e) {
            console.error('AI Project Generation Error >> ', e);
            const errorMessage = e instanceof Error ? e.message : 'Unknown error at codebase generation phase';
            return { status: 'ongoing', response: 'Generation failed: ' + errorMessage };
        }
    }
};
exports.AIAgentUseCase = AIAgentUseCase;
exports.AIAgentUseCase = AIAgentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.IGroqService)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.ICreateRepoUseCase)),
    __param(2, (0, tsyringe_1.inject)(GitService_1.GitService)),
    __param(3, (0, tsyringe_1.inject)(TriggerWorkflowUseCase_1.TriggerWorkflowUseCase)),
    __metadata("design:paramtypes", [Object, Object, GitService_1.GitService,
        TriggerWorkflowUseCase_1.TriggerWorkflowUseCase])
], AIAgentUseCase);
