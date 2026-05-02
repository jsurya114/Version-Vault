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
  Users,
  FileCode,
  Download,
  Play,
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
  getRecentPushThunk,
  fileUploadThunk,
  deleteFileThunk,
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
import { API_BASE_URL } from '../../constants/api';
import { ROUTES } from '../../constants/routes';
import { repositoryService } from 'src/services/repository.service';

import { collaboratorService } from '../../services/collaborator.service';

import { RepositoryLanguages } from './components/RepositoryLanguages';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import DeleteConfirmModal from '../../types/common/Modal/DeleteConfirmationModal';
import CommitModal from '../../types/common/Modal/CreateCommitModal';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import CollaboratorsTabContent from 'src/types/common/collaborator/CollaboratorsTablContent';

import IssueListContent from '../../types/common/Issues/IssuelistContent';
import PRListContent from '../../types/common/pullrequest/PRListContent';
import { ForkButton } from './components/ForkButton';
import { StarButton } from './components/StarButton'; // IMPORT NEW COMPONENT
import { FileDiffViewer } from '../pullrequest/components/DiffViewer';
import { compareCommitThunk } from '../../features/commit/compareCommitThunk';
import {
  selectCompareData,
  selectCompareLoading,
} from '../../features/commit/compareCommitSelectors';
import { RecentPushesBanner } from './components/RecentPushesBanner';
import { workflowService, WorkflowRun } from '../../services/workflow.service';

type Tab = 'code' | 'commits' | 'branches' | 'pulls' | 'issues' | 'collaborators' | 'actions';
import { TreeNode, calculateLanguagesFromFiles } from './utils/repoUtils';

const RepositoryDetailPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { username, reponame } = params;
  const branchName = params['*'];
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'code');

  const [branch, setBranch] = useState(branchName || 'main');
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectFile] = useState('');
  // REMOVED: local starred state (now handled by StarButton and Redux)
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

  const [isDownloading, setIsDownloading] = useState(false);
  const [showFileDeleteModal, setShowFileDeleteModal] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  const activeBranches = useAppSelector((state) => state.repository.activeBranches || []);
  const cloneUrl = `${API_BASE_URL}/git/${username}/${reponame}.git`;
  const isOwner = user?.userId === username;
  const latestCommit = commits[0];
  const isEmpty = !isFilesLoading && files.length === 0;
  const allFiles = useAppSelector((state) => state.repository.allFiles);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const compareData = useAppSelector(selectCompareData);
  const isCompareLoading = useAppSelector(selectCompareLoading);
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null);

  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const [uploadCommitMessage, setUploadCommitMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showCloneDropdown, setShowCloneDropdown] = useState(false);
  const [commandsCopied, setCommandsCopied] = useState(false);

  // CI/CD Actions state
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [selectedRunDetail, setSelectedRunDetail] = useState<WorkflowRun | null>(null);
  const [runDetailLoading, setRunDetailLoading] = useState(false);

  const emptyRepoCommands = useMemo(
    () =>
      [
        `echo "# ${reponame}" >> README.md`,
        'git init',
        'git add README.md',
        'git commit -m "first commit"',
        `git branch -M ${repo?.defaultBranch || 'main'}`,
        `git remote add origin ${cloneUrl}`,
        `git push -u origin ${repo?.defaultBranch || 'main'}`,
      ].join('\n'),
    [reponame, repo?.defaultBranch, cloneUrl],
  );

  const handleCopyCommands = useCallback(() => {
    navigator.clipboard.writeText(emptyRepoCommands);
    setCommandsCopied(true);
    setTimeout(() => setCommandsCopied(false), 2000);
  }, [emptyRepoCommands]);

  useEffect(() => {
    if (username && reponame) {
      //for normal folder view
      dispatch(getFilesThunk({ username, reponame, branch, path: '' }));

      dispatch(getFilesThunk({ username, reponame, branch, path: '', recursive: true }));
      dispatch(getCommitsThunk({ username, reponame, branch }));

      dispatch(getRepositoryThunk({ username, reponame }));
      dispatch(getBranchesThunk({ username, reponame }));
      dispatch(getRecentPushThunk({ username, reponame }));
    }
  }, [username, reponame, branch, dispatch]);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      // 1. Fetch the binary data (Blob) from the backend
      const blob = await repositoryService.downloadZip(username!, reponame!, branch);

      // 2. Wrap it as a downloadable link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reponame}-${branch}.zip`); // Force download filename

      // 3. Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 4. Optionally close dropdown & show successful sonar
      setShowCloneDropdown(false);
      setSuccessSonar({
        isOpen: true,
        title: 'Download Started',
        subtitle: `Downloading ${reponame}-${branch}.zip`,
      });
    } catch (error) {
      console.error('Failed to download ZIP:', error);
      // You can add an error sonar/toast here if you have one
    } finally {
      setIsDownloading(false);
    }
  };
  useEffect(() => {
    if (username && reponame && user) {
      if (isOwner) {
        setHasWriteAccess(true);
      } else {
        collaboratorService
          .checkAccess(username, reponame)
          .then((data) => {
            setHasWriteAccess(data.hasAccess && data.role !== 'read');
          })
          .catch(() => setHasWriteAccess(false));
      }
    }
  }, [username, reponame, user, isOwner]);

  useEffect(() => {
    if (branchName) {
      setBranch(branchName);
    } else if (repo?.defaultBranch) {
      setBranch(repo.defaultBranch);
    }
  }, [branchName, repo?.defaultBranch]);
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (
      tab === 'commits' ||
      tab === 'pulls' ||
      tab === 'issues' ||
      tab === 'branches' ||
      tab === 'collaborators' ||
      tab === 'actions'
    ) {
      setActiveTab(tab as Tab);
    }
  }, [searchParams]);

  // Fetch workflow runs when actions tab is active
  useEffect(() => {
    if (activeTab !== 'actions' || !username || !reponame) return;
    setWorkflowLoading(true);
    workflowService
      .listRuns(username, reponame)
      .then((data) => setWorkflowRuns(data))
      .catch((err) => console.error('Failed to fetch workflow runs:', err))
      .finally(() => setWorkflowLoading(false));
  }, [activeTab, username, reponame]);

  // Only poll when there are active (QUEUED/RUNNING) runs
  useEffect(() => {
    if (activeTab !== 'actions' || !username || !reponame) return;
    const hasActiveRuns = workflowRuns.some((r) => r.status === 'QUEUED' || r.status === 'RUNNING');
    if (!hasActiveRuns) return;

    const interval = setInterval(() => {
      workflowService
        .listRuns(username!, reponame!)
        .then((data) => setWorkflowRuns(data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, username, reponame, workflowRuns]);

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

  const handleUploadSubmit = async () => {
    if (selectedUploadFiles.length === 0) return;
    setIsUploading(true);
    try {
      await dispatch(
        fileUploadThunk({
          repoName: reponame!,
          files: selectedUploadFiles,
          branch: branch,
          commitMessage: uploadCommitMessage || 'Upload files via web',
          currentPath: currentPath,
          username: username!,
        }),
      ).unwrap();
      //cleanup locally
      setShowUploadZone(false);
      setSelectedUploadFiles([]);
      setUploadCommitMessage('');

      //automatically refresh the file view
      dispatch(
        getFilesThunk({ username: username!, reponame: reponame!, branch, path: currentPath }),
      );
      dispatch(getCommitsThunk({ username: username!, reponame: reponame!, branch }));
      setSuccessSonar({
        isOpen: true,
        title: 'Files Committed',
        subtitle: 'Your files were uploaded successfully.',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTablChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      setSearchParams(tab === 'code' ? {} : { tab });
    },
    [searchParams],
  );

  const handleCommitClick = useCallback(
    (commitHash: string) => {
      if (expandedCommitHash === commitHash) {
        // Toggle off — collapse
        setExpandedCommitHash(null);
        return;
      }
      setExpandedCommitHash(commitHash);
      dispatch(
        compareCommitThunk({
          username: username!,
          reponame: reponame!,
          base: `${commitHash}~1`,
          head: commitHash,
        }),
      );
    },
    [dispatch, username, reponame, expandedCommitHash],
  );

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
    navigator.clipboard.writeText(`git clone ${cloneUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cloneUrl]);

  const handleFileDeletion = async () => {
    if (!selectedFile) return;
    setIsDeletingFile(true);
    try {
      await dispatch(
        deleteFileThunk({
          username: username!,
          reponame: reponame!,
          branch: branch,
          filePath: selectedFile,
          commitMessage: `Delete ${selectedFile.split('/').pop()}`,
        }),
      ).unwrap();
      setShowFileDeleteModal(false);
      setSelectFile('');
      //automatically refresh the entire file tree so the file visible vanishes
      dispatch(
        getFilesThunk({ username: username!, reponame: reponame!, branch, path: currentPath }),
      );
      dispatch(getCommitsThunk({ username: username!, reponame: reponame!, branch }));
      setSuccessSonar({
        isOpen: true,
        title: 'File Deleted Successfully',
        subtitle: `${selectedFile} was correctly tracked and permanently removed.`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingFile(false);
    }
  };

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
      file: TreeNode;
      selectedFile: string;
      currentPath: string;
      expandedPaths: Set<string>;
      onClick: (node: TreeNode) => void;
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
    ({ file, onClick }: { file: TreeNode; onClick: (node: TreeNode) => void }) => {
      // Use file-specific metadata with proper fallbacks
      const commitMessage = file.lastCommitMessage || '—';
      const commitDate = file.lastCommitDate ? timeAgo(file.lastCommitDate) : '—';

      return (
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
            <span className="text-gray-400 text-xs truncate max-w-md block">{commitMessage}</span>
          </td>
          <td className="px-4 py-2.5 text-right">
            <span className="text-gray-500 text-xs">{commitDate}</span>
          </td>
        </tr>
      );
    },
  );

  const CommitItem = React.memo(
    ({
      commit,
      isExpanded,
      onClick,
      isCompareLoading,
      compareData,
    }: {
      commit: { hash: string; author: string; message: string; date: string };
      isExpanded: boolean;
      onClick: (hash: string) => void;
      isCompareLoading: boolean;
      compareData: typeof import('src/types/commit/commit.types').initialState.data;
    }) => (
      <div>
        <div
          className={`flex items-start gap-2 xs:gap-3 sm:gap-4 px-3 xs:px-4 py-3 xs:py-4 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition cursor-pointer ${
            isExpanded ? 'bg-gray-800/30 border-l-2 border-l-blue-500' : ''
          }`}
          onClick={() => onClick(commit.hash)}
        >
          <div className="w-6 h-6 xs:w-8 xs:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] xs:text-xs font-bold shrink-0">
            {commit.author?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs xs:text-sm font-medium truncate">{commit.message}</p>
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {commit.author} · {formatDate(commit.date)}
            </p>
          </div>
          <span className="text-blue-400 text-[10px] xs:text-xs font-mono bg-blue-500/10 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded shrink-0 flex items-center gap-1 hidden xs:flex">
            <GitCommit className="w-3 h-3" />
            {commit.hash}
          </span>
        </div>

        {/* Expanded Diff Section */}
        {isExpanded && (
          <div className="border-b border-gray-800/50 bg-gray-950/50">
            <div className="px-4 py-3 border-b border-gray-800/30">
              <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                <FileCode className="w-4 h-4" /> Files Changed
              </h4>
            </div>
            <div className="p-4">
              {isCompareLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : compareData?.diffs && compareData.diffs.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary bar */}
                  <div className="flex flex-wrap items-center gap-2 xs:gap-4 text-xs text-gray-400 mb-2">
                    <span>
                      <span className="text-white font-semibold">{compareData.filesChanged}</span>{' '}
                      file{compareData.filesChanged !== 1 ? 's' : ''} changed
                    </span>
                    <span className="text-green-400">
                      +{compareData.diffs.reduce((sum, f) => sum + f.additions, 0)}
                    </span>
                    <span className="text-red-400">
                      -{compareData.diffs.reduce((sum, f) => sum + f.deletions, 0)}
                    </span>
                  </div>

                  {compareData.diffs.map((file, idx) => (
                    <FileDiffViewer key={file.path} file={file} id={`commit-diff-${idx}`} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm italic text-center py-6">
                  No changes found for this commit.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    ),
  );

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
      <AppHeader />

      {/* Repo breadcrumb bar */}
      <div className="border-b border-gray-800 px-3 xs:px-4 sm:px-6 py-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs xs:text-sm min-w-0">
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
      <div className="border-b border-gray-800 px-2 xs:px-3 sm:px-6 overflow-x-auto">
        <div className="flex items-center gap-0.5 xs:gap-1 min-w-max">
          <button
            onClick={() => handleTablChange('code')}
            className={`flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'code'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Folder className="w-4 h-4" /> Code
          </button>
          <button
            onClick={() => handleTablChange('commits')}
            className={`flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 whitespace-nowrap ${
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
            onClick={() => handleTablChange('branches')}
            className={`flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'branches'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Branches {branches.length > 0 && `(${branches.length})`}
          </button>

          <button
            onClick={() => handleTablChange('pulls')}
            className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 text-gray-500 border-transparent hover:text-gray-300 whitespace-nowrap"
          >
            <GitPullRequest className="w-4 h-4" />
            Pull Requests
          </button>
          <button
            onClick={() => handleTablChange('issues')}
            className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 text-gray-500 border-transparent hover:text-gray-300 whitespace-nowrap"
          >
            <CircleDot className="w-4 h-4" />
            Issues
          </button>
          <button
            onClick={() => handleTablChange('collaborators')}
            className={`flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'collaborators'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Collaborators
          </button>
          <button
            onClick={() => handleTablChange('actions')}
            className={`flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2.5 xs:py-3 text-xs xs:text-sm transition border-b-2 whitespace-nowrap ${
              activeTab === 'actions'
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <Play className="w-4 h-4" />
            Actions
          </button>
        </div>
      </div>
      {/* CODE TAB */}
      {activeTab === 'code' && (
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Left Sidebar — File Tree */}
          <div className="hidden md:flex w-56 lg:w-64 border-r border-gray-800 flex-col shrink-0">
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
            <div className="px-3 xs:px-4 py-2 xs:py-2.5 border-b border-gray-800 flex items-center justify-between bg-gray-950 shrink-0 gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs xs:text-sm min-w-0 flex-wrap">
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
              <div className="flex items-center gap-2 relative">
                {/* Clone Repo Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCloneDropdown(!showCloneDropdown)}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                  >
                    <FileCode className="w-3.5 h-3.5" /> Code <ChevronDown className="w-3 h-3" />
                  </button>
                  {showCloneDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-4">
                      {/* --- Existing Clone section --- */}
                      <div className="mb-2">
                        <h4 className="text-white text-sm font-semibold flex items-center gap-2">
                          <Globe className="w-4 h-4" /> Clone
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Clone with HTTPS into your local IDE.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-3 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 mb-4">
                        <input
                          type="text"
                          readOnly
                          value={`git clone ${cloneUrl}`}
                          className="flex-1 bg-transparent text-gray-300 text-xs focus:outline-none"
                        />
                        <button
                          onClick={handleCopy}
                          className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* --- NEW SECTION: Download ZIP Button --- */}
                      <div className="border-t border-gray-800 pt-3 mt-1">
                        <button
                          onClick={handleDownloadZip}
                          disabled={isDownloading}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                        >
                          {isDownloading ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {isDownloading ? 'Downloading...' : 'Download ZIP'}
                        </button>
                      </div>
                      {/* --- END NEW SECTION --- */}
                    </div>
                  )}
                </div>
                {hasWriteAccess && !selectedFile && (
                  <button
                    onClick={() => setShowUploadZone(true)}
                    className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    Upload files
                  </button>
                )}
                {/* REPLACED WITH STARBUTTON */}
                <StarButton
                  username={username!}
                  reponame={reponame!}
                  initialStars={repo.stars}
                  initialStarredBy={repo.starredBy || []}
                  isOwner={isOwner}
                />
                <ForkButton username={username!} reponame={reponame!} forksCount={repo.forks} />
              </div>
            </div>

            {showUploadZone && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 m-3 xs:m-4 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-800 bg-gray-950/50 p-4 rounded-lg gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-white font-medium">Select assets to upload</span>
                    <span className="text-xs text-gray-500">
                      {selectedUploadFiles.length === 0
                        ? 'No files selected'
                        : `${selectedUploadFiles.length} file(s) primed for commit`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg cursor-pointer transition border border-gray-700 shrink-0">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedUploadFiles((prev) => [
                              ...prev,
                              ...Array.from(e.target.files!),
                            ]);
                          }
                        }}
                      />
                    </label>
                    <label className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-lg cursor-pointer transition border border-gray-700 shrink-0">
                      Browse Folder
                      <input
                        type="file"
                        multiple
                        webkitdirectory="true"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedUploadFiles((prev) => [
                              ...prev,
                              ...Array.from(e.target.files!),
                            ]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={uploadCommitMessage}
                    onChange={(e) => setUploadCommitMessage(e.target.value)}
                    placeholder="Add a commit message... (optional)"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowUploadZone(false);
                      setSelectedUploadFiles([]);
                    }}
                    className="text-sm text-gray-400 hover:text-white transition"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading || selectedUploadFiles.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
                  >
                    {isUploading ? 'Committing...' : 'Commit Files'}
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {isEmpty && (
              <div className="flex-1 p-3 xs:p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 max-w-xl">
                  <p className="text-gray-500 text-sm">
                    This repository is empty. Push your first commit:
                  </p>
                  <button
                    onClick={handleCopyCommands}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      commandsCopied
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    }`}
                  >
                    {commandsCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 xs:p-4 font-mono text-[10px] xs:text-xs space-y-1 max-w-xl overflow-x-auto border border-gray-800/50">
                  {emptyRepoCommands.split('\n').map((line, i) => (
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
                {(isOwner || hasWriteAccess) && activeBranches.length > 0 && !selectedFile && (
                  <RecentPushesBanner
                    username={username!}
                    reponame={reponame!}
                    branches={activeBranches}
                    defaultBranch={repo.defaultBranch}
                  />
                )}
                {/* Latest commit bar */}
                {latestCommit && !selectedFile && (
                  <div className="px-3 xs:px-4 py-2 xs:py-2.5 border-b border-gray-800 flex items-center gap-2 xs:gap-3 bg-gray-900/30 shrink-0 flex-wrap">
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
                    <div className="px-3 xs:px-4 py-2 xs:py-2.5 border-b border-gray-800 flex items-center justify-between bg-gray-900/30 flex-wrap gap-2">
                      <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-wrap">
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
                            disabled={!hasWriteAccess}
                            onClick={() => {
                              setIsEditing(true);
                              setEditedContent(fileContent);
                            }}
                            className={`text-xs flex items-center gap-1 transition ${
                              !hasWriteAccess
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
                    <div className="px-3 xs:px-4 py-2 border-b border-gray-800 flex items-center justify-between bg-gray-900 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          className={`text-xs px-3 py-1 border border-gray-700 rounded font-medium transition ${!isEditing ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                          onClick={() => setIsEditing(false)}
                        >
                          Code
                        </button>
                        {isEditing && (
                          <button
                            disabled={!hasWriteAccess}
                            onClick={() => setShowCommitModal(true)}
                            className={`text-xs px-3 py-1 rounded transition ${
                              !hasWriteAccess
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            Commit Changes
                          </button>
                        )}
                        {/* BRAND NEW DELETE BUTTON INJECTED HERE */}
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

                        {!isEditing && hasWriteAccess && (
                          <button
                            disabled={!hasWriteAccess}
                            onClick={() => setShowFileDeleteModal(true)}
                            className="text-xs px-3 py-1 bg-red-900/40 text-red-400 hover:bg-red-900/60 transition rounded border border-red-500/20"
                          >
                            Delete File
                          </button>
                        )}
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
                                onClick={handleTreeNodeClick}
                              />
                            ))}
                          </tbody>
                        </table>

                        {/* README */}
                        {readmeContent && (
                          <div className="m-3 xs:m-4">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                              <div className="px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
                                <File className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-white text-xs font-semibold">README.md</span>
                              </div>
                              <div className="p-3 xs:p-4 sm:p-6">
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
            <div className="w-full lg:w-64 shrink-0 lg:border-l border-t lg:border-t-0 border-gray-800 p-3 xs:p-4 space-y-4 overflow-y-auto">
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
                    { icon: Star, label: 'Stars', value: repo.stars }, // UPDATED: uses repo.stars directly
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
        <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {isCommitsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : commits.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-500 text-sm">No commits yet</div>
            ) : (
              commits.map((commit) => (
                <CommitItem
                  key={commit.hash}
                  commit={commit}
                  isExpanded={expandedCommitHash === commit.hash}
                  onClick={handleCommitClick}
                  isCompareLoading={isCompareLoading}
                  compareData={compareData}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full text-center flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 xs:p-8 sm:p-10">
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
        <PRListContent
          username={username!}
          reponame={reponame!}
          isOwner={isOwner}
          hasWriteAccess={hasWriteAccess}
        />
      )}

      {activeTab === 'issues' && (
        <IssueListContent
          username={username!}
          reponame={reponame!}
          isOwner={isOwner}
          hasWriteAccess={hasWriteAccess}
        />
      )}
      {activeTab === 'collaborators' && (
        <CollaboratorsTabContent username={username!} reponame={reponame!} isOwner={isOwner} />
      )}

      {/* ACTIONS TAB */}
      {activeTab === 'actions' && (
        <div className="flex-1 px-4 sm:px-6 py-6">
          <div className="max-w-5xl mx-auto">
            {workflowLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : workflowRuns.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-7 h-7 text-gray-600" />
                </div>
                <h2 className="text-white text-lg font-semibold mb-2">No workflow runs yet</h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  CI/CD is enabled for this repository. Push a commit or merge a pull request to
                  trigger your first pipeline run automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {workflowRuns.map((run) => {
                  const isExpanded = expandedRunId === run._id;
                  const statusStyles = {
                    QUEUED: {
                      color: 'text-yellow-400',
                      bg: 'bg-yellow-500/10',
                      border: 'border-yellow-500/30',
                      label: 'Queued',
                    },
                    RUNNING: {
                      color: 'text-blue-400',
                      bg: 'bg-blue-500/10',
                      border: 'border-blue-500/30',
                      label: 'Running',
                    },
                    SUCCESS: {
                      color: 'text-green-400',
                      bg: 'bg-green-500/10',
                      border: 'border-green-500/30',
                      label: 'Success',
                    },
                    FAILED: {
                      color: 'text-red-400',
                      bg: 'bg-red-500/10',
                      border: 'border-red-500/30',
                      label: 'Failed',
                    },
                  };
                  const s = statusStyles[run.status];

                  return (
                    <div
                      key={run._id}
                      className="border border-gray-800 rounded-xl overflow-hidden"
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition hover:bg-gray-900/50 ${
                          isExpanded ? 'bg-gray-900/50 border-b border-gray-800' : ''
                        }`}
                        onClick={async () => {
                          if (isExpanded) {
                            setExpandedRunId(null);
                            setSelectedRunDetail(null);
                            return;
                          }
                          setExpandedRunId(run._id);
                          setRunDetailLoading(true);
                          try {
                            const detail = await workflowService.getRun(run._id);
                            setSelectedRunDetail(detail);
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setRunDetailLoading(false);
                          }
                        }}
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center shrink-0`}
                        >
                          {run.status === 'RUNNING' ? (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          ) : run.status === 'SUCCESS' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : run.status === 'FAILED' ? (
                            <span className="text-red-400 text-xs font-bold">✕</span>
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">Pipeline Run</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.color}`}
                            >
                              {s.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <GitCommit className="w-3 h-3" />
                              {run.commitHash.substring(0, 7)}
                            </span>
                            <span className="text-gray-600 text-xs">{timeAgo(run.createdAt)}</span>
                          </div>
                        </div>
                        <div className="text-gray-500">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-gray-950 border-t border-gray-800">
                          <div className="px-4 py-2.5 border-b border-gray-800/50 flex items-center gap-2">
                            <History className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 text-xs font-semibold">Build Logs</span>
                          </div>
                          <div className="p-4 max-h-96 overflow-y-auto">
                            {runDetailLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : selectedRunDetail?.logs ? (
                              <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {selectedRunDetail.logs}
                              </pre>
                            ) : (
                              <p className="text-gray-600 text-xs text-center py-6 italic">
                                No logs available yet. Waiting for the pipeline to start...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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

      {/* File Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showFileDeleteModal}
        onClose={() => setShowFileDeleteModal(false)}
        onConfirm={handleFileDeletion}
        itemName="file"
        itemPath={selectedFile}
        isLoading={isDeletingFile}
      />
    </div>
  );
};

export default RepositoryDetailPage;
