import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  GitFork,
  Trash2,
  Copy,
  Check,
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Clock,
  GitBranch,
  GitCommit,
  Globe,
  Lock,
  Search,
  History,
  GitPullRequest,
  CircleDot,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  getRepositoryThunk,
  deleteRepositoryThunk,
  getFilesThunk,
  getCommitsThunk,
  getFileContentThunk,
  getBranchesThunk,
  deleteBranchThunk,
} from '../../features/repository/repositoryThunks';
import {
  selectSelectedRepository,
  selectRepositoryLoading,
  selectFiles,
  selectCommits,
  selectCommitsLoading,
  selectFileContent,
  selectFilesLoading,
  selectBranches,
} from '../../features/repository/repositorySelectors';
import { selectAuthUser } from '../../features/auth/authSelectors';
import { ROUTES } from '../../constants/routes';

import { RepositoryLanguages } from './components/RepositoryLanguages';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import DeleteConfirmModal from '../../types/common/Modal/DeleteConfirmationModal';
import CommitModal from '../../types/common/Modal/CreateCommitModal';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';

import IssueListContent from '../../types/common/Issues/IssuelistContent';
import PRListContent from '../../types/common/pullrequest/PRListContent';
type Tab = 'code' | 'commits' | 'branches' | 'pulls' | 'issues';
import { TreeNode, calculateLanguagesFromFiles } from './utils/repoUtils';

const RepositoryDetailPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame, branchName } = useParams<{
    username: string;
    reponame: string;
    branchName?: string;
  }>();
  const repo = useAppSelector(selectSelectedRepository);
  const isLoading = useAppSelector(selectRepositoryLoading);
  const branches = useAppSelector(selectBranches);
  const user = useAppSelector(selectAuthUser);
  const files = useAppSelector(selectFiles);
  const fileContent = useAppSelector(selectFileContent);
  const commits = useAppSelector(selectCommits);
  const isFilesLoading = useAppSelector(selectFilesLoading);
  const isCommitsLoading = useAppSelector(selectCommitsLoading);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('code');
  const [branch, setBranch] = useState('main');
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectFile] = useState('');
  const [starred, setStarred] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [treeSearch, setTreeSearch] = useState('');
  const [readmeContent, setReadmeContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showBranchDeleteModal, setShowBranchDeleteModal] = useState(false);
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [successSonar, setSuccessSonar] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
  });
  const [searchParams] = useSearchParams();

  const cloneUrl = `http://localhost:3125/vv/git/${username}/${reponame}.git`;
  const isOwner = user?.userId === username;
  const latestCommit = commits[0];
  const isEmpty = !isFilesLoading && files.length === 0;
  const allFiles = useAppSelector((state) => state.repository.allFiles);

  useEffect(() => {
    if (username && reponame) {
      //for normal folder view
      dispatch(getFilesThunk({ username, reponame, branch, path: '' }));

      dispatch(getFilesThunk({ username, reponame, branch, path: '', recursive: true }));
      dispatch(getCommitsThunk({ username, reponame, branch }));

      dispatch(getRepositoryThunk({ username, reponame }));
      dispatch(getBranchesThunk({ username, reponame }));
    }
  }, [username, reponame, branch, dispatch]);

  useEffect(() => {
    if (branchName) {
      setBranch(branchName);
    } else if (repo?.defaultBranch) {
      setBranch(repo.defaultBranch);
    }
  }, [branchName, repo?.defaultBranch]);
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'commits' || tab === 'pulls' || tab === 'issues' || tab === 'branches') {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPath('');
    setSelectFile('');
    setExpandedPaths(new Set());
    setTreeSearch('');
  }, [branch]);

  useEffect(() => {
    const readme = files.find((f) => f.name.toLowerCase() === 'readme.md');
    if (readme) {
      dispatch(
        getFileContentThunk({
          username: username!,
          reponame: reponame!,
          filePath: readme.path,
          branch,
        }),
      ).then((r: { payload?: unknown }) => {
        if (typeof r.payload === 'string') setReadmeContent(r.payload);
      });
    } else {
      setReadmeContent('');
    }
  }, [files]);

  const handleTreeNodeClick = useCallback(
    (node: TreeNode) => {
      if (node.type === 'tree') {
        const newExpanded = new Set(expandedPaths);
        if (newExpanded.has(node.path)) {
          newExpanded.delete(node.path);
        } else {
          newExpanded.add(node.path);
          setCurrentPath(node.path);
          setSelectFile('');
          dispatch(
            getFilesThunk({ username: username!, reponame: reponame!, branch, path: node.path }),
          );
        }
        setExpandedPaths(newExpanded);
      } else {
        setSelectFile(node.path);
        dispatch(
          getFileContentThunk({
            username: username!,
            reponame: reponame!,
            filePath: node.path,
            branch,
          }),
        );
      }
    },
    [dispatch, username, reponame, branch, expandedPaths],
  );

  const handleBack = useCallback(() => {
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/');
    setCurrentPath(newPath);
    setSelectFile('');
    dispatch(getFilesThunk({ username: username!, reponame: reponame!, branch, path: newPath }));
  }, [dispatch, username, reponame, branch, currentPath]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cloneUrl]);

  const handleDelete = useCallback(async () => {
    await dispatch(deleteRepositoryThunk({ username: username!, reponame: reponame! }));
    setShowDeleteModal(false);
    navigate(ROUTES.REPO_LIST);
  }, [dispatch, username, reponame, navigate]);

  const onConfirmDeleteBranch = async () => {
    setIsDeletingBranch(true);
    try {
      const result = await dispatch(
        deleteBranchThunk({
          username: username!,
          reponame: reponame!,
          branchName: branch,
        }),
      );

      if (deleteBranchThunk.fulfilled.match(result)) {
        setShowBranchDeleteModal(false);
        setBranch('main');
        dispatch(getBranchesThunk({ username: username!, reponame: reponame! }));
        setSuccessSonar({
          isOpen: true,
          title: 'Branch Deleted',
          subtitle: `Branch "${branch}" has been removed.`,
        });
      }
    } finally {
      setIsDeletingBranch(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  };

  const TreeItem = React.memo(
    ({
      file,
      selectedFile,
      currentPath,
      expandedPaths,
      onClick,
    }: {
      file: any;
      selectedFile: string;
      currentPath: string;
      expandedPaths: Set<string>;
      onClick: (node: any) => void;
    }) => (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer transition text-xs ${
          selectedFile === file.path
            ? 'bg-blue-600/20 text-blue-400 border-l-2 border-l-blue-500'
            : currentPath === file.path && !selectedFile
              ? 'bg-gray-800/50 text-white'
              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        }`}
        onClick={() => onClick(file)}
      >
        {file.type === 'tree' ? (
          expandedPaths.has(file.path) ? (
            <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500 shrink-0" />
          )
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {file.type === 'tree' ? (
          expandedPaths.has(file.path) ? (
            <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )
        ) : (
          <File className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        )}
        <span className="truncate">{file.name}</span>
      </div>
    ),
  );

  const FileListItem = React.memo(
    ({
      file,
      latestCommitMessage,
      latestCommitDate,
      onClick,
    }: {
      file: any;
      latestCommitMessage: string;
      latestCommitDate: string;
      onClick: (node: any) => void;
    }) => (
      <tr
        className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 cursor-pointer transition"
        onClick={() => onClick(file)}
      >
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            {file.type === 'tree' ? (
              <Folder className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <File className="w-4 h-4 text-gray-400 shrink-0" />
            )}
            <span className="text-blue-400 hover:text-blue-300 text-sm">{file.name}</span>
          </div>
        </td>
        <td className="px-4 py-2.5">
          <span className="text-gray-400 text-xs truncate max-w-md block">
            {latestCommitMessage}
          </span>
        </td>
        <td className="px-4 py-2.5 text-right">
          <span className="text-gray-500 text-xs">{latestCommitDate}</span>
        </td>
      </tr>
    ),
  );

  const CommitItem = React.memo(({ commit }: { commit: any }) => (
    <div className="flex items-start gap-4 px-4 py-4 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {commit.author?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{commit.message}</p>
        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {commit.author} · {formatDate(commit.date)}
        </p>
      </div>
      <span className="text-blue-400 text-xs font-mono bg-blue-500/10 px-2 py-1 rounded shrink-0 flex items-center gap-1">
        <GitCommit className="w-3 h-3" />
        {commit.hash}
      </span>
    </div>
  ));

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (a.type === 'tree' && b.type !== 'tree') return -1;
      if (a.type !== 'tree' && b.type === 'tree') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [files]);

  const languageData = useMemo(() => calculateLanguagesFromFiles(allFiles), [allFiles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!repo) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      {/* Repo breadcrumb bar */}
      <div className="border-b border-gray-800 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <Link to={ROUTES.REPO_LIST} className="text-blue-400 hover:underline font-medium">
            {username}
          </Link>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-white font-semibold">{reponame}</span>
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${
              repo.visibility === 'public'
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-gray-600 text-gray-400 bg-gray-700'
            }`}
          >
            {repo.visibility}
          </span>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition border-b-2 ${
              activeTab === 'code'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Folder className="w-4 h-4" /> Code
          </button>
          <button
            onClick={() => setActiveTab('commits')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition border-b-2 ${
              activeTab === 'commits'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            Commits {commits.length > 0 && `(${commits.length})`}
          </button>
          {/* Branches Tab */}
          <button
            onClick={() => setActiveTab('branches')}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition border-b-2 ${
              activeTab === 'branches'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Branches {branches.length > 0 && `(${branches.length})`}
          </button>

          <button
            onClick={() => setActiveTab('pulls')}
            className="flex items-center gap-2 px-4 py-3 text-sm transition border-b-2 text-gray-500 border-transparent hover:text-gray-300"
          >
            <GitPullRequest className="w-4 h-4" />
            Pull Requests
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className="flex items-center gap-2 px-4 py-3 text-sm transition border-b-2 text-gray-500 border-transparent hover:text-gray-300"
          >
            <CircleDot className="w-4 h-4" />
            Issues
          </button>
        </div>
      </div>
      {/* CODE TAB */}
      {activeTab === 'code' && (
        <div className="flex flex-1">
          {/* Left Sidebar — File Tree */}
          <div className="w-64 border-r border-gray-800 flex flex-col shrink-0">
            <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-400" />
                <span className="text-white text-xs font-semibold">Files</span>
              </div>
            </div>

            {/* Branch selector */}
            <div className="px-3 py-2 border-b border-gray-800">
              <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                <GitBranch className="w-3 h-3 text-gray-400 shrink-0" />
                <select
                  value={branch}
                  onChange={(e) => {
                    const newBranch = e.target.value;
                    navigate(`/${username}/${reponame}/tree/${newBranch}`);
                    setCurrentPath('');
                    setSelectFile('');
                    setExpandedPaths(new Set());
                  }}
                  className="flex-1 bg-transparent text-gray-300 text-xs focus:outline-none"
                >
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))
                  ) : (
                    <option value="main">main</option>
                  )}
                </select>
                {branch !== 'main' && isOwner && (
                  <button
                    onClick={() => setShowBranchDeleteModal(true)}
                    className="p-1 text-gray-500 hover:text-red-400 transition"
                    title="Delete branch"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            {/* Search */}
            <div className="px-3 py-2 border-b border-gray-800">
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                <Search className="w-3 h-3 text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Go to file"
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  className="flex-1 bg-transparent text-gray-300 text-xs focus:outline-none placeholder-gray-600"
                />
                <span className="text-gray-600 text-xs border border-gray-700 rounded px-1">t</span>
              </div>
            </div>

            {/* File tree */}
            <div className="flex-1 overflow-y-auto py-1">
              {isFilesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : isEmpty ? (
                <p className="text-gray-600 text-xs px-3 py-4 text-center">No files yet</p>
              ) : (
                sortedFiles
                  .filter(
                    (f) => !treeSearch || f.name.toLowerCase().includes(treeSearch.toLowerCase()),
                  )
                  .map((file) => (
                    <TreeItem
                      key={file.path}
                      file={file}
                      selectedFile={selectedFile}
                      currentPath={currentPath}
                      expandedPaths={expandedPaths}
                      onClick={handleTreeNodeClick}
                    />
                  ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Breadcrumb + Star/Fork */}
            <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between bg-gray-950 shrink-0">
              <div className="flex items-center gap-1 text-sm">
                <span
                  className="text-blue-400 hover:underline cursor-pointer text-xs font-medium"
                  onClick={() => {
                    setCurrentPath('');
                    setSelectFile('');
                    dispatch(
                      getFilesThunk({ username: username!, reponame: reponame!, branch, path: '' }),
                    );
                  }}
                >
                  {reponame}
                </span>
                {currentPath &&
                  currentPath.split('/').map((part, i, arr) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-gray-600">/</span>
                      <span
                        className="text-blue-400 hover:underline cursor-pointer text-xs font-medium"
                        onClick={() => {
                          const newPath = arr.slice(0, i + 1).join('/');
                          setCurrentPath(newPath);
                          setSelectFile('');
                          dispatch(
                            getFilesThunk({
                              username: username!,
                              reponame: reponame!,
                              branch,
                              path: newPath,
                            }),
                          );
                        }}
                      >
                        {part}
                      </span>
                    </span>
                  ))}
                {selectedFile && (
                  <>
                    <span className="text-gray-600">/</span>
                    <span className="text-white text-xs font-semibold">
                      {selectedFile.split('/').pop()}
                    </span>
                  </>
                )}
                <button
                  onClick={handleCopy}
                  className="ml-2 text-gray-500 hover:text-gray-300 transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Star + Fork */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <button
                    onClick={() => setStarred(!starred)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-l-lg border transition ${
                      starred
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${starred ? 'fill-yellow-400' : ''}`} />
                    Star
                  </button>
                  <span className="px-2 py-1 text-xs bg-gray-800 border border-l-0 border-gray-700 text-gray-300 rounded-r-lg">
                    {repo.stars + (starred ? 1 : 0)}
                  </span>
                </div>
                <div className="flex items-center">
                  <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-l-lg border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 transition">
                    <GitFork className="w-3 h-3" /> Fork
                  </button>
                  <span className="px-2 py-1 text-xs bg-gray-800 border border-l-0 border-gray-700 text-gray-300 rounded-r-lg">
                    {repo.forks}
                  </span>
                </div>
              </div>
            </div>

            {/* EMPTY STATE */}
            {isEmpty && (
              <div className="flex-1 p-6">
                <p className="text-gray-500 text-sm mb-4">
                  This repository is empty. Push your first commit:
                </p>
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-xs space-y-1 max-w-xl">
                  {[
                    `echo "# ${reponame}" >> README.md`,
                    'git init',
                    'git add README.md',
                    'git commit -m "first commit"',
                    `git branch -M ${repo.defaultBranch}`,
                    `git remote add origin ${cloneUrl}`,
                    `git push -u origin ${repo.defaultBranch}`,
                  ].map((line, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-gray-600 select-none w-4 text-right">{i + 1}</span>
                      <span
                        className={
                          line.includes('remote') || line.includes('push')
                            ? 'text-blue-400'
                            : 'text-gray-300'
                        }
                      >
                        {line}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NON-EMPTY STATE */}
            {!isEmpty && (
              <>
                {/* Latest commit bar */}
                {latestCommit && !selectedFile && (
                  <div className="px-4 py-2.5 border-b border-gray-800 flex items-center gap-3 bg-gray-900/30 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden shadow-sm border border-gray-800">
                      {isOwner && user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={latestCommit.author}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        latestCommit.author?.[0]?.toUpperCase()
                      )}
                    </div>
                    <span className="text-gray-300 text-xs font-medium">{latestCommit.author}</span>
                    <span className="text-gray-400 text-xs truncate flex-1">
                      {latestCommit.message}
                    </span>
                    <span className="text-blue-400 text-xs font-mono bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
                      {latestCommit.hash}
                    </span>
                    <span className="text-gray-500 text-xs shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(latestCommit.date)}
                    </span>
                    <button className="text-gray-500 hover:text-white text-xs flex items-center gap-1 transition">
                      <History className="w-3.5 h-3.5" /> History
                    </button>
                  </div>
                )}

                {/* File content viewer */}
                {selectedFile && (
                  <div className="flex-1 overflow-auto flex flex-col">
                    <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden shadow-sm border border-gray-800">
                          {isOwner && user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={latestCommit?.author}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            latestCommit?.author?.[0]?.toUpperCase()
                          )}
                        </div>
                        <span className="text-gray-300 text-xs font-medium">
                          {latestCommit?.author}
                        </span>
                        <span className="text-gray-400 text-xs truncate max-w-md">
                          {latestCommit?.message}
                        </span>
                        <span className="text-blue-400 text-xs font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {latestCommit?.hash}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {latestCommit ? timeAgo(latestCommit.date) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <button
                            disabled={!isOwner}
                            onClick={() => {
                              setIsEditing(true);
                              setEditedContent(fileContent);
                            }}
                            className={`text-xs flex items-center gap-1 transition ${
                              !isOwner
                                ? 'text-gray-600 cursor-not-allowed opacity-50'
                                : 'text-blue-400 hover:text-blue-300'
                            }`}
                          >
                            Edit
                          </button>
                        )}
                        <button className="text-gray-500 hover:text-white text-xs flex items-center gap-1 transition">
                          <History className="w-3.5 h-3.5" /> History
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                      <div className="flex items-center gap-3">
                        <button
                          className={`text-xs px-3 py-1 border border-gray-700 rounded font-medium transition ${!isEditing ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                          onClick={() => setIsEditing(false)}
                        >
                          Code
                        </button>
                        {isEditing && (
                          <button
                            disabled={!isOwner}
                            onClick={() => setShowCommitModal(true)}
                            className={`text-xs px-3 py-1 rounded transition ${
                              !isOwner
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            Commit Changes
                          </button>
                        )}
                        <button className="text-xs px-3 py-1 text-gray-400 hover:text-white transition">
                          Blame
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 text-xs">
                        <span>
                          {isEditing
                            ? editedContent.split('\n').length
                            : fileContent.split('\n').length}{' '}
                          lines
                        </span>
                        <span>
                          {new Blob([isEditing ? editedContent : fileContent]).size} Bytes
                        </span>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            handleBack();
                          }}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          ← Back
                        </button>
                      </div>
                    </div>
                    <div className="overflow-auto flex-1 flex flex-col bg-gray-950">
                      {isEditing ? (
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full h-full flex-1 bg-transparent text-gray-300 font-mono text-xs p-4 focus:outline-none resize-none min-h-[400px]"
                          placeholder="Edit file content..."
                        />
                      ) : (
                        <table className="w-full font-mono text-xs">
                          <tbody>
                            {fileContent.split('\n').map((line, i) => (
                              <tr key={i} className="hover:bg-gray-800/30">
                                <td className="px-4 py-0.5 text-gray-600 text-right select-none w-12 border-r border-gray-800">
                                  {i + 1}
                                </td>
                                <td className="px-4 py-0.5 text-gray-300 whitespace-pre">
                                  {line || ' '}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* File list */}
                {!selectedFile && (
                  <div className="flex-1 overflow-auto">
                    {isFilesLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <>
                        {currentPath && (
                          <div
                            className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition"
                            onClick={handleBack}
                          >
                            <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-gray-400 text-sm">..</span>
                          </div>
                        )}
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-800 text-gray-500 text-xs">
                              <th className="text-left px-4 py-2 font-medium">Name</th>
                              <th className="text-left px-4 py-2 font-medium">
                                Last commit message
                              </th>
                              <th className="text-right px-4 py-2 font-medium">Last commit date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedFiles.map((file) => (
                              <FileListItem
                                key={file.path}
                                file={file}
                                latestCommitMessage={latestCommit?.message || '—'}
                                latestCommitDate={latestCommit ? timeAgo(latestCommit.date) : '—'}
                                onClick={handleTreeNodeClick}
                              />
                            ))}
                          </tbody>
                        </table>

                        {/* README */}
                        {readmeContent && (
                          <div className="m-4">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                              <div className="px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
                                <File className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-white text-xs font-semibold">README.md</span>
                              </div>
                              <div className="p-6">
                                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                  {readmeContent}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar — only when repo has files */}
          {!isEmpty && (
            <div className="w-64 shrink-0 border-l border-gray-800 p-4 space-y-4 overflow-y-auto min-h-full">
              <div>
                <h3 className="text-white text-sm font-semibold mb-3">About</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">
                  {repo.description || 'No description provided.'}
                </p>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    {repo.visibility === 'public' ? (
                      <Globe className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-gray-500" />
                    )}
                    <span className="capitalize">{repo.visibility} repository</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-gray-500" />
                    <span>{repo.defaultBranch} (default)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span>Created {repo.createdAt ? formatDate(repo.createdAt) : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-white text-sm font-semibold mb-3">Stats</h3>
                <div className="space-y-2">
                  {[
                    { icon: Star, label: 'Stars', value: repo.stars + (starred ? 1 : 0) },
                    { icon: GitFork, label: 'Forks', value: repo.forks },
                    { icon: GitCommit, label: 'Commits', value: commits.length },
                    { icon: GitBranch, label: 'Branches', value: branches.length },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </div>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {languageData.length > 0 ? (
                <RepositoryLanguages languages={languageData} />
              ) : (
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="text-white text-sm font-semibold mb-3">Languages</h3>
                  <p className="text-gray-500 text-xs">No language data available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMMITS TAB */}
      {activeTab === 'commits' && (
        <div className="max-w-4xl mx-auto px-6 py-6 w-full flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {isCommitsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : commits.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500 text-sm">No commits yet</div>
            ) : (
              commits.map((commit) => <CommitItem key={commit.hash} commit={commit} />)
            )}
          </div>
        </div>
      )}
      {activeTab === 'branches' && (
        <div className="max-w-4xl mx-auto px-6 py-6 w-full text-center flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-10">
            <GitBranch className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Branches</h3>
            <p className="text-gray-500 mb-6">Manage your repository branches here.</p>
            <Link
              to={`/${username}/${reponame}/branches`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition inline-block"
            >
              View all branches
            </Link>
          </div>
        </div>
      )}
      {activeTab === 'pulls' && (
        <PRListContent username={username!} reponame={reponame!} isOwner={isOwner} />
      )}

      {activeTab === 'issues' && (
        <IssueListContent username={username!} reponame={reponame!} isOwner={isOwner} />
      )}

      <AppFooter />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        itemPath={`${username}/${reponame}`}
        itemName="repository"
        isLoading={isLoading}
      />

      <DeleteConfirmModal
        isOpen={showBranchDeleteModal}
        onClose={() => setShowBranchDeleteModal(false)}
        onConfirm={onConfirmDeleteBranch}
        itemPath={branch}
        itemName="branch"
        isLoading={isDeletingBranch}
      />

      {showCommitModal && (
        <CommitModal
          username={username!}
          reponame={reponame!}
          branch={branch}
          filePath={selectedFile}
          content={editedContent}
          onSuccess={() => {
            setIsEditing(false);
            setShowCommitModal(false);
            setSuccessSonar({
              isOpen: true,
              title: 'Changes Committed!',
              subtitle: 'Your repository is now up to date.',
            });
          }}
          onCancel={() => setShowCommitModal(false)}
        />
      )}

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
};

export default RepositoryDetailPage;
