import React from 'react';
import { FileDiff } from '../../../types/commit/commit.types';

interface FileDiffViewerProps {
  file: FileDiff;
  id?: string;
}

export const FileDiffViewer = React.memo(({ file, id }: FileDiffViewerProps) => {
  return (
    <div
      id={id}
      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8 shadow-xl"
    >
      <div className="bg-gray-950 px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono text-xs">{file.path}</span>
        </div>
        <div className="flex gap-2 text-[10px] font-bold">
          <span className="text-green-500">+{file.additions}</span>
          <span className="text-red-500">-{file.deletions}</span>
        </div>
      </div>
      <div className="font-mono text-[12px] leading-relaxed overflow-x-auto">
        {file.hunks.map((hunk, hIdx) => (
          <div key={hIdx}>
            <div className="bg-blue-500/5 text-blue-400/50 py-1 px-4 border-y border-blue-500/10 text-[11px]">
              {hunk.content}
            </div>
            {hunk.lines.map((line, lIdx) => (
              <div
                key={lIdx}
                className={`flex hover:bg-white/5 transition-colors ${
                  line.type === 'added'
                    ? 'bg-green-500/10 text-green-400'
                    : line.type === 'deleted'
                      ? 'bg-red-500/10 text-red-400'
                      : 'text-gray-400'
                }`}
              >
                <div className="w-12 text-right pr-4 py-0.5 select-none opacity-30 border-r border-gray-800 text-[10px]">
                  {line.oldLineNumber || ''}
                </div>
                <div className="w-12 text-right pr-4 py-0.5 select-none opacity-30 border-r border-gray-800 text-[10px]">
                  {line.newLineNumber || ''}
                </div>
                <div className="px-4 py-0.5 whitespace-pre min-w-0 flex-1">
                  <span className="mr-2 opacity-50 select-none">
                    {line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ' '}
                  </span>
                  {line.content}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
