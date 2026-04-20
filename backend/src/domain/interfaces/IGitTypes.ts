export interface GitFileEntry {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  lastCommitMessage?: string;
  lastCommitDate?: string;
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
  lastCommitAuthorEmail?: string;
  lastCommitMessage?: string;
  current: boolean;
  ahead?: number;
  behind?: number;
  prId?: string;
  prNumber?: number;
  prStatus?: 'open' | 'closed' | 'merged';
}

export interface DiffLine {
  type: 'added' | 'deleted' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffHunk {
  content: string;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  status: 'added' | 'deleted' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface CompareResponse {
  commits: GitCommit[];
  filesChanged: number;
  contributors: number;
  isMergeable: boolean;
  diffs: FileDiff[];
}

export interface ConflictFile {
  path: string;
  oursContent: string;
  theirsContent: string;
  conflictContent: string;
}

export interface ConflictDetails {
  hasConflicts: boolean;
  conflictFiles: ConflictFile[];
}
