import { GitCommit } from '../repository/repositoryTypes';

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

export interface CompareState {
  data: {
    commits: GitCommit[];
    filesChanged: number;
    contributors: number;
    isMergeable: boolean;
    diffs: FileDiff[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: CompareState = {
  data: null,
  isLoading: false,
  error: null,
};
