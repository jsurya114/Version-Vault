import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Code, FileCode } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { compareCommitThunk } from '../../features/commit/compareCommitThunk';
import {
  selectCompareData,
  selectCompareLoading,
} from 'src/features/commit/compareCommitSelectors';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { CommitDiffs } from './components/CommitDiffs';

const CommitDetailPage = () => {
  const { username, reponame, hash } = useParams();
  const dispatch = useAppDispatch();

  const data = useAppSelector(selectCompareData);
  const isLoading = useAppSelector(selectCompareLoading);

  useEffect(() => {
    // We clear any previous comparison data so it doesn't flash
    dispatch({ type: 'compareSlice/clearCommitComparison' });

    if (username && reponame && hash) {
      // Compare the commit with its parent to get the single commit's diff
      const base = `${hash}^`;
      dispatch(compareCommitThunk({ username, reponame, base, head: hash }));
    }
  }, [username, reponame, hash, dispatch]);

  const commit = data?.commits?.[0];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col font-sans selection:bg-blue-500/30">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-70">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest font-black text-gray-600">
              Loading commit details
            </p>
          </div>
        ) : commit ? (
          <div className="space-y-6">
            {/* The single commit card from the user's screenshot */}
            <div className="bg-gray-950 border border-gray-800 rounded-md divide-y divide-gray-800 shadow-sm">
              <div className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[16px] font-bold">{commit.message}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80">
                    <div className="flex items-center bg-gray-800 border border-gray-700/50 rounded px-2 py-0.5 gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
                      <FileCode className="w-3 h-3" />
                      <span className="text-[11px] font-mono font-bold tracking-tight">
                        {commit.hash.substring(0, 7)}
                      </span>
                    </div>
                    <div className="p-1 px-1.5 bg-gray-800 border border-gray-700/50 rounded text-gray-400 hover:text-white transition-colors cursor-pointer">
                      <Code className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-gray-800 flex items-center justify-center text-[8px] font-bold text-blue-300">
                    {commit.author[0]?.toUpperCase()}
                  </div>
                  <span className="text-gray-300 font-bold hover:underline cursor-pointer">
                    {commit.author}
                  </span>
                  committed recently
                  <CheckCircle2 className="w-4 h-4 text-green-500 inline ml-1" />
                </div>
              </div>
            </div>

            {data?.diffs && <CommitDiffs diffs={data.diffs} filesChanged={data.filesChanged} />}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Commit not found or no differences available.
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default CommitDetailPage;
