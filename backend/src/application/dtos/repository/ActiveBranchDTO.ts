export interface ActiveBranchDTO {
  name: string;
  lastCommitDate: string;
  lastCommitAuthor: string;
  lastCommitMessage: string;
  isRejected?: boolean;
}
