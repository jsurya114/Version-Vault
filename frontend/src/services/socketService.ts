import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

export const socketService = {
  //initial socket
  initSocket: (token: string) => {
    if (socket) return socket;
    socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
    return socket;
  },

  //get existing instance
  getSocket: () => socket,

  //cleanup
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
  //chatroom management
  joinRequest: (repositoryId: string) => {
    socket?.emit('join_repo', repositoryId);
  },
  //send real-time message
  sendMessage: (repositoryId: string, content: string) => {
    socket?.emit('send_message', { repositoryId, content });
  },
};
