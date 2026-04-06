export interface IComment {
  id?: string;
  targetId: string; //id of pr or issue
  targetType: 'issue' | 'pr';
  repositoryId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
