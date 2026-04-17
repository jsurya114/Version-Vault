export interface DeleteFileDTO {
  ownerId: string;
  ownerUsername: string;
  ownerEmail: string;
  repoName: string;
  branch: string;
  filePath: string;
  commitMessage: string;
}
