import { inject, injectable } from 'tsyringe';
import { IAIAgentUseCase } from '../interfaces/ai-agent/IAIAgentUseCase';
import { AIAgentResponse, ProjectConfigDTO } from '../../../application/dtos/user/AIAgentResponse';
import { ICreateRepoUseCase } from '../interfaces/repository/ICreateRepoUseCase';
import { IGroqService } from '../../../domain/interfaces/services/IGroqService';
import { GitService } from '../../../infrastructure/services/GitService';
import { TOKENS } from '../../../shared/constants/tokens';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SYSTEM_PROMPT = `
You are an expert AI software architect. Given a project configuration, you must generate the boilerplate files for the project.
You MUST output ONLY a valid JSON object. Do NOT wrap it in markdown. The JSON must exactly match this schema:
{
  "files": [
    { "path": "package.json", "content": "..." },
    { "path": "../../../index.js", "content": "..." }
  ]
}
CRITICAL RULES AND INSTRUCTIONS:
1. **ARCHITECTURE ENFORCEMENT**: If an Architecture is provided (and is not 'None'), structure the project's folders and files based EXACTLY on that requested Architecture by creating necessary structural directories implicitly (e.g., "../../../controllers/..."). If 'None' or no architecture is selected, output files straightforwardly without enforcing deep folder structures.
2. **EXTENSION ENFORCEMENT**: 
   - If the tech stack specifies 'React', UI components MUST use \`.jsx\` extension. Never use \`.js\` for React components.
   - If the tech stack specifies 'React' AND 'TypeScript', UI components MUST use \`.tsx\` extension, and logic files must use \`.ts\`.
   - Ensure you use the exact appropriate language extension for the tech stack the user typed or selected (e.g., \`.py\` for Python, \`.go\` for Go, \`.rs\` for Rust, \`.java\` for Java).
3. **DEPENDENCY MANAGEMENT**: ONLY generate dependency config files (e.g., \`package.json\`, \`requirements.txt\`, \`pom.xml\`, \`Cargo.toml\`) IF the user explicitly selected a Tech Stack or Architecture. If no Tech Stack or Architecture is provided, DO NOT create extra boilerplate configuration, dependency files, or empty project folders. Just output exactly what the Project Brief asked for.
4. **FILE CONTENT**: Provide realistic boilerplate code in each file to give the user a good starting point based on their "Project Brief" and "Description".
5. **ROOT PATHS**: All file "paths" MUST be strictly relative to the repository root. DO NOT nest the entire project inside a top-level parent folder matching the repository name. For example, output "package.json" and "../../../index.js", NOT "my-repo/package.json" or "my-repo/src/index.js".
`;
@injectable()
export class AIAgentUseCase implements IAIAgentUseCase {
  constructor(
    @inject(TOKENS.IGroqService) private _groqService: IGroqService,
    @inject(TOKENS.ICreateRepoUseCase) private _createRepo: ICreateRepoUseCase,
    @inject(GitService) private _gitService: GitService,
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
Project Brief: ${config.projectBrief}
User Selections:
- Tech Stack: ${config.techStack?.length ? config.techStack.join(', ') : 'No specific tech stack selected, determine best based on brief.'}
- Architecture Style: ${config.architecture || 'Standard modular architecture.'}
- Extra Dependencies: ${config.dependencies || 'None.'}
Instructions: Generate the complete boilerplate JSON based on the rules. Automatically hook up the dependency file to include the mentioned tech stack and dependencies.
`;

    const aiResponse = await this._groqService.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      false,
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
        generatedFiles = parsed.files.map((file: { path: string; content: string }) => {
          // Fallback: If AI mistakenly prepends the repo name as the root folder, strip it
          let filePath = file.path;
          const repoPrefix = config.name + '/';
          if (filePath.startsWith(repoPrefix)) {
            filePath = filePath.substring(repoPrefix.length);
          } else if (filePath.startsWith('./' + repoPrefix)) {
            filePath = filePath.substring(2 + repoPrefix.length);
          }
          return { ...file, path: filePath };
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
