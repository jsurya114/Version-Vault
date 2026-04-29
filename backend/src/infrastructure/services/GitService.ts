import * as fs from 'fs';
import * as path from 'path';
import simpleGit from 'simple-git';
import { injectable } from 'tsyringe';
import { envConfig } from '../../shared/config/env.config';
import {
  GitFileEntry,
  GitCommit,
  GitBranch,
  FileDiff,
  DiffHunk,
  ConflictDetails,
  ConflictFile,
} from '../../domain/interfaces/IGitTypes';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { ConflictError } from '../../domain/errors/ConflictError';
import { logger } from '../../shared/logger/Logger';
import { Readable } from 'stream';
import { spawn } from 'child_process';

@injectable()
export class GitService {
  private repoBasePath: string;
  constructor() {
    this.repoBasePath = path.resolve(envConfig.GIT_REPO_PATH || './repos');

    //create base directory if it doesnt exist
    if (!fs.existsSync(this.repoBasePath)) {
      fs.mkdirSync(this.repoBasePath, { recursive: true });
    }
  }

  private getRepoPath(ownerUsername: string, repoName: string): string {
    return path.join(this.repoBasePath, ownerUsername, `${repoName}.git`);
  }

  private parseDiff(diffString: string): FileDiff[] {
    const files: FileDiff[] = [];
    const lines = diffString.split('\n');
    let currentFile: FileDiff | null = null;
    let currentHunk: DiffHunk | null = null;
    let oldLine = 0;
    let newLine = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('diff --git')) {
        const match = line.match(/a\/(.*) b\/(.*)$/);
        currentFile = {
          path: match ? match[2] : 'unknown',
          status: 'modified',
          additions: 0,
          deletions: 0,
          hunks: [],
        };
        files.push(currentFile);
        currentHunk = null;
      } else if (line.startsWith('new file mode')) {
        if (currentFile) currentFile.status = 'added';
      } else if (line.startsWith('deleted file mode')) {
        if (currentFile) currentFile.status = 'deleted';
      } else if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          oldLine = parseInt(match[1]);
          newLine = parseInt(match[2]);
        }
        currentHunk = { content: line, lines: [] };
        currentFile?.hunks.push(currentHunk);
      } else if (currentHunk) {
        if (line.startsWith('+')) {
          currentHunk.lines.push({
            type: 'added',
            content: line.slice(1),
            newLineNumber: newLine++,
          });
          if (currentFile) currentFile.additions++;
        } else if (line.startsWith('-')) {
          currentHunk.lines.push({
            type: 'deleted',
            content: line.slice(1),
            oldLineNumber: oldLine++,
          });
          if (currentFile) currentFile.deletions++;
        } else if (!line.startsWith('\\')) {
          currentHunk.lines.push({
            type: 'context',
            content: line.slice(1),
            oldLineNumber: oldLine++,
            newLineNumber: newLine++,
          });
        }
      }
    }
    return files;
  }

  private buildConflictContent(
    ourContent: string,
    theirContent: string,
    targetBranch: string,
    sourceBranch: string,
  ): string {
    const oursLines = ourContent.split('\n');
    const theirsLines = theirContent.split('\n');

    const result: string[] = [];
    const maxLen = Math.max(oursLines.length, theirsLines.length);

    let inConflict = false;
    let oursBlock: string[] = [];
    let theirsBlock: string[] = [];

    for (let i = 0; i < maxLen; i++) {
      const oursLine = i < oursLines.length ? oursLines[i] : undefined;
      const theirsLine = i < theirsLines.length ? theirsLines[i] : undefined;

      if (oursLine === theirsLine) {
        // Lines match — flush any pending conflict block first
        if (inConflict) {
          result.push(`<<<<<<< ${targetBranch}`);
          result.push(...oursBlock);
          result.push('=======');
          result.push(...theirsBlock);
          result.push(`>>>>>>> ${sourceBranch}`);
          oursBlock = [];
          theirsBlock = [];
          inConflict = false;
        }
        if (oursLine !== undefined) result.push(oursLine);
      } else {
        // Lines differ — accumulate into conflict block
        inConflict = true;
        if (oursLine !== undefined) oursBlock.push(oursLine);
        if (theirsLine !== undefined) theirsBlock.push(theirsLine);
      }
    }

    // Flush any remaining conflict at end of file
    if (inConflict) {
      result.push(`<<<<<<< ${targetBranch}`);
      result.push(...oursBlock);
      result.push('=======');
      result.push(...theirsBlock);
      result.push(`>>>>>>> ${sourceBranch}`);
    }

    return result.join('\n');
  }

  async createBranch(
    ownerUsername: string,
    repoName: string,
    newBranch: string,
    fromBranch: string,
  ): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      await git.raw(['branch', newBranch, fromBranch]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      if (msg.includes('not a valid object name')) {
        throw new ConflictError(
          `Cannot create a branch from '${fromBranch}'. The repository might be empty. Please commit at least one file first.`,
        );
      }
      throw new Error(`Failed to create branch: ${msg}`, { cause: error });
    }
  }
  async initBareRepo(ownerUsername: string, repoName: string): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);

    //create owner directory if it doesnt exist
    const ownerPath = path.join(this.repoBasePath, ownerUsername);
    if (!fs.existsSync(ownerPath)) {
      fs.mkdirSync(ownerPath, { recursive: true });
    }
    // create repo directory if it doesn't exist
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
    }

    //init bare repo
    await simpleGit(repoPath).init(['--bare']);
  }

  async deleteBareRepo(ownerUsername: string, repoName: string): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
  }

  repoExits(ownerUsername: string, repoName: string): boolean {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    return fs.existsSync(repoPath);
  }

  async ensureRepoExists(ownerUsername: string, repoName: string): Promise<void> {
    if (!this.repoExits(ownerUsername, repoName)) {
      await this.initBareRepo(ownerUsername, repoName);
    }
  }

  getFullRepoPath(ownerUsername: string, repoName: string): string {
    return this.getRepoPath(ownerUsername, repoName);
  }

  /**
   * Calculate the actual disk storage of a bare repository in bytes.
   */
  getRepoStorageBytes(ownerUsername: string, repoName: string): number {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    if (!fs.existsSync(repoPath)) return 0;
    return this.getDirSizeRecursive(repoPath);
  }

  private getDirSizeRecursive(dirPath: string): number {
    let totalSize = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        totalSize += this.getDirSizeRecursive(fullPath);
      } else {
        totalSize += fs.statSync(fullPath).size;
      }
    }
    return totalSize;
  }

  /**
   * Return just the count of branches (faster than returning full branch objects).
   */
  async getBranchCount(ownerUsername: string, repoName: string): Promise<number> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const result = await git.raw(['branch', '--list']);
      if (!result || !result.trim()) return 0;
      return result.trim().split('\n').filter(Boolean).length;
    } catch {
      return 0;
    }
  }

  /**
   * Extension → language name mapping.
   */
  private static readonly EXT_LANGUAGE_MAP: Record<string, string> = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.java': 'Java',
    '.kt': 'Kotlin',
    '.go': 'Go',
    '.rs': 'Rust',
    '.c': 'C',
    '.h': 'C',
    '.cpp': 'C++',
    '.hpp': 'C++',
    '.cs': 'C#',
    '.swift': 'Swift',
    '.php': 'PHP',
    '.html': 'HTML',
    '.htm': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'Sass',
    '.less': 'Less',
    '.vue': 'Vue',
    '.svelte': 'Svelte',
    '.json': 'JSON',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.xml': 'XML',
    '.md': 'Markdown',
    '.mdx': 'MDX',
    '.sql': 'SQL',
    '.sh': 'Shell',
    '.bash': 'Shell',
    '.zsh': 'Shell',
    '.ps1': 'PowerShell',
    '.dart': 'Dart',
    '.r': 'R',
    '.lua': 'Lua',
    '.ex': 'Elixir',
    '.exs': 'Elixir',
    '.erl': 'Erlang',
    '.scala': 'Scala',
    '.hs': 'Haskell',
    '.pl': 'Perl',
    '.dockerfile': 'Dockerfile',
  };

  async getLanguageStats(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
  ): Promise<{ name: string; percentage: number }[]> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);

    try {
      // ls-tree -r -l gives: <mode> <type> <hash> <size>\t<path>
      const result = await git.raw(['ls-tree', '-r', '-l', branch]);
      if (!result || !result.trim()) return [];

      const bytesPerLang: Record<string, number> = {};
      let totalBytes = 0;

      for (const line of result.trim().split('\n')) {
        // Format: "100644 blob <hash>   <size>\t<filepath>"
        const match = line.match(/^\d+\s+\w+\s+\S+\s+(\d+)\t(.+)$/);
        if (!match) continue;

        const fileSize = parseInt(match[1], 10);
        const filePath = match[2];
        const ext = path.extname(filePath).toLowerCase();

        // Special case: Dockerfile has no extension
        const baseName = path.basename(filePath).toLowerCase();
        let lang: string | undefined;
        if (baseName === 'dockerfile' || baseName.startsWith('dockerfile.')) {
          lang = 'Dockerfile';
        } else {
          lang = GitService.EXT_LANGUAGE_MAP[ext];
        }

        if (!lang) continue; // Skip unknown / config files

        bytesPerLang[lang] = (bytesPerLang[lang] || 0) + fileSize;
        totalBytes += fileSize;
      }

      if (totalBytes === 0) return [];

      return Object.entries(bytesPerLang)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / totalBytes) * 1000) / 10, // one decimal
        }))
        .sort((a, b) => b.percentage - a.percentage);
    } catch {
      return [];
    }
  }

  async getFiles(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
    filePath: string = '',
    recursive: boolean = false,
  ): Promise<GitFileEntry[]> {
    await this.ensureRepoExists(ownerUsername, repoName);
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);

    try {
      const treePath = filePath ? `${branch}:${filePath}` : `${branch}:`;

      const namesArgs = ['ls-tree', '--name-only', treePath];
      const typesArgs = ['ls-tree', treePath];

      if (recursive) {
        namesArgs.splice(1, 0, '-r');
        typesArgs.splice(1, 0, '-r');
      }

      logger.info(`[getFiles] Repo: ${repoPath}, Branch: ${branch}, treePath: ${treePath}`);

      const namesResult = await git.raw(namesArgs);
      const typesResult = await git.raw(typesArgs);

      logger.info(`[getFiles] namesResult length: ${namesResult ? namesResult.length : 0}`);

      if (!namesResult) return [];
      const names = namesResult.trim().split('\n').filter(Boolean);
      const typeLines = typesResult.trim().split('\n').filter(Boolean);

      return Promise.all(
        names.map(async (name) => {
          const typeLine = typeLines.find((l) => l.includes(name)) || '';
          const type = typeLine.includes('tree') ? 'tree' : 'blob';
          const relativePath = filePath ? `${filePath}/${name.trim()}` : name.trim();
          try {
            const log = await git.raw(['log', '-1', '--format=%s|%at', branch, '--', relativePath]);
            const [message, timestamp] = log.trim().split('|');
            return {
              name: recursive ? name.trim().split('/').pop() || '' : name.trim(),
              path: relativePath,
              type,
              lastCommitMessage: message || '',
              lastCommitDate: timestamp ? new Date(parseInt(timestamp) * 1000).toISOString() : '',
            };
          } catch {
            return {
              name: recursive ? name.trim().split('/').pop() || '' : name.trim(),
              path: relativePath,
              type,
            };
          }
        }),
      );
    } catch (error) {
      console.error(
        `[getFiles] ERROR for ${ownerUsername}/${repoName} branch=${branch} path=${filePath}`,
        error,
      );
      return [];
    }
  }

  async getFileContent(
    ownerUsername: string,
    repoName: string,
    filePath: string,
    branch: string = 'main',
  ): Promise<string> {
    await this.ensureRepoExists(ownerUsername, repoName);
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const content = await git.raw(['show', `${branch}:${filePath}`]); //show the file content
      return content;
    } catch (error: unknown) {
      console.error('error', error instanceof Error ? error.message : error);
      return '';
    }
  }

  async getCommits(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
    limit: number = 20,
  ): Promise<GitCommit[]> {
    await this.ensureRepoExists(ownerUsername, repoName);
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);

    try {
      const log = await git.log([branch, `--max-count=${limit}`]);
      return log.all.map((commit) => ({
        hash: commit.hash.substring(0, 7),
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
      }));
    } catch {
      return [];
    }
  }
  async getBranches(ownerUsername: string, repoName: string): Promise<GitBranch[]> {
    await this.ensureRepoExists(ownerUsername, repoName);
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const defaultBranch = 'main';
      const format =
        '%(refname:short)|%(committerdate:iso8601)|%(authorname)|%(authoremail)|%(subject)';
      const result = await git.raw(['branch', `--format=${format}`]);

      const branches = await Promise.all(
        result
          .trim()
          .split('\n')
          .filter(Boolean)
          .map(async (l) => {
            const [name, date, author, email, message] = l.split('|');

            let ahead = 0;
            let behind = 0;

            // Calculate Ahead/Behind if not the default branch
            if (name !== defaultBranch) {
              try {
                const counts = await git.raw([
                  'rev-list',
                  '--left-right',
                  '--count',
                  `${defaultBranch}...${name}`,
                ]);
                const [b, a] = counts.trim().split('\t');
                behind = parseInt(b, 10);
                ahead = parseInt(a, 10);
              } catch (e) {
                console.error(`Error calculating ahead/behind for ${name}:`, e);
              }
            }
            return {
              name,
              lastCommitDate: date,
              lastCommitAuthor: author,
              lastCommitAuthorEmail: email.replace(/[<>]/g, ''),
              lastCommitMessage: message,
              current: false,
              ahead,
              behind,
            };
          }),
      );
      return branches;
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  }

  async mergeBranch(
    ownerUsername: string,
    repoName: string,
    sourceBranch: string,
    targetBranch: string,
  ): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      //actually combines both the files and returns the tree hash
      const mergeTreeResult = await git.raw(['merge-tree', targetBranch, sourceBranch]);
      const treeHash = mergeTreeResult.trim();
      // If the output contains newlines, it likely contains conflict markers instead of a single hash
      if (!treeHash || treeHash.includes('\n')) {
        throw new Error('Merge conflict detected. Please resolve conflicts manually.');
      }
      //convert the names to hashes to understand by the git
      const targetHash = (await git.raw(['rev-parse', targetBranch])).trim();
      const sourceHash = (await git.raw(['rev-parse', sourceBranch])).trim();
      const commitMessage = `Merge branch '${sourceBranch}' into '${targetBranch}'`;
      const commitHash = (
        await git.raw([
          'commit-tree',
          treeHash,
          '-p',
          targetHash,
          '-p',
          sourceHash,
          '-m',
          commitMessage,
        ])
      ).trim();

      //Update the target branch reference to point to the new merge commit
      await git.raw(['update-ref', `refs/heads/${targetBranch}`, commitHash]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Merge failed for ${ownerUsername}/${repoName}:`, message);
      throw new Error(`Merge failed: ${message}`, { cause: error });
    }
  }

  async deleteBranch(ownerUsername: string, repoName: string, branchName: string): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);

    try {
      //bare repo  the safest way to delete a branch is to delete its ref
      await git.raw(['update-ref', '-d', `refs/heads/${branchName}`]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to delete branch ${branchName}:`, message);
      throw new Error(`Failed to delete branch: ${message}`, { cause: error });
    }
  }

  async commitChanges(
    ownerUsername: string,
    repoName: string,
    branch: string,
    message: string,
    filePath: string,
    content: string,
    authorName: string,
    authorEmail: string,
  ): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);

    const tempContentFile = path.join(repoPath, `content-${Date.now()}.tmp`);
    const indexFile = path.join(repoPath, `index-${Date.now()}.tmp`);
    try {
      fs.writeFileSync(tempContentFile, content);
      const git = simpleGit(repoPath);
      //create blob from the temporary file
      const blobHash = (await git.raw(['hash-object', '-w', tempContentFile])).trim();

      //set up git with temporary index file
      const gitWithIndex = simpleGit(repoPath).env({ ...process.env, GIT_INDEX_FILE: indexFile });

      //read current branch into the temporary index
      await gitWithIndex.raw(['read-tree', branch]);

      //update the index with the new blob
      await gitWithIndex.raw([
        'update-index',
        '--add',
        '--cacheinfo',
        '100644',
        blobHash,
        filePath,
      ]);

      //write the tree
      const treeHash = (await gitWithIndex.raw(['write-tree'])).trim();
      //create a commit object
      const parentHash = (await git.raw(['rev-parse', branch])).trim();
      const commitHash = (
        await git
          .env({
            ...process.env,
            GIT_AUTHOR_NAME: authorName,
            GIT_AUTHOR_EMAIL: authorEmail,
            GIT_COMMITTER_NAME: authorName,
            GIT_COMMITTER_EMAIL: authorEmail,
          })
          .raw(['commit-tree', treeHash, '-p', parentHash, '-m', message])
      ).trim();

      //update the branch reference to the new commit
      await git.raw(['update-ref', `refs/heads/${branch}`, commitHash]);
    } catch (error) {
      console.error('Commit operation failed:', error);
      throw new Error(
        `Commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          cause: error,
        },
      );
    } finally {
      // Cleanup
      if (fs.existsSync(tempContentFile)) fs.unlinkSync(tempContentFile);
      if (fs.existsSync(indexFile)) fs.unlinkSync(indexFile);
    }
  }

  async compareGitCommits(
    ownerUsername: string,
    repoName: string,
    targetBranch: string,
    sourceBranch: string,
  ): Promise<{
    commits: GitCommit[];
    filesChanged: number;
    contributors: number;
    isMergeable: boolean;
    diffs: FileDiff[];
  }> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const logRange = `${targetBranch}..${sourceBranch}`;
      const diffRange = `${targetBranch}...${sourceBranch}`;

      const log = await git.log([logRange]);
      // if(log.all.length===0){
      // try {
      //   const mergeCommitHash = await git.raw([
      //     'log',
      //     targetBranch,
      //     '--merges',
      //     `--grep=Merge branch '${sourceBranch}' into '${targetBranch}'`,
      //     '-n',
      //     '1',
      //     '--format=%H'
      //   ])
      //   if(mergeCommitHash.trim()){
      //     const hash = mergeCommitHash.trim()

      //                 logRange = `${hash}^1..${hash}^2`;
      //       diffRange = `${hash}^1...${hash}^2`;
      //       log = await git.log([logRange]);
      //   }
      // } catch (error) {

      // }
      // }

      const commits = log.all.map((commit) => ({
        hash: commit.hash.substring(0, 7),
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
      }));

      //files changed counts
      const diffSummary = await git.diffSummary([diffRange]);
      const filesChanged = diffSummary.files.length;
      //get unique contributors cout
      const contributors = new Set(log.all.map((c) => c.author_email)).size;

      let isMergeable = false;
      try {
        const mergeTreeResult = await git.raw(['merge-tree', targetBranch, sourceBranch]);
        isMergeable = !mergeTreeResult.trim().includes('\n') && mergeTreeResult.trim().length > 0;
      } catch {
        isMergeable = false;
      }

      const diffString = await git.raw(['diff', diffRange]);
      const diffs = this.parseDiff(diffString);

      return { commits, filesChanged, contributors, isMergeable, diffs };
    } catch (error) {
      console.error('Error comparing branches:', error);
      return { commits: [], filesChanged: 0, contributors: 0, isMergeable: false, diffs: [] };
    }
  }

  async forkBareRepo(
    sourceOwnerUsername: string,
    sourceRepoName: string,
    forkerUsername: string,
    newRepoName: string,
  ): Promise<void> {
    const sourceRepoPath = this.getRepoPath(sourceOwnerUsername, sourceRepoName);
    const newRepoPath = this.getRepoPath(forkerUsername, newRepoName);

    //ensure forker's base directory exists
    const forkerBasePath = path.join(this.repoBasePath, forkerUsername);
    if (!fs.existsSync(forkerBasePath)) {
      fs.mkdirSync(forkerBasePath, { recursive: true });
    }
    //verify source exists before duplicating
    if (!fs.existsSync(sourceRepoPath)) {
      throw new NotFoundError('Source repository disk contents not found');
    }
    //copy the entire bare reository contents

    fs.cpSync(sourceRepoPath, newRepoPath, { recursive: true });
  }

  async commitMultipleFiles(
    ownerUsername: string,
    repoName: string,
    branch: string,
    message: string,
    files: { filePath: string; tempDiskPath: string }[],
    authorName: string,
    authorEmail: string,
  ): Promise<void> {
    await this.ensureRepoExists(ownerUsername, repoName);
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const indexFile = path.join(repoPath, `index-${Date.now()}.tmp`);
    const git = simpleGit(repoPath);

    try {
      const gitWithIndex = simpleGit(repoPath).env({ ...process.env, GIT_INDEX_FILE: indexFile });
      // Read current branch into index if it exists, otherwise start fresh
      try {
        await gitWithIndex.raw(['read-tree', branch]);
      } catch {
        // Branch might not exist yet if this is the very first initial commit
      }
      for (const file of files) {
        // Hash the multer temporary file directly into the git objects database
        const blobHash = (await git.raw(['hash-object', '-w', file.tempDiskPath])).trim();
        // Add to our temporary index
        await gitWithIndex.raw([
          'update-index',
          '--add',
          '--cacheinfo',
          '100644',
          blobHash,
          file.filePath, // Ensure this path maintains folder structure (e.g., '../../components/Button.tsx')
        ]);
      }
      const treeHash = (await gitWithIndex.raw(['write-tree'])).trim();

      let parentAgrs: string[] = [];
      try {
        const parentHash = (await git.raw(['rev-parse', branch])).trim();
        parentAgrs = ['-p', parentHash];
      } catch {
        //no parent , this is the root commit
      }

      const commitHash = (
        await git
          .env({
            ...process.env,
            GIT_AUTHOR_NAME: authorName,
            GIT_AUTHOR_EMAIL: authorEmail,
            GIT_COMMITTER_NAME: authorName,
            GIT_COMMITTER_EMAIL: authorEmail,
          })
          .raw(['commit-tree', treeHash, ...parentAgrs, '-m', message])
      ).trim();
      //Update the branch reference so the commit actually shows up
      await git.raw(['update-ref', `refs/heads/${branch}`, commitHash]);
    } catch (error) {
      console.error('Multiple commit operation failed:', error);
      throw error;
    } finally {
      if (fs.existsSync(indexFile)) fs.unlinkSync(indexFile);
    }
  }

  async isAhead(
    ownerUsername: string,
    repoName: string,
    base: string,
    head: string,
  ): Promise<boolean> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      // Get number of commits that are in 'head' but not in 'base'
      const count = await git.raw(['rev-list', '--count', `${base}..${head}`]);
      if (parseInt(count.trim(), 10) === 0) return false;

      // Also check if there are actual file differences. If it's just a merge commit
      // that syncs head with base, there are no real changes to merge back.
      const diffOutput = await git.raw(['diff', '--name-only', `${base}...${head}`]);
      if (!diffOutput.trim()) return false;

      return true;
    } catch (error) {
      logger.error(`Error checking if ${head} is ahead of ${base}:`, error);
      return false;
    }
  }

  async deleteFile(
    ownerUsername: string,
    repoName: string,
    branch: string,
    message: string,
    filePath: string,
    authorName: string,
    authorEmail: string,
  ): Promise<void> {
    const repoPath = await this.getRepoPath(ownerUsername, repoName);
    const indexFile = path.join(repoPath, `index-${Date.now()}.tmp`);
    try {
      const git = simpleGit(repoPath);
      const gitWithIndex = git.env({
        GIT_INDEX_FILE: indexFile,
        GIT_AUTHOR_NAME: authorName,
        GIT_AUTHOR_EMAIL: authorEmail,
        GIT_COMMITTER_NAME: authorName,
        GIT_COMMITTER_EMAIL: authorEmail,
      });
      try {
        await gitWithIndex.raw(['read-tree', branch]);
      } catch {
        throw new Error('Branch does not exist');
      }
      await gitWithIndex.raw(['rm', '--cached', '--ignore-unmatch', filePath]);
      const newTreeHash = (await gitWithIndex.raw(['write-tree'])).trim();
      const parentHash = (await git.raw('rev-parse', branch)).trim();

      const commitHash = (
        await gitWithIndex.raw(['commit-tree', newTreeHash, '-p', parentHash, '-m', message])
      ).trim();
      await git.raw(['update-ref', `refs/heads/${branch}`, commitHash]);
    } finally {
      if (fs.existsSync(indexFile)) fs.unlinkSync(indexFile);
    }
  }

  async getConflictDetails(
    ownerUsername: string,
    repoName: string,
    sourceBranch: string,
    targetBranch: string,
  ): Promise<ConflictDetails> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const mergeTreeResult = await git.raw(['merge-tree', targetBranch, sourceBranch]);
      const output = mergeTreeResult.trim();
      // If single-line hash → no conflicts
      if (!output.includes('\n') && output.length > 0) {
        return { hasConflicts: false, conflictFiles: [] };
      }
      // Parse conflict file paths from merge-tree output.
      // merge-tree output contains lines like:
      //   changed in both
      //     base   100644 <hash> <path>
      //     our    100644 <hash> <path>
      //     their  100644 <hash> <path>
      // We look for lines with "changed in both" followed by file paths
      const conflictFiles: ConflictFile[] = [];
      const lines = output.split('\n');
      const conflictPaths = new Set<string>();
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Look for file paths in merge-tree output
        // Lines that contain blob hashes and file paths
        const blobMatch = line.match(/^\d+ [a-f0-9]+ \d+\t(.+)$/);
        if (blobMatch) {
          conflictPaths.add(blobMatch[1]);
          continue;
        }
        // Alternative: look for +++ or --- style conflict indicators
        if (line.startsWith('our') || line.startsWith('their')) {
          const pathMatch = line.match(/\S+\s+\d+\s+\S+\s+(.+)/);
          if (pathMatch) {
            conflictPaths.add(pathMatch[1]);
          }
        }
      }
      // If parsing didn't find specific paths, try diffing to find them
      if (conflictPaths.size === 0) {
        try {
          const diffOutput = await git.raw([
            'diff',
            '--name-only',
            `${targetBranch}...${sourceBranch}`,
          ]);
          const changedFiles = diffOutput.trim().split('\n').filter(Boolean);
          // Check each file for conflicts by trying to get content from both branches
          for (const filePath of changedFiles) {
            let oursContent = '';
            let theirsContent = '';
            try {
              oursContent = await git.raw(['show', `${targetBranch}:${filePath}`]);
            } catch {
              oursContent = ''; // file doesn't exist in target
            }
            try {
              theirsContent = await git.raw(['show', `${sourceBranch}:${filePath}`]);
            } catch {
              theirsContent = ''; // file doesn't exist in source
            }
            // Only treat as conflict if both branches have the file with different content
            if (oursContent && theirsContent && oursContent !== theirsContent) {
              conflictPaths.add(filePath);
            }
          }
        } catch {
          // fallback: return generic conflict info
        }
      }
      // Get file content from both branches for each conflicting file
      for (const filePath of conflictPaths) {
        let oursContent = '';
        let theirsContent = '';
        try {
          oursContent = await git.raw(['show', `${targetBranch}:${filePath}`]);
        } catch {
          oursContent = '';
        }
        try {
          theirsContent = await git.raw(['show', `${sourceBranch}:${filePath}`]);
        } catch {
          theirsContent = '';
        }
        // Build conflict markers
        const conflictContent = this.buildConflictContent(
          oursContent,
          theirsContent,
          targetBranch,
          sourceBranch,
        );
        conflictFiles.push({
          path: filePath,
          oursContent,
          theirsContent,
          conflictContent,
        });
      }
      return {
        hasConflicts: conflictFiles.length > 0,
        conflictFiles,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to get conflict details:`, message);
      throw new Error(`Failed to get conflict details: ${message}`, { cause: error });
    }
  }

  async resolveConflictsAndMerge(
    ownerUsername: string,
    repoName: string,
    sourceBranch: string,
    targetBranch: string,
    resolvedFiles: { filePath: string; content: string }[],
    authorName: string,
    authorEmail: string,
  ): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    const indexFile = path.join(repoPath, `index-merge-${Date.now()}.tmp`);
    try {
      const gitWithIndex = simpleGit(repoPath).env({
        ...process.env,
        GIT_INDEX_FILE: indexFile,
      });
      //read the target branch tree into index
      await gitWithIndex.raw(['read-tree', targetBranch]);
      //apply each resolved file
      for (const file of resolvedFiles) {
        //write the resolved content to a temp file, hahs it into git objects
        const tempFile = path.join(
          repoPath,
          `resolved-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`,
        );
        fs.writeFileSync(tempFile, file.content);
        try {
          const blobHash = (await git.raw(['hash-object', '-w', tempFile])).trim();
          await gitWithIndex.raw([
            'update-index',
            '--add',
            '--cacheinfo',
            '100644',
            blobHash,
            file.filePath,
          ]);
        } finally {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
      }
      // Write the merged tree
      const treeHash = (await gitWithIndex.raw(['write-tree'])).trim();
      // Get parent commits from both branches
      const targetHash = (await git.raw(['rev-parse', targetBranch])).trim();
      const sourceHash = (await git.raw(['rev-parse', sourceBranch])).trim();

      const commitMessage = `Merge branch '${sourceBranch}' into '${targetBranch}' (conflicts resolved)`;

      // Create merge commit with two parents
      const commitHash = (
        await git
          .env({
            ...process.env,
            GIT_AUTHOR_NAME: authorName,
            GIT_AUTHOR_EMAIL: authorEmail,
            GIT_COMMITTER_NAME: authorName,
            GIT_COMMITTER_EMAIL: authorEmail,
          })
          .raw(['commit-tree', treeHash, '-p', targetHash, '-p', sourceHash, '-m', commitMessage])
      ).trim();
      //update the target branch reference
      await git.raw(['update-ref', `refs/heads/${targetBranch}`, commitHash]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Conflict resolution merge failed:`, message);
      throw new Error(`Conflict resolution merge failed: ${message}`, { cause: error });
    } finally {
      if (fs.existsSync(indexFile)) fs.unlinkSync(indexFile);
    }
  }

  public async archiveRepo(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
  ): Promise<Readable> {
    const repoPath = path.join(this.repoBasePath, ownerUsername, `${repoName}.git`); //adjust base path as needed
    return new Promise((resolve, reject) => {
      //use git archive to stream a zip of the repository
      const gitArchive = spawn('git', ['archive', '--format=zip', branch], {
        cwd: repoPath,
      });
      gitArchive.stderr.on('data', (data) => {
        logger.error(`Git archive error: ${data.toString()}`);
      });
      gitArchive.on('error', (err) => {
        reject(new Error(`Failed to start git archive: ${err.message}`));
      });
      gitArchive.on('close', (code) => {
        if (code !== 0) {
          // If the stream is already resolving, this will just close it.
          // You might want a more sophisticated error state depending on your needs.
          logger.error(`git archive exited with code ${code}`);
        }
      });
      // We resolve with the stdout stream immediately so the controller can pipe it
      resolve(gitArchive.stdout as Readable);
    });
  }

  async renameBranch(
    ownerUsername: string,
    repoName: string,
    oldBranchName: string,
    newBranchName: string,
  ): Promise<void> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      await git.raw(['branch', '-m', oldBranchName, newBranchName]);
    } catch (error: unknown) {
      throw new Error(
        `Failed to rename branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { cause: error },
      );
    }
  }
}
