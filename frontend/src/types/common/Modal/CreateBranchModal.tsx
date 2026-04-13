import { useState } from 'react';
import { GitBranch as GitBranchIcon, X } from 'lucide-react';

import { GitBranch } from '../../../types/repository/repositoryTypes';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newBranch: string, fromBranch: string) => void;
  currentBranch: string;
  branches: GitBranch[];
  isLoading?: boolean;
}

const CreateBranchModal = ({
  isOpen,
  onClose,
  onConfirm,
  currentBranch,
  branches,
  isLoading,
}: CreateBranchModalProps) => {
  const [newBranch, setNewBranch] = useState('');
  const [fromBranch, setFromBranch] = useState(currentBranch);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!newBranch.trim()) return;
    onConfirm(newBranch.trim(), fromBranch);
    setNewBranch('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <GitBranchIcon className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-white font-semibold">Create New Branch</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* From branch */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">From branch</label>
            <select
              value={fromBranch}
              onChange={(e) => setFromBranch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-blue-500"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* New branch name */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">New branch name</label>
            <input
              type="text"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              placeholder="feature/my-new-feature"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!newBranch.trim() || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
          >
            {isLoading ? 'Creating...' : 'Create Branch'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBranchModal;
