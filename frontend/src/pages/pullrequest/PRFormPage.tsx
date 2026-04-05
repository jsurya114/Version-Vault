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

  const [title, setTitle] = useState(initialState);
  const [description, setDescription] = useState('');
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />
      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to comparison</span>
        </button>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <GitPullRequest className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Open a pull request</h1>
            <p className="text-gray-400 text-sm mt-1">
              Finalize your request by adding a title and description.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-center gap-4 text-sm font-medium">
            <span className="bg-gray-800 px-3 py-1 rounded-md text-gray-300">{baseBranch}</span>
            <span className="text-gray-600">←</span>
            <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-md border border-blue-500/20">
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
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700 font-medium font-sans"
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
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-700 resize-none font-medium font-sans"
                placeholder="What changes does this PR introduce?"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20"
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
