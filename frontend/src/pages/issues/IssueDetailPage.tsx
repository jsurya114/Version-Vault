import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleDot, CheckCircle, Clock, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { getIssueThunk, closeIssueThunk } from 'src/features/issues/issueThunk';
import { selectSelectedIssue, selectIssueLoading } from 'src/features/issues/issueSelector';
import { selectAuthUser } from 'src/features/auth/authSelectors';
import AppHeader from 'src/types/common/Layout/AppHeader';
import AppFooter from 'src/types/common/Layout/AppFooter';
import { ROUTES } from 'src/constants/routes';
import { IssuePriority } from 'src/types/issues/issues.types';

const priorityColors: Record<IssuePriority, string> = {
  low: 'text-gray-400 bg-gray-700 border-gray-600',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const IssueDetailPage = () => {
  const dispatch = useAppDispatch();
  const { username, reponame, id } = useParams();
  const issue = useAppSelector(selectSelectedIssue);
  const isLoading = useAppSelector(selectIssueLoading);
  const user = useAppSelector(selectAuthUser);
  const isOwner = user?.userId === username;

  useEffect(() => {
    if (id) dispatch(getIssueThunk({ username: username!, reponame: reponame!, id }));
  }, [id]);

  const handleClose = async () => {
    if (!confirm('Close this issue?')) return;
    await dispatch(closeIssueThunk({ username: username!, reponame: reponame!, id: id! }));
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

  if (!issue) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
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
          <Link to={`/${username}/${reponame}/issues`} className="text-blue-400 hover:underline">
            Issues
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">#{issue.id.slice(-6)}</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6 w-full flex-1">
        {/* Issue Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                {issue.status === 'open' ? (
                  <CircleDot className="w-6 h-6 text-green-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                )}
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">{issue.title}</h1>
                <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs flex-wrap">
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
                    opened by <span className="text-gray-300">{issue.authorUsername}</span>
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
                onClick={handleClose}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg transition shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Close Issue
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main */}
          <div className="flex-1 space-y-4">
            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-sm font-semibold mb-3">Description</h3>
              {issue.description ? (
                <p className="text-gray-400 text-sm leading-relaxed">{issue.description}</p>
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
            {/* Priority */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-xs font-semibold mb-2">Author</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {issue.authorUsername?.[0]?.toUpperCase()}
                </div>
                <span className="text-gray-400 text-xs">{issue.authorUsername}</span>
              </div>
            </div>

            {/* Assignees */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-xs font-semibold mb-2">Assignees</h3>
              {issue.assignees.length === 0 ? (
                <p className="text-gray-600 text-xs">No assignees</p>
              ) : (
                issue.assignees.map((a) => (
                  <p key={a} className="text-gray-400 text-xs">
                    {a}
                  </p>
                ))
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
