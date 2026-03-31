import React from 'react';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FollowDTO } from '../../../types/follow/followTypes';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: 'Followers' | 'Following';
  data: FollowDTO[];
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div
        className="bg-[#0d1117] border border-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#161b22]/30">
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {data.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No {title.toLowerCase()} yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {data.map((item) => {
                const username =
                  title === 'Followers' ? item.followerUsername : item.followingUsername;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleUserClick(username)}
                    className="flex items-center gap-3 p-3 hover:bg-[#161b22] rounded-xl cursor-pointer transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-gray-700 flex items-center justify-center text-blue-400 font-bold group-hover:border-blue-500/50">
                      {username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm group-hover:text-blue-400">
                        {username}
                      </p>
                      <p className="text-gray-500 text-xs">@{username}</p>
                    </div>
                    <button className="text-[10px] uppercase tracking-widest px-3 py-1 bg-[#161b22] border border-gray-700 rounded-lg text-gray-400 font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
