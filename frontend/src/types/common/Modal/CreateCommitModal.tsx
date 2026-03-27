import { useState } from 'react';
import { GitCommit, X } from 'lucide-react';
import { useAppDispatch } from '../../../app/hooks';
import {
  createCommitThunk,
  getFilesThunk,
  getCommitsThunk,
  getFileContentThunk,
} from '../../../features/repository/repositoryThunks';

interface CommitModalProps {
  username: string;
  reponame: string;
  branch: string;
  filePath: string;
  content: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CommitModal = ({
  username,
  reponame,
  branch,
  filePath,
  content,
  onSuccess,
  onCancel,
}: CommitModalProps) => {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('Update ' + filePath.split('/').pop());
  const [isLoading, setIsLoading] = useState(false);

  const handleCommit = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      // 1. Dispatch the commit
      await dispatch(
        createCommitThunk({
          username,
          reponame,
          branch,
          message,
          filePath,
          content,
        }),
      ).unwrap();

      // 2. Refresh data from within the modal
      dispatch(getFilesThunk({ username, reponame, branch, path: '' }));
      dispatch(getCommitsThunk({ username, reponame, branch }));

      dispatch(
        getFileContentThunk({
          username,
          reponame,
          branch,
          filePath,
        }),
      );

      // 3. Notify parent of success
      onSuccess();
    } catch (err) {
      console.error('Commit failed:', err);
      // Error is usually handled by the global repository slice error state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
            <GitCommit className="w-4 h-4 text-blue-400" />
            Commit changes
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-gray-500 text-[10px] mb-2 uppercase tracking-wider font-bold">
              Commit message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 font-medium focus:outline-none placeholder-gray-600 transition"
              placeholder="Ex: fix: resolve login bug"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCommit}
              disabled={!message.trim() || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition shadow-lg shadow-blue-900/20"
            >
              {isLoading ? 'Committing...' : 'Commit changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitModal;
