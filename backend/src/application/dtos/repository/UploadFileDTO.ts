export interface UploadFilesDTO {
  ownerId: string;
  ownerUsername: string;
  ownerEmail: string;
  repoName: string;
  files: { filePath: string; tempDiskPath: string }[];
  branch?: string;
  commitMessage?: string;
}
