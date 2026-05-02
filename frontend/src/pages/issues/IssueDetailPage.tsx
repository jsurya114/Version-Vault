import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleDot, CheckCircle, Clock, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getIssueThunk, closeIssueThunk } from '../../features/issues/issueThunk';
import { selectSelectedIssue, selectIssueLoading } from '../../features/issues/issueSelector';
import { selectAuthUser } from '../../features/auth/authSelectors';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { IssuePriority } from '../../types/issues/issues.types';
import ConfirmModal from '../../types/common/Modal/ConfirmModal';
import CommentSection from '../../types/common/comment/CommentSection';

const priorityColors: Record<IssuePriority, string> = {
  low: 'text-gray-400 bg-gray-700 border-gray-600',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const IssueDetailPage = () => {
  const dispatch = useAppDispatch();
  const { username, reponame, id } = useParams();
  const issue = useAppSelector(selectSelectedIssue);
  const isLoading = useAppSelector(selectIssueLoading);
  const user = useAppSelector(selectAuthUser);
  const isOwner = user?.userId === username;
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(getIssueThunk({ username: username!, reponame: reponame!, id }));
  }, [id, dispatch, username, reponame]);

  const handleCloseConfirm = useCallback(async () => {
    await dispatch(closeIssueThunk({ username: username!, reponame: reponame!, id: id! }));
  }, [dispatch, username, reponame, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
      <AppHeader />

      <ConfirmModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseConfirm}
        title="Close Issue"
        message={`Are you sure you want to close issue #${issue.id.slice(-6)}? This will mark it as completed.`}
        confirmText="Close Issue"
        confirmColor="bg-red-600"
        icon={<AlertCircle className="w-5 h-5 text-red-400" />}
      />
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
          <Link to={`/${username}/${reponame}/issues`} className="text-blue-400 hover:underline">
            Issues
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">#{issue.id.slice(-6)}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full flex-1">
        {/* Issue Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 xs:gap-4">
            <div className="flex items-start gap-2 xs:gap-3 min-w-0">
              <div className="mt-1 shrink-0">
                {issue.status === 'open' ? (
                  <CircleDot className="w-5 h-5 xs:w-6 xs:h-6 text-green-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 xs:w-6 xs:h-6 text-purple-400" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-white text-lg xs:text-xl font-bold break-words">
                  {issue.title}
                </h1>
                <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 mt-1 text-gray-500 text-[10px] xs:text-xs">
                  <span
                    className={`px-2 py-0.5 rounded border capitalize text-xs ${
                      issue.status === 'open'
                        ? 'text-green-400 bg-green-500/10 border-green-500/30'
                        : 'text-purple-400 bg-purple-500/10 border-purple-500/30'
                    }`}
                  >
                    {issue.status}
                  </span>
                  <span>
                    opened by{' '}
                    <span className="text-gray-300 break-all">{issue.authorUsername}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(issue.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {issue.commentsCount} comments
                  </span>
                </div>
              </div>
            </div>

            {isOwner && issue.status === 'open' && (
              <button
                onClick={() => setIsCloseModalOpen(true)}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg transition shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Close Issue
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 xs:gap-6">
          {/* Main */}
          <div className="flex-1 space-y-4">
            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-sm font-semibold mb-3">Description</h3>
              {issue.description ? (
                <p className="text-gray-400 text-sm leading-relaxed break-words">
                  {issue.description}
                </p>
              ) : (
                <p className="text-gray-600 text-sm italic">No description provided.</p>
              )}
            </div>

            {/* Comments Section */}
            <CommentSection
              username={username!}
              reponame={reponame!}
              targetType="issue"
              targetId={issue.id}
              isDisabled={issue.status !== 'open'}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-56 shrink-0 space-y-4 min-w-0 overflow-hidden">
            {/* Priority */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-xs font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> Priority
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded border capitalize ${priorityColors[issue.priority as IssuePriority]}`}
              >
                {issue.priority}
              </span>
            </div>

            {/* Labels */}
            {issue.labels.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
                <h3 className="text-white text-xs font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Labels
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-xs font-semibold mb-2">Author</h3>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {issue.authorUsername?.[0]?.toUpperCase()}
                </div>
                <span className="text-gray-400 text-xs truncate">{issue.authorUsername}</span>
              </div>
            </div>

            {/* Assignees */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
              <h3 className="text-white text-xs font-semibold mb-2">Assignees</h3>
              {!issue.assignees || issue.assignees.length === 0 ? (
                <p className="text-gray-600 text-xs italic">No assignees</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {issue.assignees.map((a) => (
                    <div key={a} className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {a[0]?.toUpperCase()}
                      </div>
                      <span className="text-gray-400 text-xs truncate">{a}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default IssueDetailPage;
