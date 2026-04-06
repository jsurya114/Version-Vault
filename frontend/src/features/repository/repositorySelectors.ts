import { RootState } from '../../app/store';

import { createSelector } from '@reduxjs/toolkit';

const selectBaseState = (state: RootState) => state.repository;

export const selectRepositories = createSelector([selectBaseState], (state) => state.repositories);
export const selectSelectedRepository = createSelector(
  [selectBaseState],
  (state) => state.selectedRepository,
);
export const selectRepositoryLoading = createSelector(
  [selectBaseState],
  (state) => state.isLoading,
);
export const selectRepositoryError = createSelector([selectBaseState], (state) => state.error);
export const selectRepositoryMeta = createSelector([selectBaseState], (state) => state.meta);

export const selectFiles = createSelector([selectBaseState], (state) => state.files);
export const selectFileContent = createSelector([selectBaseState], (state) => state.fileContent);
export const selectCommits = createSelector([selectBaseState], (state) => state.commits);

export const selectFilesLoading = createSelector(
  [selectBaseState],
  (state) => state.isFilesLoading,
);

export const selectCommitsLoading = createSelector(
  [selectBaseState],
  (state) => state.isCommitsLoading,
);
export const selectBranches = createSelector([selectBaseState], (state) => state.branches || []);
export const selectRepositoryVisibilityError = createSelector(
  [selectBaseState],
  (state) => state.error,
);

export const selectIsForking = (state: RootState) => state.repository.isForking;
export const selectForkError = (state: RootState) => state.repository.forkError;

export const selectISstarring = (state: RootState) => state.repository.isStarring;
export const selectStarError = (state: RootState) => state.repository.starError;
