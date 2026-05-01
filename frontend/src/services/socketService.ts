import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

export const socketService = {
  //initial socket
  initSocket: (token: string) => {
    // If socket exists but token changed, disconnect old one
    if (socket && token && socket.auth && (socket.auth as { token?: string }).token !== token) {
      socket.disconnect();
      socket = null;
    }

    if (socket) return socket;

    socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket'], // Prefer websocket for better reliability on Render
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      // Socket connected successfully
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      // Fallback to polling if websocket is blocked
      if (socket && socket.io.opts.transports?.[0] === 'websocket') {
        console.warn('Attempting fallback to polling...');
        socket.io.opts.transports = ['polling', 'websocket'];
      }
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
  joinRun: (runId: string) => {
    socket?.emit('join_run', runId);
  },
  leaveRun: (runId: string) => {
    socket?.emit('leave_run', runId);
  },
  onRunLog: (callback: (data: { runId: string; logChunk: string }) => void) => {
    socket?.on('run_log', callback);
  },
  offRunLog: (callback: (data: { runId: string; logChunk: string }) => void) => {
    socket?.off('run_log', callback);
  },
};
