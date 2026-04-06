import { createSlice } from '@reduxjs/toolkit';
import { createCommentThunk, fetchCommentThunk, deleteCommentThunk } from './commentThunk';
import { initialState } from '../../types/comment/commentTypes';

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.error = null;
      state.meta = initialState.meta;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(fetchCommentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const incoming = action.payload.data || [];
        const meta = action.payload.meta;
        if (meta?.page === 1) {
          state.comments = incoming;
        } else {
          state.comments = [...state.comments, ...incoming];
        }
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchCommentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      //create
      .addCase(createCommentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments.push(action.payload);
      })
      .addCase(createCommentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      //dlete
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.comments = state.comments.filter((comment) => comment.id !== deletedId);
      });
  },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
