export interface IChatMessage {
  id?: string;
  repositoryId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
