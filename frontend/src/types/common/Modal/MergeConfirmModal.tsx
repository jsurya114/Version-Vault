import { GitMerge, X } from 'lucide-react';

interface MergeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  prTitle: string;
  sourceBranch: string;
  targetBranch: string;
}

const MergeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  prTitle,
  sourceBranch,
  targetBranch,
}: MergeConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <GitMerge className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">Merge Pull Request</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-gray-300 text-sm font-medium mb-3 leading-relaxed">
            Are you sure you want to merge <span className="text-white font-bold">{prTitle}</span>?
          </p>
          <div className="flex items-center gap-2 text-[13px] bg-gray-900/80 p-2.5 rounded-lg border border-gray-800">
            <GitMerge className="w-4 h-4 text-purple-500" />
            <span className="text-gray-400">Merging</span>
            <span className="text-blue-400 font-mono py-0.5 px-2 bg-blue-500/10 rounded">
              {sourceBranch}
            </span>
            <span className="text-gray-500">into</span>
            <span className="text-green-400 font-mono py-0.5 px-2 bg-green-500/10 rounded">
              {targetBranch}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 text-white text-sm font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2"
          >
            <GitMerge className="w-4 h-4" />
            Confirm Merge
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeConfirmModal;
