export interface ISocketEmitter {
  emitToUser(userId: string, event: string, data: unknown): void;
  emitToRoom(room: string, event: string, data: unknown): void;
}
