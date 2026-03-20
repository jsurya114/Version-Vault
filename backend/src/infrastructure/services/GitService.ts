import * as fs from 'fs';
import * as path from 'path';
import simpleGit from 'simple-git';
import { injectable } from 'tsyringe';
import { envConfig } from 'src/shared/config/env.config';
import { GitFileEntry, GitCommit } from 'src/domain/interfaces/IGitTypes';

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
  ): Promise<GitFileEntry[]> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);

    try {
      const treePath = filePath ? `${branch}:${filePath}` : `${branch}:`;
      //to get name only (to avoid the blob)
      const namesResult = await git.raw(['ls-tree', '--name-only', treePath]);

      const typesResult = await git.raw(['ls-tree', treePath]);

      if (!namesResult) return [];
      const names = namesResult.trim().split('\n').filter(Boolean);
      const typeLines = typesResult.trim().split('\n').filter(Boolean);

      return names.map((name, i) => {
        const typeLine = typeLines.find((l) => l.includes(name)) || '';
        const type = typeLine.includes('tree') ? 'tree' : 'blob';
        return {
          name: name.trim(),
          path: filePath ? `${filePath}/${name.trim()}` : name.trim(),
          type,
        };
      });
    } catch (error: any) {
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
      const content = await git.raw(['show', `${branch}:${filePath}`]);
      console.log('file content:', JSON.stringify(content));
      return content;
    } catch (error: any) {
      console.log('error', error);
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
    } catch (error: any) {
      return [];
    }
  }
  async getBranches(ownerUsername: string, repoName: string): Promise<string[]> {
    const repoPath = this.getRepoPath(ownerUsername, repoName);
    const git = simpleGit(repoPath);
    try {
      const branches = await git.branch();
      return branches.all;
    } catch (error) {
      return [];
    }
  }
}
