export interface CreateCommentDTO {
  targetId: string;
  targetType: 'issue' | 'pr';
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface CommentResponseDTO {
  id: string;
  targetId: string;
  targetType: 'issue' | 'pr';
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: Date;
}
