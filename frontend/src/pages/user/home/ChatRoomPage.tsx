import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuthUser } from '../../../features/auth/authSelectors';
import {
  fetchChatHistoryThunk,
  listChatRepoThunk,
  deleteMessageThunk,
} from '../../../features/chats/chatThunk';
import { selectChatMessages, selectChatConversations } from '../../../features/chats/chatSelector';
import { socketService } from '../../../services/socketService';
import { receiveNewMessage, clearChatState } from '../../../features/chats/chatSlice';
import AppHeader from '../../../types/common/Layout/AppHeader';
import ConfirmModal from '../../../types/common/Modal/ConfirmModal';

const ChatRoomPage = () => {
  const { username, reponame } = useParams<{ username: string; reponame: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectAuthUser);
  const messages = useAppSelector(selectChatMessages);
  const conversations = useAppSelector(selectChatConversations);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(listChatRepoThunk());
  }, [dispatch]);

  useEffect(() => {
    if (username && reponame) {
      dispatch(clearChatState());
      dispatch(fetchChatHistoryThunk({ username, reponame }));
      const socket = socketService.initSocket('');
      const joinRoom = () => {
        setIsSocketConnected(true);
        socketService.joinRequest(`${username}/${reponame}`);
      };
      if (socket.connected) joinRoom();
      socket.on('connect', joinRoom);
      socket.on('receive_message', (msg) => dispatch(receiveNewMessage(msg)));
      return () => {
        socket.off('receive_message');
        socket.off('connect');
        socketService.disconnect();
      };
    }
  }, [username, reponame, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (content.trim() && username && reponame) {
      socketService.sendMessage(`${username}/${reponame}`, content.trim());
      setContent('');
    }
  };

  const openDeleteModal = (messageId: string) => {
    setMessageToDeleteId(messageId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (messageToDeleteId) {
      dispatch(deleteMessageThunk(messageToDeleteId));
      setIsDeleteModalOpen(false);
      setMessageToDeleteId(null);
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden font-sans">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR: List of Collaborative Chats */}
        <aside className="w-80 border-r border-gray-800 bg-gray-900/40 flex flex-col shadow-xl">
          <div className="p-4 border-b border-gray-800 bg-gray-900/20">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-500" /> Chats
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations && conversations.length > 0 ? (
              conversations.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}/chat`)}
                  className={`p-4 flex items-center gap-3 cursor-pointer border-b border-gray-800/30 transition-all hover:bg-gray-800/50 ${
                    reponame === repo.name ? 'bg-blue-600/15 border-r-4 border-r-blue-500' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold shadow-inner">
                    {repo.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                    <h3 className="text-sm font-semibold truncate leading-tight">{repo.name}</h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      @{repo.ownerUsername}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${reponame === repo.name ? 'text-blue-500' : 'text-gray-700'}`}
                  />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-600 text-sm">
                No active collaborations found.
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col relative bg-gray-950/80">
          {username && reponame ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 bg-gray-900/40 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3 font-semibold">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-sm shadow-lg">
                    {reponame[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm">{reponame}</h2>
                    <p
                      className={`text-[10px] ${isSocketConnected ? 'text-green-500' : 'text-yellow-500'}`}
                    >
                      {isSocketConnected ? '• Connected' : '• Connecting...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Content */}
              <div
                ref={scrollRef}
                className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar"
              >
                {messages?.map((msg) => {
                  const isMe =
                    msg.senderId === currentUser?.id || msg.senderId === currentUser?.userId;

                  return (
                    <div
                      key={msg.id}
                      className={`group relative flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Delete Button - Only for current user's messages */}
                      {isMe && (
                        <button
                          onClick={() => openDeleteModal(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all duration-200 order-first"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div
                        className={`max-w-[70%] p-3 px-4 rounded-2xl text-[13px] shadow-sm border ${
                          isMe
                            ? 'bg-gray-800 border-gray-700 text-gray-200 rounded-tr-none ml-2'
                            : 'bg-blue-600 border-blue-500 text-white rounded-tl-none mr-12'
                        }`}
                      >
                        <p
                          className={`text-[10px] font-bold mb-1 ${isMe ? 'text-blue-400 text-right' : 'text-blue-100'}`}
                        >
                          {isMe ? 'You' : msg.senderUsername}
                        </p>

                        <p className="leading-relaxed break-words">{msg.content}</p>

                        <p
                          className={`text-[9px] mt-1 opacity-50 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <Clock className="w-2 h-2" />
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-gray-900/60 border-t border-gray-800 flex gap-3 backdrop-blur-md">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800/80 rounded-xl px-4 py-2.5 border-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!content.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            /* Empty State Container */
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
              <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center mb-6 shadow-2xl border border-gray-800">
                <MessageSquare className="w-12 h-12 text-gray-700" />
              </div>
              <p className="text-lg font-medium">Select a repository to start chatting</p>
              <p className="text-sm mt-1">Chat is only available for collaborative repositories.</p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        confirmColor="bg-red-600"
        icon={<Trash2 className="w-5 h-5 text-red-500" />}
      />
    </div>
  );
};

export default ChatRoomPage;
