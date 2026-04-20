import { useState, useCallback } from 'react';
import {
  AlertTriangle,
  GitMerge,
  ChevronDown,
  ChevronRight,
  Check,
  FileCode,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { ConflictFile, ResolvedFile } from '../../../types/pullrequest/pullrequest.types';

interface ConflictEditorProps {
  conflictFiles: ConflictFile[];
  sourceBranch: string;
  targetBranch: string;
  onResolve: (resolvedFiles: ResolvedFile[]) => void;
  onCancel: () => void;
  isResolving: boolean;
}

interface FileResolution {
  filePath: string;
  resolved: boolean;
  content: string;
  mode: 'ours' | 'theirs' | 'manual';
}

const ConflictEditor = ({
  conflictFiles,
  sourceBranch,
  targetBranch,
  onResolve,
  onCancel,
  isResolving,
}: ConflictEditorProps) => {
  const [resolutions, setResolutions] = useState<FileResolution[]>(
    conflictFiles.map((f) => ({
      filePath: f.path,
      resolved: false,
      content: f.conflictContent,
      mode: 'manual',
    })),
  );
  const [expandedFile, setExpandedFile] = useState<string | null>(conflictFiles[0]?.path || null);

  const allResolved = resolutions.every((r) => r.resolved);

  const handleChooseOurs = useCallback(
    (filePath: string) => {
      const file = conflictFiles.find((f) => f.path === filePath);
      if (!file) return;
      setResolutions((prev) =>
        prev.map((r) =>
          r.filePath === filePath
            ? { ...r, content: file.oursContent, resolved: true, mode: 'ours' }
            : r,
        ),
      );
    },
    [conflictFiles],
  );

  const handleChooseTheirs = useCallback(
    (filePath: string) => {
      const file = conflictFiles.find((f) => f.path === filePath);
      if (!file) return;
      setResolutions((prev) =>
        prev.map((r) =>
          r.filePath === filePath
            ? { ...r, content: file.theirsContent, resolved: true, mode: 'theirs' }
            : r,
        ),
      );
    },
    [conflictFiles],
  );

  const handleManualEdit = useCallback((filePath: string, content: string) => {
    setResolutions((prev) =>
      prev.map((r) =>
        r.filePath === filePath
          ? {
              ...r,
              content,
              mode: 'manual',
              // Mark as resolved if no more conflict markers
              resolved:
                !content.includes('<<<<<<<') &&
                !content.includes('=======') &&
                !content.includes('>>>>>>>'),
            }
          : r,
      ),
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const resolvedFiles: ResolvedFile[] = resolutions.map((r) => ({
      filePath: r.filePath,
      content: r.content,
    }));
    onResolve(resolvedFiles);
  }, [resolutions, onResolve]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 to-red-900/20 border-b border-gray-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">
              Resolve {conflictFiles.length} conflict
              {conflictFiles.length > 1 ? 's' : ''}
            </h2>
            <p className="text-gray-400 text-xs">
              Conflicting files must be resolved before merging
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allResolved || isResolving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
          >
            {isResolving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <GitMerge className="w-4 h-4" />
                Mark as resolved & merge
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-950 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">
            {resolutions.filter((r) => r.resolved).length} of {resolutions.length} resolved
          </span>
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{
                width: `${(resolutions.filter((r) => r.resolved).length / resolutions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* File list */}
      <div className="divide-y divide-gray-800">
        {conflictFiles.map((file) => {
          const resolution = resolutions.find((r) => r.filePath === file.path);
          const isExpanded = expandedFile === file.path;

          return (
            <div key={file.path}>
              {/* File header */}
              <button
                onClick={() => setExpandedFile(isExpanded ? null : file.path)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <FileCode className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-300 flex-1 text-left truncate">
                  {file.path}
                </span>
                {resolution?.resolved ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Resolved
                    {resolution.mode === 'ours' && ` (${targetBranch})`}
                    {resolution.mode === 'theirs' && ` (${sourceBranch})`}
                    {resolution.mode === 'manual' && ' (manual)'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Unresolved
                  </span>
                )}
              </button>

              {/* File content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  {/* Quick action buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => handleChooseOurs(file.path)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        resolution?.mode === 'ours'
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-green-500/30'
                      }`}
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Accept {targetBranch} (base)
                    </button>
                    <button
                      onClick={() => handleChooseTheirs(file.path)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        resolution?.mode === 'theirs'
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-blue-500/30'
                      }`}
                    >
                      <ArrowRight className="w-3 h-3" />
                      Accept {sourceBranch} (incoming)
                    </button>
                  </div>

                  {/* Editor */}
                  <div className="relative">
                    <textarea
                      value={resolution?.content || file.conflictContent}
                      onChange={(e) => handleManualEdit(file.path, e.target.value)}
                      className="w-full min-h-[300px] bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 resize-y leading-relaxed"
                      spellCheck={false}
                    />
                    {/* Conflict marker legend */}
                    {resolution?.content?.includes('<<<<<<<') && (
                      <div className="absolute top-2 right-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-[10px] text-gray-500 space-y-1">
                        <div>
                          <span className="text-red-400 font-mono">
                            &lt;&lt;&lt;&lt;&lt;&lt;&lt;
                          </span>{' '}
                          = start of {targetBranch}
                        </div>
                        <div>
                          <span className="text-yellow-400 font-mono">=======</span> = separator
                        </div>
                        <div>
                          <span className="text-green-400 font-mono">
                            &gt;&gt;&gt;&gt;&gt;&gt;&gt;
                          </span>{' '}
                          = end of {sourceBranch}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConflictEditor;
