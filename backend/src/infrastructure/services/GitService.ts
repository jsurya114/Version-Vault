import * as fs from 'fs';
import * as path from 'path';
import simpleGit from 'simple-git';
import { injectable } from 'tsyringe';
import { envConfig } from 'src/shared/config/env.config';

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
}
