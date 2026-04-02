import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CircleDot } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createIssueThunk } from '../../features/issues/issueThunk';
import { selectIssueLoading, selectIssueError } from '../../features/issues/issueSelector';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { IssuePriority } from '../../types/issues/issues.types';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import { CommonLoader } from '../../types/common/Layout/Loader';

const CreateIssuePage = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const isLoading = useAppSelector(selectIssueLoading);
  const error = useAppSelector(selectIssueError);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });

  const handleAddLabel = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && labelInput.trim()) {
        setLabels((prev) => [...prev, labelInput.trim()]);
        setLabelInput('');
      }
    },
    [labelInput],
  );

  const handleRemoveLabel = useCallback((label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title) return;
    const result = await dispatch(
      createIssueThunk({
        username: username!,
        reponame: reponame!,
        dto: { title, description, priority, labels },
      }),
    );
    if (createIssueThunk.fulfilled.match(result)) {
      setIsCreatingLoader(true);
      setTimeout(() => {
        setIsCreatingLoader(false);
        setSuccessSonar({
          isOpen: true,
          title: 'Issue Created!',
          subtitle: `Successfully created issue: ${title}`,
        });
        setTimeout(() => {
          navigate(`/${username}/${reponame}/issues`);
        }, 2500);
      }, 2000);
    }
  }, [dispatch, username, reponame, title, description, priority, labels, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      <div className="border-b border-gray-800 px-6 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-1 text-sm">
          <Link to={ROUTES.REPO_LIST} className="text-blue-400 hover:underline">
            {username}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}`} className="text-blue-400 hover:underline">
            {reponame}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}/issues`} className="text-blue-400 hover:underline">
            Issues
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">New</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-6 w-full flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center">
            <CircleDot className="w-5 h-5 text-green-400" />
          </div>
          <h1 className="text-white text-xl font-bold">New Issue</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-gray-400 text-xs mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2">Priority</label>
            <div className="flex items-center gap-2">
              {(['low', 'medium', 'high'] as IssuePriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-1.5 text-xs rounded-lg border capitalize transition ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : p === 'medium'
                          ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                          : 'bg-gray-700 border-gray-500 text-gray-300'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2">Labels (press Enter to add)</label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Add a label..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  >
                    {label}
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="hover:text-red-400 transition"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/${username}/${reponame}/issues`)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              {isLoading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </div>
      </main>

      <AppFooter />

      {isCreatingLoader && <CommonLoader message="Creating Issue..." />}

      {successSonar.isOpen && (
        <SuccessSonar
          isOpen={successSonar.isOpen}
          onClose={() => setSuccessSonar((prev) => ({ ...prev, isOpen: false }))}
          title={successSonar.title}
          subtitle={successSonar.subtitle}
        />
      )}
    </div>
  );
});

export default CreateIssuePage;
