import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createRepositoryThunk, fileUploadThunk } from '../../features/repository/repositoryThunks';
import {
  selectRepositoryLoading,
  selectRepositoryError,
  selectIsUploading,
} from '../../features/repository/repositorySelectors';
import { selectAuthUser } from '../../features/auth/authSelectors';
import { ROUTES } from '../../constants/routes';
import AppFooter from '../../types/common/Layout/AppFooter';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import { CommonLoader } from '../../types/common/Layout/Loader';
import AppHeader from '../../types/common/Layout/AppHeader';
import { DragAndDrop } from './components/DragAndDrop';
import { AiAgentRepoCreator } from './components/AiAgentRepoCreator';
import { RepositoryResponseDTO } from '../../types/repository/repositoryTypes';

const CreateRepositoryPage = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectRepositoryLoading);
  const error = useAppSelector(selectRepositoryError);
  const user = useAppSelector(selectAuthUser);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isUploading = useAppSelector(selectIsUploading);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);

  const validateName = (val: string) => {
    const repoNameRegex = /^[a-z0-9-_]+$/i;
    if (val && !repoNameRegex.test(val)) {
      setNameError('Invalid name. Use only letters, numbers, hyphens, and underscores.');
    } else {
      setNameError('');
    }
  };

  const cloneUrl = useMemo(
    () => `http://localhost:3125/vv/git/${user?.userId}/${name || 'new-repo'}.git`,
    [user?.userId, name],
  );

  const cliCommands = useMemo(
    () => `git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin ${cloneUrl}
git push -u origin main`,
    [cloneUrl],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cliCommands);
  }, [cliCommands]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || nameError) return;

    // A. Create the base repository first
    const result = await dispatch(createRepositoryThunk({ name, description, visibility }));

    if (createRepositoryThunk.fulfilled.match(result)) {
      setIsCreatingLoader(true);

      // B. If files were dropped, upload them to the new repo
      if (selectedFiles.length > 0) {
        await dispatch(
          fileUploadThunk({
            repoName: name,
            files: selectedFiles,
          }),
        );
      }
      setTimeout(() => {
        setIsCreatingLoader(false);
        navigate(ROUTES.REPO_LIST, {
          state: {
            showSonar: true,
            sonarTitle: 'Repository Created!',
            sonarSubtitle: selectedFiles.length > 0
              ? `Repository "${name}" created with ${selectedFiles.length} files.`
              : `Your new repository "${name}" is ready.`,
          }
        });
      }, 1500);
    }
  }, [dispatch, name, description, visibility, navigate, selectedFiles]);

  const handleRepoCreatedByAI = useCallback(async (repoData: RepositoryResponseDTO) => {
    setIsCreatingLoader(true);
    if (selectedFiles.length > 0) {
      await dispatch(
        fileUploadThunk({
          repoName: repoData.name,
          files: selectedFiles,
        }),
      );
    }
    setTimeout(() => {
      setIsCreatingLoader(false);
      navigate(ROUTES.REPO_LIST, {
        state: {
          showSonar: true,
          sonarTitle: 'Repository Created via AI!',
          sonarSubtitle: selectedFiles.length > 0
            ? `Repository "${repoData.name}" created with ${selectedFiles.length} files.`
            : `Your new repository "${repoData.name}" is ready.`,
        }
      });
    }, 1500);
  }, [dispatch, selectedFiles, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-white text-xl xs:text-2xl font-bold">Create a New Repository</h1>
          <p className="text-gray-500 text-sm mt-1">
            A repository contains all project files, including the revision history.
          </p>
        </div>
        {/* Updated to a 12-column grid prioritizing the right column width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Setup & Drag/Drop */}
          <div className="space-y-6 lg:col-span-5">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 xs:p-4 sm:p-5">
              <h2 className="text-white font-semibold mb-4">1. Basic Setup</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Owner</label>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 xs:px-3 py-2 xs:py-2.5 text-gray-300 text-xs xs:text-sm flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="truncate">{user?.userId} /</span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">
                    Repository Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      validateName(e.target.value);
                    }}
                    placeholder="my-awesome-project"
                    className={`w-full bg-gray-800 border ${nameError ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 transition`}
                  />
                  {nameError && <p className="text-red-500 text-[10px] mt-1">{nameError}</p>}
                </div>
              </div>
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
              {name && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 xs:px-3 py-2 mb-4">
                  <p className="text-blue-400 text-xs">
                    Your repo will be at{' '}
                    <span className="font-mono break-all">
                      {user?.userId}/{name}
                    </span>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-gray-400 text-xs mb-2">Visibility</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2 xs:gap-3 p-2.5 xs:p-3 rounded-lg border cursor-pointer transition ${visibility === 'public' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
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
                      <p className="text-white text-xs xs:text-sm font-medium">🌐 Public</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Anyone on the internet can see this repository.
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-2 xs:gap-3 p-2.5 xs:p-3 rounded-lg border cursor-pointer transition ${visibility === 'private' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
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
                      <p className="text-white text-xs xs:text-sm font-medium">🔒 Private</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        You choose who can see and commit.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            {/* NEW SECTION 2: Drag & Drop component placed exactly where requested */}
            <DragAndDrop
              onFilesSelected={setSelectedFiles}
              selectedFilesCount={selectedFiles.length}
            />
          </div>
          {/* RIGHT COLUMN: CLI & Actions */}
          <div className="space-y-4 lg:col-span-7">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 xs:p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <h2 className="text-white font-semibold">✨ AI Assistant</h2>
              </div>
              <AiAgentRepoCreator onRepoCreated={handleRepoCreatedByAI} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 xs:p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 xs:mb-4 flex-wrap gap-2">
                <h2 className="text-white font-semibold">3. CLI Setup</h2>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                  EXISTING PROJECT
                </span>
              </div>
              <div className="bg-gray-950 rounded-lg p-3 xs:p-4 mb-3 font-mono text-[10px] xs:text-xs space-y-1 overflow-x-auto">
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3.5 xs:p-4 sm:p-5 space-y-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isLoading || isUploading || !name.trim() || !!nameError}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
              >
                {isLoading || isUploading ? 'Processing...' : 'Create Repository'}
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
      <AppFooter />
      {(isCreatingLoader || isUploading) && (
        <CommonLoader message={isUploading ? 'Uploading Files...' : 'Creating Repository...'} />
      )}

    </div>
  );
});
export default CreateRepositoryPage;
