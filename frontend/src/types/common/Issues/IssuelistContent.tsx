import { useEffect, useState } from 'react';
import { CircleDot, CheckCircle, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { listIssuesThunk } from '../../../features/issues/issueThunk';
import { selectIssueLoading, selectIssues } from '../../../features/issues/issueSelector';
import { IssuePriority } from '../../../types/issues/issues.types';

const priorityColors: Record<IssuePriority, string> = {
  low: 'text-gray-400 bg-gray-700 border-gray-600',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const IssueListContent = ({
  username,
  reponame,
  isOwner,
}: {
  username: string;
  reponame: string;
  isOwner: boolean;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const issues = useAppSelector(selectIssues);
  const isLoading = useAppSelector(selectIssueLoading);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 10;

  useEffect(() => {
    dispatch(
      listIssuesThunk({
        username,
        reponame,
        page,
        limit,
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'open' | 'closed'),
      }),
    );
  }, [username, reponame, page, statusFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 w-full flex-1">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-semibold flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-gray-400" /> Issues
        </h1>
        <Link
          to={isOwner ? `/${username}/${reponame}/issues/new` : '#'}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition ${
            !isOwner
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed pointer-events-none opacity-50 border border-gray-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Plus className="w-4 h-4" /> New Issue
        </Link>
      </div>

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
              className={`px-3 py-1 text-xs rounded-md transition capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

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
              to={isOwner ? `/${username}/${reponame}/issues/new` : '#'}
              className={`text-sm mt-2 block ${!isOwner ? 'text-gray-600 cursor-not-allowed pointer-events-none' : 'text-blue-400 hover:underline'}`}
            >
              {statusFilter === 'all' ? 'Create your first issue' : 'Create another issue'}
            </Link>
          </div>
        ) : (
          issues.map((issue, i) => (
            <div
              key={issue.id}
              className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-800/30 cursor-pointer transition ${i !== issues.length - 1 ? 'border-b border-gray-800/50' : ''}`}
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
    </div>
  );
};

export default IssueListContent;
