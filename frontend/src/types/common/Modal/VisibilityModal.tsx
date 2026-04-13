import { Shield, Globe, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface VisibilityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  repoName: string;
  newVisibility: 'public' | 'private';
  isLoading?: boolean;
}

const VisibilityConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  repoName,
  newVisibility,
  isLoading,
}: VisibilityConfirmModalProps) => {
  const [confirmValue, setConfirmValue] = useState('');
  const isPublic = newVisibility === 'public';

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmValue === repoName) {
      onConfirm();
      setConfirmValue('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isPublic
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}
            >
              {isPublic ? <Globe className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-white font-bold">Change Visibility</h2>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                To {newVisibility}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Section */}
        <div
          className={`rounded-xl p-4 mb-6 border ${
            isPublic ? 'bg-blue-500/5 border-blue-500/20' : 'bg-yellow-500/5 border-yellow-500/20'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${isPublic ? 'text-blue-400' : 'text-yellow-400'}`}
            />
            <div>
              <p
                className={`text-sm font-semibold mb-1 ${isPublic ? 'text-blue-200' : 'text-yellow-200'}`}
              >
                Please read this carefully
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                {isPublic
                  ? 'Changing this repository to PUBLIC will make it visible to anyone on the internet. All code, commit history, and branches will be accessible.'
                  : 'Changing this repository to PRIVATE will hide it from everyone except authorized collaborators. Public forks and stars will be affected.'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            Type <span className="text-white font-mono">{repoName}</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder={repoName}
            className={`w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-700 transition-all focus:outline-none focus:ring-2 ${
              isPublic
                ? 'focus:ring-blue-500/20 focus:border-blue-500/50'
                : 'focus:ring-yellow-500/20 focus:border-yellow-500/50'
            }`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold py-3 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmValue !== repoName || isLoading}
            className={`flex-1 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${
              isPublic
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                : 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20'
            }`}
          >
            {isLoading ? 'Updating...' : `Make ${newVisibility}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisibilityConfirmModal;
