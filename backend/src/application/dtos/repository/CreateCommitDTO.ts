export interface CreateCommitDTO {
  ownerUsername: string;
  repoName: string;
  branch: string;
  message: string;
  filePath: string;
  content: string;
  authorName: string;
  authorEmail: string;
}
