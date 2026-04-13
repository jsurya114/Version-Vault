import { useState } from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemPath: string; // The specific string to type (e.g. "user/repo" or "branch-name")
  itemName: string; // The type of item (e.g. "repository" or "branch")
  isLoading?: boolean;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemPath,
  itemName,
  isLoading,
}: DeleteConfirmModalProps) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (input === itemPath) {
      onConfirm();
      setInput('');
    }
  };

  const handleClose = () => {
    setInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-white font-semibold capitalize">Delete {itemName}</h2>
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm font-medium mb-1">This action cannot be undone</p>
          <p className="text-gray-400 text-xs">
            This will permanently delete the{' '}
            <span className="text-white font-mono">{itemPath}</span> {itemName.toLowerCase()}
            {itemName.toLowerCase() === 'repository' &&
              ', including all commits, branches, and files'}
            .
          </p>
        </div>

        {/* Confirmation input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-2">
            To confirm, type <span className="text-white font-mono font-medium">{itemPath}</span>{' '}
            below:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={itemPath}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={input !== itemPath || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
          >
            {isLoading ? 'Deleting...' : `Delete ${itemName}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
