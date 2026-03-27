export interface GitFileEntry {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitBranch {
  name: string;
  lastCommitDate?: string;
  lastCommitAuthor?: string;
  current: boolean;
}

export interface CompareResponse {
  commits: GitCommit[];
  filesChanged: number;
  contributors: number;
}
