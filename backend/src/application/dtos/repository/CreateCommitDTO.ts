export interface CreateCommitDTO {
  branch: string;
  message: string;
  filePath: string;
  content: string;
  authorName: string;
  authorEmail: string;
}