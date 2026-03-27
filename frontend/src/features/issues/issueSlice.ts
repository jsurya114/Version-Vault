import { createSlice } from '@reduxjs/toolkit';
import { issueInitialState } from '../../types/issues/issues.types';
import { createIssueThunk, listIssuesThunk, getIssueThunk, closeIssueThunk } from './issueThunk';

const issueSlice = createSlice({
  name: 'issue',
  initialState: issueInitialState,
  reducers: {
    clearSelectedIssue: (state) => {
      state.selectedIssue = null;
    },
    clearIssueError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // create
      .addCase(createIssueThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIssueThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues.unshift(action.payload);
      })
      .addCase(createIssueThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // list
      .addCase(listIssuesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listIssuesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(listIssuesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // get single
      .addCase(getIssueThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getIssueThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedIssue = action.payload;
      })
      .addCase(getIssueThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //close
      .addCase(closeIssueThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(closeIssueThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues = state.issues.map((issue) =>
          issue.id === action.payload.id ? action.payload : issue,
        );
        if (state.selectedIssue?.id === action.payload.id) {
          state.selectedIssue = action.payload;
        }
      })
      .addCase(closeIssueThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedIssue, clearIssueError } = issueSlice.actions;
export default issueSlice.reducer;
