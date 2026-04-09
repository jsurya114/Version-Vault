import React from 'react';
import { X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserResponseDTO } from '../../../types/admin/adminTypes';

interface StarListModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserResponseDTO[];
}

export const StarListModal: React.FC<StarListModalProps> = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#161b22]/30">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-400 fill-blue-400" />
            Starred By
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {data.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No stars yet.</p>
            </div>
          ) : (
            data.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  navigate(`/profile/${user.username}`);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 hover:bg-[#161b22] rounded-xl cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-gray-700 flex items-center justify-center text-blue-400 font-bold group-hover:border-blue-500/50">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm group-hover:text-blue-400">
                    {user.username}
                  </p>
                  <p className="text-gray-500 text-xs">@{user.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
