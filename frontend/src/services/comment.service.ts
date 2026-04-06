import axiosInstance from './axiosInstance';
import { FetchCommentsParams, CreateCommentParams } from '../types/comment/commentTypes';
import { COMMENT_ENDPOINTS } from '../constants/api';

export const commentSerivce = {
  fetchComments: async (data: FetchCommentsParams) => {
    const params = {
      page: data.page || 1,
      limit: 5,
    };
    const response = await axiosInstance.get(
      `${COMMENT_ENDPOINTS.BASE}/${data.username}/${data.reponame}/${data.targetType}/${data.targetId}`,
      { params },
    );
    return response.data;
  },

  createComments: async (data: CreateCommentParams) => {
    const response = await axiosInstance.post(
      `${COMMENT_ENDPOINTS.BASE}/${data.username}/${data.reponame}/${data.targetType}/${data.targetId}`,
      { content: data.content },
    );
    return response.data.data;
  },
  deleteComment: async (commentId: string) => {
    const response = await axiosInstance.delete(`${COMMENT_ENDPOINTS.BASE}/${commentId}`);
    return response.data;
  },
};
