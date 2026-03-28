import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GitPullRequest, GitMerge, X, Clock, GitBranch, MessageSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getPRThunk, mergePRThunk, closePRThunk } from '../../features/pullrequest/prThunk';
import { selectSelectedPR, selectPRLoading } from '../../features/pullrequest/prSelector';
import { selectAuthUser } from '../../features/auth/authSelectors';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { PRStatus } from '../../types/pullrequest/pullrequest.types';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import MergeConfirmModal from '../../types/common/Modal/MergeConfirmModal';

const statusColors: Record<PRStatus, string> = {
  open: 'text-green-400 bg-green-500/10 border-green-500/30',
  closed: 'text-red-400 bg-red-500/10 border-red-500/30',
  merged: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
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

  const isOwner = user?.userId === username;

  useEffect(() => {
    if (id) dispatch(getPRThunk({ username: username!, reponame: reponame!, id }));
  }, [id, dispatch, username, reponame]);

  const handleMergeConfirm = async () => {
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
  };

  const handleClose = async () => {
    if (!window.confirm('Close this pull request?')) return;
    await dispatch(closePRThunk({ username: username!, reponame: reponame!, id: id! }));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pr) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">
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
      <div className="border-b border-gray-800 px-6 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-1 text-sm">
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

      <main className="max-w-5xl mx-auto px-6 py-6 w-full flex-1">
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

        {/* PR Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
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
              <div>
                <h1 className="text-white text-xl font-bold">{pr.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded border capitalize text-xs ${statusColors[pr.status as PRStatus]}`}
                  >
                    {pr.status}
                  </span>
                  <span>
                    opened by <span className="text-gray-300">{pr.authorUsername}</span>
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
            {isOwner && pr.status === 'open' && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsMergeModalOpen(true)}
                  disabled={isMerging}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-900/20 text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitMerge className="w-4 h-4" />
                  Merge Pull Request
                </button>
                <button
                  onClick={handleClose}
                  disabled={isMerging}
                  className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-red-400 font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main */}
          <div className="flex-1 space-y-4">
            {/* Branch info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg shadow-inner">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400 font-mono text-xs">{pr.sourceBranch}</span>
                </div>
                <span className="text-gray-500">→</span>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg shadow-inner">
                  <GitBranch className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 font-mono text-xs">{pr.targetBranch}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3">Description</h3>
              {pr.description ? (
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {pr.description}
                </p>
              ) : (
                <p className="text-gray-600 text-sm italic">No description provided.</p>
              )}
            </div>

            {/* Comments placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Comments
              </h3>
              <p className="text-gray-600 text-sm text-center py-4">Comments coming soon</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-56 shrink-0 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-xs font-semibold mb-3">Reviewers</h3>
              {pr.reviewers.length === 0 ? (
                <p className="text-gray-600 text-xs">No reviewers assigned</p>
              ) : (
                pr.reviewers.map((r) => (
                  <p key={r} className="text-gray-400 text-xs">
                    {r}
                  </p>
                ))
              )}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-xs font-semibold mb-2">Author</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {pr.authorUsername?.[0]?.toUpperCase()}
                </div>
                <span className="text-gray-400 text-xs">{pr.authorUsername}</span>
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
