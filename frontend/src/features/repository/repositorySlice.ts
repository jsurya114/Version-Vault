import { createSlice } from '@reduxjs/toolkit';
import { GitBranch, repositoryInitialState } from '../../types/repository/repositoryTypes';
import {
  createRepositoryThunk,
  listRepositoryThunk,
  getRepositoryThunk,
  deleteRepositoryThunk,
  getCommitsThunk,
  getFileContentThunk,
  getFilesThunk,
  getBranchesThunk,
  createBranchThunk,
  deleteBranchThunk,
  createCommitThunk,
  updateVisibilityThunk,
  forkRepoThunk,
  toggleStarThunk,
  fileUploadThunk,
  getRecentPushThunk,
  deleteFileThunk,
} from './repositoryThunks';

const repositorySlice = createSlice({
  name: 'repository',
  initialState: repositoryInitialState,
  reducers: {
    clearSelectedRepository: (state) => {
      state.selectedRepository = null;
    },
    clearFiles: (state) => {
      state.files = [];
      state.fileContent = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //create
      .addCase(createRepositoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRepositoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repositories.unshift(action.payload);
      })
      .addCase(createRepositoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      //list
      .addCase(listRepositoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listRepositoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repositories = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(listRepositoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      //get single repository
      .addCase(getRepositoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRepositoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRepository = action.payload;
      })
      .addCase(getRepositoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //delete
      .addCase(deleteRepositoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRepositoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.repositories = state.repositories.filter(
          (r) => r.name !== (action.meta.arg as { reponame: string }).reponame,
        );
      })
      .addCase(deleteRepositoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //getFiles
      .addCase(getFilesThunk.pending, (state, action) => {
        if (!action.meta.arg?.recursive) {
          state.isFilesLoading = true;
          state.files = [];
        }
      })
      .addCase(getFilesThunk.fulfilled, (state, action) => {
        if (action.meta.arg.recursive) {
          state.allFiles = action.payload;
        } else {
          state.isFilesLoading = false;
          state.files = action.payload;
        }
      })
      .addCase(getFilesThunk.rejected, (state, action) => {
        if (!action.meta.arg?.recursive) {
          state.isFilesLoading = false;
        }
        state.error = action.payload as string;
      })

      //getfilecontent
      .addCase(getFileContentThunk.pending, (state) => {
        state.isFilesLoading = true;
      })
      .addCase(getFileContentThunk.fulfilled, (state, action) => {
        state.isFilesLoading = false;
        state.fileContent = action.payload;
      })
      .addCase(getFileContentThunk.rejected, (state) => {
        state.isFilesLoading = false;
      })

      //getcommits
      .addCase(getCommitsThunk.pending, (state) => {
        state.isCommitsLoading = true;
        state.commits = [];
      })
      .addCase(getCommitsThunk.fulfilled, (state, action) => {
        state.isCommitsLoading = false;
        state.commits = action.payload;
      })
      .addCase(getCommitsThunk.rejected, (state) => {
        state.isCommitsLoading = false;
      })

      //branches
      .addCase(getBranchesThunk.fulfilled, (state, action) => {
        state.branches = action.payload;
      })

      //create branch
      .addCase(createBranchThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBranchThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        //get new Branchname
        const newBranchName = action.meta.arg.newBranch;
        const author = action.payload.author;
        const newBranchObj: GitBranch = {
          name: newBranchName,
          lastCommitDate: new Date().toISOString(),
          lastCommitAuthor: author,
          current: false,
        };
        if (state.branches) {
          state.branches.push(newBranchObj);
        } else {
          state.branches = [newBranchObj];
        }
      })
      .addCase(createBranchThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteBranchThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBranchThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedBranchName = action.meta.arg.branchName;

        // Filter out the deleted branch from the state
        if (state.branches) {
          state.branches = state.branches.filter((b) => b.name !== deletedBranchName);
        }
      })
      .addCase(deleteBranchThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //create commit
      .addCase(createCommitThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCommitThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createCommitThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //visibility
      .addCase(updateVisibilityThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVisibilityThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // Using the reponame that was passed into the thunk
        const { reponame } = action.meta.arg;
        // Update the repository if it's currently selected
        if (state.selectedRepository && state.selectedRepository.name === reponame) {
          state.selectedRepository.visibility = action.payload.visibility;
        }

        state.repositories = state.repositories.map((repo) =>
          repo.name === reponame ? { ...repo, visibility: action.payload.visibility } : repo,
        );
      })
      .addCase(updateVisibilityThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //fork
      .addCase(forkRepoThunk.pending, (state) => {
        state.isForking = true;
        state.forkError = null;
      })
      .addCase(forkRepoThunk.fulfilled, (state, action) => {
        state.isForking = false;
        state.repositories.push(action.payload);
      })
      .addCase(forkRepoThunk.rejected, (state, action) => {
        state.isForking = false;
        state.forkError = action.payload as string;
      })

      .addCase(toggleStarThunk.pending, (state) => {
        state.isStarring = true;
        state.error = null;
      })
      .addCase(toggleStarThunk.fulfilled, (state, action) => {
        state.isStarring = false;
        const { starsCount } = action.payload;
        const { username, reponame } = action.meta.arg;
        if (state.selectedRepository && state.selectedRepository.name === reponame) {
          state.selectedRepository.stars = action.payload.starsCount;
        }
        state.repositories = state.repositories.map((repo) =>
          repo.name === reponame && repo.ownerUsername === username
            ? { ...repo, stars: starsCount }
            : repo,
        );
      })
      .addCase(toggleStarThunk.rejected, (state, action) => {
        state.isStarring = false;
        state.starError = action.payload as string;
      })

      .addCase(fileUploadThunk.pending, (state) => {
        state.isUploading = true;
        state.uploadError = null;
      })
      .addCase(fileUploadThunk.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(fileUploadThunk.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadError = action.payload as string;
      })

      //getActive branches
      .addCase(getRecentPushThunk.fulfilled, (state, action) => {
        state.activeBranches = action.payload;
      })

      .addCase(deleteFileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFileThunk.fulfilled, (state) => {
        state.isLoading = false;
        // Note: We don't splice `state.files` manually here.
        // We dispatch `getFilesThunk` from the component immediately after completion
        // to fetch the raw refreshed tree from the backend to ensure zero desyncs!
      })
      .addCase(deleteFileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedRepository, clearError } = repositorySlice.actions;
export default repositorySlice.reducer;
