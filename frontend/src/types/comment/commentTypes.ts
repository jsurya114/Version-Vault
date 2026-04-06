export interface CommentResponseDTO {
  id: string;
  targetId: string;
  targetType: 'issue' | 'pr';
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface CommentState {
  comments: CommentResponseDTO[];
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FetchCommentsParams {
  username: string;
  reponame: string;
  targetType: 'issue' | 'pr';
  targetId: string;
  page?: number;
}

export interface CreateCommentParams {
  username: string;
  reponame: string;
  targetType: 'issue' | 'pr';
  targetId: string;
  content: string;
}

export const initialState: CommentState = {
  comments: [],
  isLoading: false,
  error: null,
  meta: { total: 0, page: 1, limit: 5, totalPages: 1 },
};
