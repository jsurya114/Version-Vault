import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GitPullRequest,
  GitMerge,
  X,
  Clock,
  GitBranch,
  MessageSquare,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { workflowService } from '../../services/workflow.service';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  getPRThunk,
  mergePRThunk,
  closePRThunk,
  requestMergeThunk,
  approveMergeThunk,
  rejectMergeThunk,
  getConflictsThunk,
  resolveConflictsThunk,
} from '../../features/pullrequest/prThunk';
import {
  selectSelectedPR,
  selectPRLoading,
  selectConflictLoading,
  selectConflicts,
  selectIsResolving,
} from '../../features/pullrequest/prSelector';
import { selectAuthUser } from '../../features/auth/authSelectors';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { PRStatus, ResolvedFile } from '../../types/pullrequest/pullrequest.types';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import MergeConfirmModal from '../../types/common/Modal/MergeConfirmModal';
import ConfirmModal from 'src/types/common/Modal/ConfirmModal';
import { collaboratorService } from 'src/services/collaborator.service';

import { FileDiffViewer } from './components/DiffViewer';
import { compareCommitThunk } from 'src/features/commit/compareCommitThunk';
import {
  selectCompareData,
  selectCompareLoading,
} from 'src/features/commit/compareCommitSelectors';
import CommentSection from '../../types/common/comment/CommentSection';
import ConflictEditor from './components/ConflictEditor';

const statusColors: Record<PRStatus, string> = {
  open: 'text-green-400 bg-green-500/10 border-green-500/30',
  closed: 'text-red-400 bg-red-500/10 border-red-500/30',
  merged: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const PRDetailPage = () => {
  const dispatch = useAppDispatch();
  const { username, reponame, id } = useParams();
  const pr = useAppSelector(selectSelectedPR);
  const isLoading = useAppSelector(selectPRLoading);
  const user = useAppSelector(selectAuthUser);
  const [isMerging, setIsMerging] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [hasWriteAccess, setHasWriteAccess] = useState(false);
  const compareData = useAppSelector(selectCompareData);
  const isCompareLoading = useAppSelector(selectCompareLoading);

  const isOwner = user?.userId === username;

  const conflicts = useAppSelector(selectConflicts);
  const isConflictLoading = useAppSelector(selectConflictLoading);
  const isResolving = useAppSelector(selectIsResolving);
  const [showConflictEditor, setShowConflictEditor] = useState(false);
  const [cicdStatus, setCicdStatus] = useState<{
    status: string;
    commitHash: string;
    createdAt: string;
  } | null>(null);
  const [cicdLoading, setCicdLoading] = useState(true);
  // Check if the PR is mergeable from compare data
  const isMergeable = compareData?.isMergeable ?? true;
  const cicdFailed = cicdStatus?.status === 'FAILED';
  const cicdRunning = cicdStatus?.status === 'RUNNING' || cicdStatus?.status === 'QUEUED';

  const hasNoChanges = !isCompareLoading && (!compareData?.diffs || compareData.diffs.length === 0);

  useEffect(() => {
    // Check if the PR loaded in Redux actually matches the PR we are clicking!
    if (pr && pr.id === id) {
      dispatch({ type: 'compareSlice/clearCommitComparison' });
      dispatch(
        compareCommitThunk({
          username: username!,
          reponame: reponame!,
          base: pr.baseCommitHash || pr.targetBranch,
          head: pr.headCommitHash || pr.sourceBranch,
        }),
      );
    }
  }, [
    pr?.id,
    pr?.targetBranch,
    pr?.sourceBranch,
    pr?.baseCommitHash,
    pr?.headCommitHash,
    username,
    reponame,
    dispatch,
    id,
  ]);

  useEffect(() => {
    if (id) dispatch(getPRThunk({ username: username!, reponame: reponame!, id }));
  }, [id, dispatch, username, reponame]);

  // Fetch latest CI/CD status for this repo
  useEffect(() => {
    if (username && reponame && pr?.status === 'open') {
      setCicdLoading(true);
      workflowService
        .getLatestStatus(username, reponame)
        .then((data) => setCicdStatus(data))
        .catch(() => setCicdStatus(null))
        .finally(() => setCicdLoading(false));
    }
  }, [username, reponame, pr?.status]);

  useEffect(() => {
    if (!isMergeable && pr?.status === 'open' && isOwner && username && reponame && id) {
      dispatch(getConflictsThunk({ username, reponame, id }));
    }
  }, [isMergeable, pr?.status, isOwner, username, reponame, id, dispatch]);

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

  const handleResolveConflicts = useCallback(
    async (resolvedFiles: ResolvedFile[]) => {
      const result = await dispatch(
        resolveConflictsThunk({
          username: username!,
          reponame: reponame!,
          id: id!,
          resolvedFiles,
        }),
      );
      if (resolveConflictsThunk.fulfilled.match(result)) {
        setShowConflictEditor(false);
        setSuccessSonar({
          isOpen: true,
          title: 'Conflicts Resolved & Merged!',
          subtitle: `Changes are now in ${pr?.targetBranch}`,
        });
      }
    },
    [dispatch, username, reponame, id, pr?.targetBranch],
  );

  const handleRequestMerge = useCallback(async () => {
    await dispatch(requestMergeThunk({ username: username!, reponame: reponame!, id: id! }));
    dispatch(getPRThunk({ username: username!, reponame: reponame!, id: id! }));
  }, [dispatch, username, reponame, id]);
  const handleApproveMerge = useCallback(async () => {
    setIsMerging(true);
    try {
      await dispatch(approveMergeThunk({ username: username!, reponame: reponame!, id: id! }));
      dispatch(getPRThunk({ username: username!, reponame: reponame!, id: id! }));
    } finally {
      setIsMerging(false);
    }
  }, [dispatch, username, reponame, id, pr?.targetBranch]);

  const handleRejectMerge = useCallback(async () => {
    await dispatch(rejectMergeThunk({ username: username!, reponame: reponame!, id: id! }));
    dispatch(getPRThunk({ username: username!, reponame: reponame!, id: id! }));
  }, [dispatch, username, reponame, id]);

  const handleMergeConfirm = useCallback(async () => {
    setIsMerging(true);
    try {
      const result = await dispatch(
        mergePRThunk({ username: username!, reponame: reponame!, id: id! }),
      );
      if (mergePRThunk.fulfilled.match(result)) {
        setSuccessSonar({
          isOpen: true,
          title: 'Successfully Merged!',
          subtitle: `Changes are now in ${pr?.targetBranch}`,
        });
      }
    } finally {
      setIsMerging(false);
    }
  }, [dispatch, username, reponame, id, pr?.targetBranch]);

  const handleCloseConfirm = useCallback(async () => {
    await dispatch(closePRThunk({ username: username!, reponame: reponame!, id: id! }));
  }, [dispatch, username, reponame, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pr) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative overflow-x-hidden">
      {/* Full-Screen Loader for Merging */}
      {isMerging && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6" />
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">
            Merging Pull Request
          </h2>
          <p className="text-purple-300 text-sm font-medium animate-pulse">
            Applying your changes to {pr.targetBranch}...
          </p>
        </div>
      )}

      <AppHeader />

      {/* Breadcrumb */}
      <div className="border-b border-gray-800 px-3 xs:px-4 sm:px-6 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-1 text-xs xs:text-sm min-w-0 flex-wrap">
          <Link to={ROUTES.REPO_LIST} className="text-blue-400 hover:underline">
            {username}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}`} className="text-blue-400 hover:underline">
            {reponame}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}/pulls`} className="text-blue-400 hover:underline">
            Pull Requests
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">#{pr.id.slice(-6)}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full flex-1">
        {/* Success Sonar */}
        {successSonar.isOpen && (
          <SuccessSonar
            isOpen={successSonar.isOpen}
            onClose={() => setSuccessSonar((prev) => ({ ...prev, isOpen: false }))}
            title={successSonar.title}
            subtitle={successSonar.subtitle}
          />
        )}

        {/* Merge Confirmation Modal */}
        <MergeConfirmModal
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          onConfirm={handleMergeConfirm}
          prTitle={pr.title}
          sourceBranch={pr.sourceBranch}
          targetBranch={pr.targetBranch}
        />

        <ConfirmModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          onConfirm={handleCloseConfirm}
          title="Close Pull Request"
          message="Are you sure you want to close this pull request? You can always reopen it later."
          confirmText="Close PR"
          confirmColor="bg-gray-700"
          icon={<X className="w-5 h-5 text-red-500" />}
        />
        {/* PR Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 xs:gap-4">
            <div className="flex items-start gap-2 xs:gap-3 min-w-0">
              <div
                className={`mt-1 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${statusColors[pr.status as PRStatus]}`}
              >
                {pr.status === 'merged' ? (
                  <GitMerge className="w-3.5 h-3.5" />
                ) : pr.status === 'closed' ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <GitPullRequest className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-white text-lg xs:text-xl font-bold break-words">{pr.title}</h1>
                <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 mt-1 text-gray-500 text-[10px] xs:text-xs">
                  <span
                    className={`px-2 py-0.5 rounded border capitalize text-xs ${statusColors[pr.status as PRStatus]}`}
                  >
                    {pr.status}
                  </span>
                  <span>
                    opened by <span className="text-gray-300 break-all">{pr.authorUsername}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(pr.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {pr.commentsCount} comments
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {/* Actions */}
            {pr.status === 'open' && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isOwner ? (
                  <>
                    {pr.mergeApproval === 'pending' ? (
                      <>
                        <span className="text-yellow-400 text-xs italic mr-2">
                          Merge requested by {pr.authorUsername}
                        </span>
                        <button
                          onClick={() => handleApproveMerge()}
                          disabled={isMerging}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 shadow-md shadow-green-900/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <GitMerge className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMerge()}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 border border-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : pr.mergeApproval === 'rejected' ? (
                      <>
                        <span className="text-red-400 text-xs italic mr-2">
                          Merge request rejected
                        </span>
                        <button
                          disabled={true}
                          className="flex items-center gap-1.5 bg-gray-800 text-gray-500 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed opacity-50 border border-gray-700"
                        >
                          <GitMerge className="w-4 h-4" />
                          Merge Pull Request
                        </button>
                      </>
                    ) : isMergeable ? (
                      <button
                        onClick={() => setIsMergeModalOpen(true)}
                        disabled={isMerging || cicdFailed || cicdRunning || hasNoChanges}
                        className={`flex items-center gap-1.5 shadow-md text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                          cicdFailed
                            ? 'bg-red-800 hover:bg-red-800 shadow-red-900/20 cursor-not-allowed'
                            : cicdRunning
                              ? 'bg-yellow-700 hover:bg-yellow-700 shadow-yellow-900/20 cursor-not-allowed'
                              : hasNoChanges
                                ? 'bg-gray-800 hover:bg-gray-800 text-gray-500 border border-gray-700 shadow-none cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/20'
                        }`}
                        title={
                          cicdFailed
                            ? 'CI/CD pipeline failed — fix the issues first'
                            : cicdRunning
                              ? 'Waiting for CI/CD to finish...'
                              : hasNoChanges
                                ? 'No file changes to merge'
                                : 'Merge this pull request'
                        }
                      >
                        {cicdFailed ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : cicdRunning ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <GitMerge className="w-4 h-4" />
                        )}
                        {cicdFailed
                          ? 'Merge Blocked'
                          : cicdRunning
                            ? 'CI/CD Running...'
                            : hasNoChanges
                              ? 'Nothing to merge'
                              : 'Merge Pull Request'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConflictEditor(true)}
                        disabled={isConflictLoading}
                        className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-900/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {isConflictLoading ? 'Loading conflicts...' : 'Resolve Conflicts'}
                      </button>
                    )}

                    <button
                      onClick={() => setIsCloseModalOpen(true)}
                      className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      <X className="w-4 h-4" /> Close PR
                    </button>
                  </>
                ) : hasWriteAccess ? (
                  <>
                    {pr.mergeApproval === 'pending' ? (
                      <span className="text-yellow-400 text-sm italic font-medium px-4 py-2 bg-yellow-900/20 border border-yellow-700/50 rounded-xl">
                        Merge request pending owner approval
                      </span>
                    ) : pr.mergeApproval === 'rejected' ? (
                      <span className="text-red-400 text-sm italic font-medium px-4 py-2 bg-red-900/20 border border-red-700/50 rounded-xl">
                        Merge request was rejected
                      </span>
                    ) : pr.mergeApproval === 'approved' ? (
                      <span className="text-green-400 text-sm italic font-medium px-4 py-2 bg-green-900/20 border border-green-700/50 rounded-xl">
                        Merge request approved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequestMerge()}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                      >
                        <GitMerge className="w-4 h-4" />
                        Request Merge
                      </button>
                    )}
                    <button
                      onClick={() => setIsCloseModalOpen(true)}
                      className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      <X className="w-4 h-4" /> Close PR
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 xs:gap-6">
          {/* Main */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Branch info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <div className="flex flex-wrap items-center gap-2 xs:gap-3 text-sm">
                <div className="flex items-center gap-1.5 xs:gap-2 bg-gray-800 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg shadow-inner min-w-0">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400 font-mono text-[11px] xs:text-xs truncate">
                    {pr.sourceBranch}
                  </span>
                </div>
                <span className="text-gray-500">→</span>
                <div className="flex items-center gap-1.5 xs:gap-2 bg-gray-800 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg shadow-inner min-w-0">
                  <GitBranch className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-mono text-[11px] xs:text-xs truncate">
                    {pr.targetBranch}
                  </span>
                </div>
              </div>
            </div>

            {/* CI/CD Status Banner */}
            {pr.status === 'open' && !cicdLoading && cicdStatus && (
              <div
                className={`border rounded-xl p-4 flex items-center gap-3 ${
                  cicdStatus.status === 'SUCCESS'
                    ? 'bg-green-900/10 border-green-500/20'
                    : cicdStatus.status === 'FAILED'
                      ? 'bg-red-900/10 border-red-500/20'
                      : 'bg-yellow-900/10 border-yellow-500/20'
                }`}
              >
                {cicdStatus.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                ) : cicdStatus.status === 'FAILED' ? (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                ) : (
                  <Loader2 className="w-5 h-5 text-yellow-400 shrink-0 animate-spin" />
                )}
                <div>
                  <p
                    className={`text-sm font-bold ${
                      cicdStatus.status === 'SUCCESS'
                        ? 'text-green-300'
                        : cicdStatus.status === 'FAILED'
                          ? 'text-red-300'
                          : 'text-yellow-300'
                    }`}
                  >
                    {cicdStatus.status === 'SUCCESS'
                      ? 'All checks have passed'
                      : cicdStatus.status === 'FAILED'
                        ? 'Some checks have failed — merging is blocked'
                        : 'Checks are running — please wait'}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Latest pipeline on commit {cicdStatus.commitHash.slice(0, 7)}
                  </p>
                </div>
              </div>
            )}

            {/* Merge Conflict Banner */}
            {!isMergeable && pr.status === 'open' && (
              <div className="bg-gradient-to-r from-amber-900/20 to-red-900/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-amber-300 text-sm font-bold">
                      This branch has conflicts that must be resolved
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Conflicting files need to be reviewed and resolved before merging.
                    </p>
                  </div>
                </div>
                {isOwner && !showConflictEditor && (
                  <button
                    onClick={() => setShowConflictEditor(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-4 py-2 rounded-lg transition-all shrink-0"
                  >
                    Resolve in editor
                  </button>
                )}
              </div>
            )}

            {/* Conflict Editor */}
            {showConflictEditor && conflicts?.hasConflicts && (
              <ConflictEditor
                conflictFiles={conflicts.conflictFiles}
                sourceBranch={pr.sourceBranch}
                targetBranch={pr.targetBranch}
                onResolve={handleResolveConflicts}
                onCancel={() => setShowConflictEditor(false)}
                isResolving={isResolving}
              />
            )}

            {/* CLI Fallback - always shown when conflicts exist */}
            {!isMergeable && pr.status === 'open' && !showConflictEditor && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  Resolve via command line
                </h3>
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-400 space-y-1 overflow-x-auto">
                  <p className="text-gray-500"># Step 1: Checkout the target branch and pull</p>
                  <p>
                    <span className="text-green-400">git</span> checkout {pr.targetBranch}
                  </p>
                  <p>
                    <span className="text-green-400">git</span> pull origin {pr.targetBranch}
                  </p>
                  <br />
                  <p className="text-gray-500"># Step 2: Merge the source branch</p>
                  <p>
                    <span className="text-green-400">git</span> merge origin/{pr.sourceBranch}
                  </p>
                  <br />
                  <p className="text-gray-500"># Step 3: Resolve conflicts in your editor, then</p>
                  <p>
                    <span className="text-green-400">git</span> add .
                  </p>
                  <p>
                    <span className="text-green-400">git</span> commit -m "Resolve merge conflicts"
                  </p>
                  <p>
                    <span className="text-green-400">git</span> push origin {pr.targetBranch}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-sm font-semibold mb-3">Description</h3>
              {pr.description ? (
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {pr.description}
                </p>
              ) : (
                <p className="text-gray-600 text-sm italic">No description provided.</p>
              )}
            </div>

            {/* Changed Files */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
                <FileCode className="w-4 h-4" /> Files Changed
              </h3>

              {isCompareLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : compareData?.diffs && compareData.diffs.length > 0 ? (
                <div className="space-y-4">
                  {compareData.diffs.map((file, idx) => (
                    <FileDiffViewer key={file.path} file={file} id={`pr-diff-${idx}`} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm italic text-center py-6">
                  No changes found between these branches.
                </p>
              )}
            </div>

            {/* Comments Section */}
            <CommentSection
              username={username!}
              reponame={reponame!}
              targetType="pr"
              targetId={pr.id}
              isDisabled={pr.status !== 'open'}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-56 shrink-0 space-y-4 min-w-0 overflow-hidden">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-xs font-semibold mb-3">Reviewers</h3>
              {pr.reviewers.length === 0 ? (
                <p className="text-gray-600 text-xs">No reviewers assigned</p>
              ) : (
                pr.reviewers.map((r) => (
                  <p key={r} className="text-gray-400 text-xs truncate">
                    {r}
                  </p>
                ))
              )}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-xs font-semibold mb-2">Author</h3>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {pr.authorUsername?.[0]?.toUpperCase()}
                </div>
                <span className="text-gray-400 text-xs truncate">{pr.authorUsername}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default PRDetailPage;
