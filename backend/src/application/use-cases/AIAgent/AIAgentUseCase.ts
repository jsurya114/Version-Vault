import { inject, injectable } from 'tsyringe';
import { IAIAgentUseCase } from '../interfaces/ai-agent/IAIAgentUseCase';
import { AIAgentResponse, ProjectConfigDTO } from '../../../application/dtos/user/AIAgentResponse';
import { ICreateRepoUseCase } from '../interfaces/repository/ICreateRepoUseCase';
import { IGroqService } from '../../../domain/interfaces/services/IGroqService';
import { GitService } from '../../../infrastructure/services/GitService';
import { TOKENS } from '../../../shared/constants/tokens';
import { TriggerWorkflowUseCase } from '../cicd/TriggerWorkflowUseCase';
import { envConfig } from '../../../shared/config/env.config';
import { DEFAULT_PIPELINE } from '../../../shared/constants/defaultPipeline';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SYSTEM_PROMPT = `
You are an expert AI software architect. Given a project configuration, you must generate the boilerplate files for the project.
You MUST output ONLY a valid JSON object. Do NOT wrap it in markdown. The JSON must exactly match this schema:
{
  "files": [
    { "path": "filename.ext", "content": "..." },
    { "path": "another_file.ext", "content": "..." }
  ]
}
CRITICAL RULES AND INSTRUCTIONS:
1. **JSON VALIDITY**: Ensure the JSON is strictly valid. You MUST properly escape all special characters (such as quotes, newlines \\n, tabs \\t, and backslashes \\\\) inside the "content" strings so that JSON.parse will not fail. Do not leave trailing commas.
2. **ARCHITECTURE & REQUIREMENTS ENFORCEMENT**: You must create the repository exactly as requested in the "Project Brief". If the brief mentions specific technologies, frameworks, or folder structures, you MUST create all necessary configuration files, dependencies, and structural directories implicitly (e.g., "src/controllers/..."). If an Architecture is provided (and is not 'None'), also structure the project based on that.
3. **EXTENSION ENFORCEMENT**: 
   - Ensure you use the exact appropriate language extension for the tech stack the user typed or selected (e.g., \`.py\` for Python, \`.go\` for Go, \`.rs\` for Rust, \`.java\` for Java).
   - If using React, UI components MUST use \`.jsx\` extension or \`.tsx\` if TypeScript is used.
4. **DEPENDENCY & FOLDER MANAGEMENT**: ONLY generate dependency config files (e.g., \`package.json\`) and full folder structures (like \`src/\`) IF the user explicitly selected a Tech Stack, added Dependencies, or explicitly asked for a full project/app in the Project Brief. If the user just asks to "create a file" (e.g., "create a js file to generate otp") and no tech stack/dependencies are provided, ONLY output that exact file. DO NOT create \`package.json\`, extra folders, or any other boilerplate.
5. **ROOT PATHS**: All file "paths" MUST be strictly relative to the repository root. DO NOT nest the entire project inside a top-level parent folder matching the repository name. For example, output "filename.ext", NOT "my-repo/filename.ext". Do NOT use leading slashes or parent directory traversal like "../".
`;
@injectable()
export class AIAgentUseCase implements IAIAgentUseCase {
  constructor(
    @inject(TOKENS.IGroqService) private _groqService: IGroqService,
    @inject(TOKENS.ICreateRepoUseCase) private _createRepo: ICreateRepoUseCase,
    @inject(GitService) private _gitService: GitService,
    @inject(TriggerWorkflowUseCase) private _triggerWorkflowUseCase: TriggerWorkflowUseCase,
  ) {}

  async execute(
    config: ProjectConfigDTO,
    ownerId: string,
    ownerUsername: string,
  ): Promise<AIAgentResponse> {
    // Construct a highly detailed prompt explicitly defining rules mapped to their inputs
    const userPrompt = `
Repository Name: ${config.name}
Repository Description: ${config.description || 'No description provided.'}
Project Brief: ${config.projectBrief || 'No specific project brief provided.'}
User Selections:
- Tech Stack: ${config.techStack?.length ? config.techStack.join(', ') : 'None.'}
- Architecture Style: ${config.architecture || 'None.'}
- Extra Dependencies: ${config.dependencies || 'None.'}

Instructions: Generate ONLY the files explicitly requested or strictly necessary for the Project Brief. If no Tech Stack or Dependencies are provided, DO NOT assume any frameworks, DO NOT generate configuration files like package.json, and DO NOT create structural folders like src/. Generate strictly what is asked.
`;

    const aiResponse = await this._groqService.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      true,
    );
    let generatedFiles: { path: string; content: string }[];
    try {
      // Clean potential formatting if Groq returns it in markdown
      const cleaned = aiResponse
        .replace(/^```(json)?/, '')
        .replace(/```$/, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.files && Array.isArray(parsed.files)) {
        generatedFiles = parsed.files
          .filter(
            (f: { path: string }) => f.path && !f.path.endsWith('/') && !f.path.endsWith('\\'),
          )
          .map((file: { path: string; content: string }) => {
            // Fallback: If AI mistakenly prepends the repo name as the root folder, strip it
            let filePath = file.path;

            // Strip leading slashes, dots, and directory traversal
            filePath = filePath.replace(/^[./\\]+/, '');
            filePath = filePath.replace(/^(?:\.\.[/\\])+/, '');

            const repoPrefix = config.name + '/';
            if (filePath.startsWith(repoPrefix)) {
              filePath = filePath.substring(repoPrefix.length);
            }

            // Final safety strip just in case
            filePath = filePath.replace(/^[./\\]+/, '');

            let content = file.content;
            // Fix over-escaped newlines and tabs if the AI generated literal \n strings
            if (content.includes('\\n')) {
              content = content.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            }

            return { ...file, path: filePath, content };
          });
      } else {
        throw new Error('Invalid JSON Schema format returned from AI model.');
      }

      //create the bare repo in db and disk
      const createdRepo = await this._createRepo.execute({
        name: config.name,
        description: config.description,
        visibility: config.visibility.toLowerCase() === 'public' ? 'public' : 'private',
        ownerId,
        ownerUsername,
      });
      //write contents to temperory disk files & commit via git
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
        //commit ai generated files at once using native git Service
        await this._gitService.commitMultipleFiles(
          ownerUsername,
          config.name,
          'main',
          'init:AI Boilerplate Project Setup',
          filesToCommit,
          'AI Assistant',
          'ai@versionvault.com',
        );

        // CI/CD: Auto-trigger pipeline after AI agent commits
        try {
          const commits = await this._gitService.getCommits(ownerUsername, config.name, 'main', 1);
          const commitHash = commits.length > 0 ? commits[0].hash : 'ai-init';
          const repoCloneUrl = `http://host.docker.internal:${envConfig.PORT}/vv/git/${ownerUsername}/${config.name}.git`;
          await this._triggerWorkflowUseCase.execute(
            createdRepo.id as string,
            commitHash,
            DEFAULT_PIPELINE,
            repoCloneUrl,
          );
        } catch {
          // Non-critical
        }
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
      return {
        status: 'completed',
        response: 'Project codebase scaffoled successfully',
        repo: createdRepo,
      };
    } catch (e: unknown) {
      console.error('AI Project Generation Error >> ', e);
      const errorMessage =
        e instanceof Error ? e.message : 'Unknown error at codebase generation phase';
      return { status: 'ongoing', response: 'Generation failed: ' + errorMessage };
    }
  }
}
