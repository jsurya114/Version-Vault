import React, { useCallback } from 'react';
import { FileCode } from 'lucide-react';
import { FileTree } from './FileTree';
import { FileDiffViewer } from './DiffViewer';

import { FileDiff } from '../../../types/commit/commit.types';

interface CommitDiffsProps {
  diffs: FileDiff[];
  filesChanged: number;
}

export const CommitDiffs = React.memo(({ diffs, filesChanged }: CommitDiffsProps) => {
  const handleSelect = useCallback((path: string) => {
    document.getElementById(path)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <div className="mt-12 flex gap-8 pt-12 border-t border-gray-800">
        <FileTree diffs={diffs} onSelect={handleSelect} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-gray-400" />
              {diffs.length} files changed
            </h2>
          </div>

          <div className="space-y-6">
            {diffs.map((file: FileDiff) => (
              <div id={file.path} key={file.path}>
                <FileDiffViewer file={file} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-800 flex items-center justify-between opacity-70">
        <div className="flex items-center gap-2 text-gray-500 text-[13px]">
          <FileCode className="w-4 h-4" />
          <span>
            Showing <span className="text-blue-400 font-bold">{filesChanged} changed files</span>
          </span>
        </div>
      </div>
    </>
  );
});
