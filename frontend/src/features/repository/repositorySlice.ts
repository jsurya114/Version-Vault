import { createSlice } from '@reduxjs/toolkit';
import { repositoryInitialState } from 'src/types/repository/repositoryTypes';
import {
  createRepositoryThunk,
  listRepositoryThunk,
  getRepositoryThunk,
  deleteRepositoryThunk,
} from './repositoryThunks';

const repositorySlice = createSlice({
  name: 'repository',
  initialState: repositoryInitialState,
  reducers: {
    clearSelectedRepository: (state) => {
      state.selectedRepository = null;
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
          (r) => r.id !== (action.meta.arg as any).reponame,
        );
      })
      .addCase(deleteRepositoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedRepository, clearError } = repositorySlice.actions;
export default repositorySlice.reducer;
