import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CircleDot, CheckCircle, Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { listIssuesThunk } from 'src/features/issues/issueThunk';
import {
  selectIssueLoading,
  selectIssues,
  selectIssueMeta,
} from 'src/features/issues/issueSelector';
import AppHeader from 'src/types/common/Layout/AppHeader';
import AppFooter from 'src/types/common/Layout/AppFooter';
import { ROUTES } from 'src/constants/routes';
import { IssuePriority } from 'src/types/issues/issues.types';

const priorityColors: Record<IssuePriority, string> = {
  low: 'text-gray-400 bg-gray-700 border-gray-600',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const IssueListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const issues = useAppSelector(selectIssues);
  const isLoading = useAppSelector(selectIssueLoading);
  const meta = useAppSelector(selectIssueMeta);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 2;

  useEffect(() => {
    if (username && reponame) {
      dispatch(
        listIssuesThunk({
          username,
          reponame,
          page,
          limit,
          search: search || undefined,
          status: statusFilter === 'all' ? undefined : (statusFilter as any),
        }),
      );
    }
  }, [username, reponame, page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      dispatch(
        listIssuesThunk({
          username: username!,
          reponame: reponame!,
          page: 1,
          limit,
          search: search || undefined,
          status: statusFilter === 'all' ? undefined : (statusFilter as any),
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
          <span className="text-white font-semibold">Issues</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-6 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-semibold">Issues</h1>
          <Link
            to={`/${username}/${reponame}/issues/new`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" /> New Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 flex-1">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-gray-300 text-sm focus:outline-none flex-1 placeholder-gray-600"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
            {['all', 'open', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs rounded-md transition capitalize ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Issue List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : issues.length === 0 ? (
            <div className="py-16 text-center">
              <CircleDot className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {statusFilter === 'all' ? 'No issues found' : `No ${statusFilter} issues found`}
              </p>
              <Link
                to={`/${username}/${reponame}/issues/new`}
                className="text-blue-400 text-sm hover:underline mt-2 block"
              >
                {statusFilter === 'all' ? 'Create your first issue' : 'Create another issue'}
              </Link>
            </div>
          ) : (
            issues.map((issue, i) => (
              <div
                key={issue.id}
                className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-800/30 cursor-pointer transition ${
                  i !== issues.length - 1 ? 'border-b border-gray-800/50' : ''
                }`}
                onClick={() => navigate(`/${username}/${reponame}/issues/${issue.id}`)}
              >
                <div className="mt-0.5 shrink-0">
                  {issue.status === 'open' ? (
                    <CircleDot className="w-5 h-5 text-green-400" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-sm font-medium hover:text-blue-400 transition">
                      {issue.title}
                    </p>
                    {issue.labels.map((label) => (
                      <span
                        key={label}
                        className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                    <span>#{issue.id.slice(-6)}</span>
                    <span>opened {formatDate(issue.createdAt)}</span>
                    <span>by {issue.authorUsername}</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded border capitalize shrink-0 ${priorityColors[issue.priority as IssuePriority]}`}
                >
                  {issue.priority}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-500 text-xs">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition"
              >
                Previous
              </button>
              <span className="text-gray-400 text-xs">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === meta.totalPages}
                className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default IssueListPage;
