import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createRepositoryThunk } from '../../features/repository/repositoryThunks';
import {
  selectRepositoryLoading,
  selectRepositoryError,
} from '../../features/repository/repositorySelectors';
import { selectAuthUser } from '../../features/auth/authSelectors';
import { ROUTES } from '../../constants/routes';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';

const CreateRepositoryPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectRepositoryLoading);
  const error = useAppSelector(selectRepositoryError);
  const user = useAppSelector(selectAuthUser);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const cloneUrl = `http://localhost:3125/vv/git/${user?.userId}/${name || 'new-repo'}.git`;

  const cliCommands = `git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin ${cloneUrl}
git push -u origin main`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommands);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const result = await dispatch(createRepositoryThunk({ name, description, visibility }));
    if (createRepositoryThunk.fulfilled.match(result)) {
      navigate(ROUTES.REPO_LIST);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AppHeader />

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Create a New Repository</h1>
          <p className="text-gray-500 text-sm mt-1">
            A repository contains all project files, including the revision history.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left — Basic Setup */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4">1. Basic Setup</h2>

              {/* Owner + Repo Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Owner</label>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-300 text-sm flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    {user?.userId} /
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">
                    Repository Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-400 text-xs mb-1">
                  Description <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of your repository"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Name hint */}
              {name && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-4">
                  <p className="text-blue-400 text-xs">
                    Your repo will be at{' '}
                    <span className="font-mono">
                      {user?.userId}/{name}
                    </span>
                  </p>
                </div>
              )}

              {/* Visibility */}
              <div>
                <label className="block text-gray-400 text-xs mb-2">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      visibility === 'public'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                      className="accent-blue-500 mt-0.5"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">🌐 Public</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Anyone on the internet can see this repository.
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      visibility === 'private'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                      className="accent-blue-500 mt-0.5"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">🔒 Private</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        You choose who can see and commit.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right — CLI Setup */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">3. CLI Setup</h2>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                  EXISTING PROJECT
                </span>
              </div>

              {/* Code block */}
              <div className="bg-gray-950 rounded-lg p-4 mb-3 font-mono text-xs space-y-1">
                {cliCommands.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-gray-600 select-none w-4 text-right">{i + 1}</span>
                    <span
                      className={
                        line.startsWith('git commit') ||
                        line.startsWith('git remote') ||
                        line.includes('localhost')
                          ? 'text-blue-400'
                          : 'text-gray-300'
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-lg transition"
              >
                Copy to clipboard
              </button>
            </div>

            {/* Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !name.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                {isLoading ? 'Creating...' : 'Create Repository'}
              </button>
              <button
                onClick={() => navigate(ROUTES.REPO_LIST)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default CreateRepositoryPage;
