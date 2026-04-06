import { createAsyncThunk } from '@reduxjs/toolkit';
import { commentSerivce } from '../../services/comment.service';
import {
  FetchCommentsParams,
  CreateCommentParams,
  CommentResponseDTO,
  CommentState,
} from 'src/types/comment/commentTypes';

export const fetchCommentThunk = createAsyncThunk<
  { data: CommentResponseDTO[]; meta: CommentState['meta'] },
  FetchCommentsParams
>('comments/fetch', async (params, { rejectWithValue }) => {
  try {
    const response = await commentSerivce.fetchComments(params);
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch comments');
  }
});

export const createCommentThunk = createAsyncThunk<CommentResponseDTO, CreateCommentParams>(
  'comments/create',
  async (params, { rejectWithValue }) => {
    try {
      const response = await commentSerivce.createComments(params);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create comment');
    }
  },
);

export const deleteCommentThunk = createAsyncThunk<string, { commentId: string }>(
  'comments/delete',
  async ({ commentId }, { rejectWithValue }) => {
    try {
      await commentSerivce.deleteComment(commentId);
      return commentId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete comment');
    }
  },
);
