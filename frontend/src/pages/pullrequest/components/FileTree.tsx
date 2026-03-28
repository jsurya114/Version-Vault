import { FileDiff } from '../../../types/commit/commit.types';
import { FileCode, ChevronRight } from 'lucide-react';

interface FileTreeProps {
  diffs: FileDiff[];
  onSelect: (path: string) => void;
}

export const FileTree = ({ diffs, onSelect }: FileTreeProps) => {
  return (
    <div className="w-64 flex-shrink-0 sticky top-8 h-fit bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex items-center gap-2">
        <FileCode className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Files</span>
      </div>
      <div className="py-2 max-h-[70vh] overflow-y-auto">
        {diffs.map((file) => (
          <div
            key={file.path}
            onClick={() => onSelect(file.path)}
            className="px-4 py-2 hover:bg-white/5 cursor-pointer flex items-center gap-2 group transition-colors"
          >
            <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-blue-500 transition-colors" />
            <span className="text-[12px] text-gray-400 group-hover:text-gray-200 truncate font-medium">
              {file.path.split('/').pop()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
