// src/pages/user/components/EditProfileModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateProfileThunk } from 'src/features/user/userThunk';
import { selectUserLoading } from 'src/features/user/userSelector';

interface EditProfileModalProps {
  user: any; // The logged-in user object
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose }) => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectUserLoading);

  // State for form fields
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || '');
  const [preview, setPreview] = useState(user.avatar);
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a local blob URL for immediate preview
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData for Multer to handle multipart/form-data
    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    if (file) {
      formData.append('avatar', file); // 'avatar' must match the multer.single() field name
    }

    const result = await dispatch(updateProfileThunk(formData));
    if (updateProfileThunk.fulfilled.match(result)) {
      onClose(); // Only close if the update was successful
    }
  };

  // Cleanup blob URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div
        className="bg-[#0d1117] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#161b22]/30">
          <h2 className="text-xl font-bold text-white tracking-tight">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div
              className="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border-2 border-gray-800 hover:border-blue-500 transition-all shadow-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={preview || 'https://via.placeholder.com/150'}
                alt="Avatar Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-7 h-7 mb-1" />
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                  Change
                </span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleImageChange}
              accept="image/*"
            />
            <p className="mt-3 text-[11px] font-medium text-blue-400 uppercase tracking-widest">
              Profile Picture
            </p>
          </div>

          <div className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#161b22] border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                placeholder="How should we call you?"
              />
            </div>

            {/* Bio TextArea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#161b22] border border-gray-700 rounded-xl p-3 text-white h-28 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Tell the world about yourself..."
              />
            </div>
          </div>
        </form>

        {/* Action Footer */}
        <div className="p-4 bg-[#161b22]/50 flex justify-end gap-3 border-t border-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="relative bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 group overflow-hidden"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />
            )}
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};
