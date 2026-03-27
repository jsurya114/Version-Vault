import { GitCommit } from '../repository/repositoryTypes';

export interface CompareState {
  data: {
    commits: GitCommit[];
    filesChanged: number;
    contributors: number;
    isMergeable: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: CompareState = {
  data: null,
  isLoading: false,
  error: null,
};
