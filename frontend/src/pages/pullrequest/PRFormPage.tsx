import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { GitPullRequest, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createPRThunk } from '../../features/pullrequest/prThunk';
import { selectPRLoading, selectPRError } from '../../features/pullrequest/prSelector';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import { CommonLoader } from '../../types/common/Layout/Loader';

const PRFormPage = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { username, reponame } = useParams();

  const isLoading = useAppSelector(selectPRLoading);
  const error = useAppSelector(selectPRError);

  const baseBranch = searchParams.get('base') || 'main';
  const headBranch = searchParams.get('head') || '';

  const initialState = searchParams.get('title') || '';
  const initialDescription = searchParams.get('description') || '';

  const [title, setTitle] = useState(initialState);
  const [description, setDescription] = useState(initialDescription);
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!title || !headBranch || !baseBranch) return;
    const result = await dispatch(
      createPRThunk({
        username: username!,
        reponame: reponame!,
        dto: { title, description, sourceBranch: headBranch, targetBranch: baseBranch },
      }),
    );
    if (createPRThunk.fulfilled.match(result)) {
      setIsCreatingLoader(true);
      setTimeout(() => {
        setIsCreatingLoader(false);
        setSuccessSonar({
          isOpen: true,
          title: 'Pull Request Opened!',
          subtitle: `Successfully created PR from ${headBranch} to ${baseBranch}.`,
        });
        setTimeout(() => navigate(`/${username}/${reponame}/pulls`), 2500);
      }, 2000);
    }
  }, [dispatch, username, reponame, title, description, headBranch, baseBranch, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 w-full flex-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-5 xs:mb-6 sm:mb-8 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to comparison</span>
        </button>

        <div className="flex items-center gap-3 xs:gap-4 mb-6 xs:mb-8 sm:mb-10">
          <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl xs:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <GitPullRequest className="w-5 h-5 xs:w-6 xs:h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-white">Open a pull request</h1>
            <p className="text-gray-400 text-sm mt-1">
              Finalize your request by adding a title and description.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl xs:rounded-3xl p-4 xs:p-5 sm:p-8 space-y-5 xs:space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden">
          <div className="bg-gray-950/50 border border-gray-800 rounded-xl xs:rounded-2xl p-3 xs:p-4 flex flex-col xs:flex-row items-center justify-center gap-2 xs:gap-4 text-sm font-medium">
            <span className="bg-gray-800 px-2.5 xs:px-3 py-1 rounded-md text-gray-300 text-xs xs:text-sm truncate max-w-full">{baseBranch}</span>
            <span className="text-gray-600">←</span>
            <span className="bg-blue-600/10 text-blue-400 px-2.5 xs:px-3 py-1 rounded-md border border-blue-500/20 text-xs xs:text-sm truncate max-w-full">
              {headBranch}
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-[11px] font-black uppercase tracking-widest pl-1 mb-2">
                PR Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 xs:px-4 sm:px-5 py-3 xs:py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700 font-medium font-sans text-sm"
                placeholder="Short, descriptive title..."
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[11px] font-black uppercase tracking-widest pl-1 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 xs:px-4 sm:px-5 py-3 xs:py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700 resize-none font-medium font-sans text-sm"
                placeholder="What changes does this PR introduce?"
              />
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 pt-2 xs:pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 xs:py-4 rounded-xl transition-all shadow-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 xs:py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 text-sm"
            >
              {isLoading ? 'Opening...' : 'Create Pull Request'}
            </button>
          </div>
        </div>
      </main>
      <AppFooter />
      {isCreatingLoader && <CommonLoader message="Creating your pull request..." />}
      <SuccessSonar
        isOpen={successSonar.isOpen}
        onClose={() => {}}
        title={successSonar.title}
        subtitle={successSonar.subtitle}
      />
    </div>
  );
});
export default PRFormPage;
