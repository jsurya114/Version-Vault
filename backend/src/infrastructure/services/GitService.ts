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
} from '../../domain/interfaces/IGitTypes';
import { NotFoundError } from 'src/domain/errors/NotFoundError';

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
      throw new Error(
        `Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { cause: error },
      );
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

  getFullRepoPath(ownerUsername: string, repoName: string): string {
    return this.getRepoPath(ownerUsername, repoName);
  }

  async getFiles(
    ownerUsername: string,
    repoName: string,
    branch: string = 'main',
    filePath: string = '',
    recursive: boolean = false,
  ): Promise<GitFileEntry[]> {
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
      // For type mapping, we also need ls-tree results

      //to get name only (to avoid the blob)
      const namesResult = await git.raw(namesArgs); //listing the files

      const typesResult = await git.raw(typesArgs);

      if (!namesResult) return [];
      const names = namesResult.trim().split('\n').filter(Boolean);
      const typeLines = typesResult.trim().split('\n').filter(Boolean);

      return names.map((name) => {
        const typeLine = typeLines.find((l) => l.includes(name)) || '';
        const type = typeLine.includes('tree') ? 'tree' : 'blob';
        return {
          name: recursive ? name.trim().split('/').pop() || '' : name.trim(),
          path: filePath ? `${filePath}/${name.trim()}` : name.trim(),
          type,
        };
      });
    } catch {
      return [];
    }
  }

  async getFileContent(
    ownerUsername: string,
    repoName: string,
    filePath: string,
    branch: string = 'main',
  ): Promise<string> {
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
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const format = '%(refname:short)|%(committerdate:iso8601)|%(authorname)';
      const result = await git.raw(['branch', `--format=${format}`]);
      return result
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((l) => {
          const [name, date, author] = l.split('|');
          return {
            name,
            lastCommitDate: date,
            lastCommitAuthor: author,
            current: false,
          };
        });
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
        const blobHash = await git.raw(['hash-object', '-w', file.tempDiskPath]);
        // Add to our temporary index
        await gitWithIndex.raw([
          'update-index',
          '--add',
          '--cacheinfo',
          '100644',
          blobHash,
          file.filePath, // Ensure this path maintains folder structure (e.g., 'src/components/Button.tsx')
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
}
