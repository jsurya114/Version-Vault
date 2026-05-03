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
import { AI_AGENT_SYSTEM_PROMPT } from './Aiagentsystemprompt';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
    const hasArchitecture =
      config.architecture && config.architecture !== 'None' && config.architecture !== '';
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
Tech Stack: ${hasTechStack ? config.techStack!.join(', ') : 'None selected.'}
Architecture Style: ${hasArchitecture ? config.architecture : 'None — use a simple appropriate structure.'}
Extra Dependencies: ${hasDependencies ? config.dependencies : 'None.'}

═══════════════════
STRICT REQUIREMENTS
═══════════════════
${
  hasArchitecture
    ? `ARCHITECTURE REQUIREMENT (CRITICAL):
You MUST implement ${config.architecture} architecture.
- Generate the COMPLETE folder structure defined for ${config.architecture} in the system prompt.
- Every folder in the architecture MUST contain at least one real, working file.
- Strictly follow ALL layer separation rules for ${config.architecture}.
- Do NOT collapse layers or skip folders.`
    : 'Use a simple, appropriate folder structure for the project.'
}

${
  hasTechStack
    ? `TECH STACK REQUIREMENT:
You MUST generate all necessary configuration files for: ${config.techStack!.join(', ')}.
- Generate package.json / requirements.txt / go.mod with ALL required dependencies.
- Use the correct file extension for every file.
- Include tsconfig.json if TypeScript is in the stack.
- Include .env.example with all required environment variables.`
    : hasDependencies
      ? 'Only generate files needed for the described task.'
      : 'Only generate the specific file(s) requested. No config files, no extra folders.'
}

PROJECT TO BUILD:
${config.projectBrief}

Generate ALL files needed so a developer can clone the repo, run npm install (or pip install, etc.), and immediately start the application. Every file must contain real, working code.
`;

    const aiResponse = await this._groqService.chat(
      [
        { role: 'system', content: AI_AGENT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      true,
    );

    let generatedFiles: { path: string; content: string }[];

    try {
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
      } else {
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

        await this._gitService.commitMultipleFiles(
          ownerUsername,
          config.name,
          'main',
          'init: AI Boilerplate Project Setup',
          filesToCommit,
          'AI Assistant',
          'ai@versionvault.com',
        );

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
          // CI/CD trigger is non-critical
        }
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }

      return {
        status: 'completed',
        response: 'Project codebase scaffolded successfully',
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
