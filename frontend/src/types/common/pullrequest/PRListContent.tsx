import { useEffect, useState } from 'react';
import { GitPullRequest, GitMerge, X, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { listPRThunk } from '../../../features/pullrequest/prThunk';
import { selectPRs, selectPRLoading, selectPRMeta } from '../../../features/pullrequest/prSelector';
import { PRStatus } from '../../../types/pullrequest/pullrequest.types';

const statusColors: Record<PRStatus, string> = {
  open: 'text-green-400 bg-green-500/10 border-green-500/30',
  closed: 'text-red-400 bg-red-500/10 border-red-500/30',
  merged: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
};

const statusIcons: Record<PRStatus, JSX.Element> = {
  open: <GitPullRequest className="w-3.5 h-3.5" />,
  closed: <X className="w-3.5 h-3.5" />,
  merged: <GitMerge className="w-3.5 h-3.5" />,
};

const PRListContent = ({ username, reponame }: { username: string; reponame: string }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const prs = useAppSelector(selectPRs);
  const isLoading = useAppSelector(selectPRLoading);
  const meta = useAppSelector(selectPRMeta);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 10;

  useEffect(() => {
    dispatch(
      listPRThunk({
        username,
        reponame,
        page,
        limit,
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter as any),
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
    <div className="max-w-5xl mx-auto px-6 py-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-semibold flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-gray-400" /> Pull Requests
        </h1>
        <Link
          to={`/${username}/${reponame}/pulls/new`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> New Pull Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 flex-1">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search pull requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-gray-300 text-sm focus:outline-none flex-1 placeholder-gray-600"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
          {['all', 'open', 'closed', 'merged'].map((s) => (
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

      {/* PR List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : prs.length === 0 ? (
          <div className="py-16 text-center">
            <GitPullRequest className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No pull requests found</p>
            <Link
              to={`/${username}/${reponame}/pulls/new`}
              className="text-blue-400 text-sm hover:underline mt-2 block"
            >
              Create your first pull request
            </Link>
          </div>
        ) : (
          prs.map((pr, i) => (
            <div
              key={pr.id}
              className={`flex items-start gap-4 px-4 py-4 hover:bg-gray-800/30 cursor-pointer transition ${i !== prs.length - 1 ? 'border-b border-gray-800/50' : ''}`}
              onClick={() => navigate(`/${username}/${reponame}/pulls/${pr.id}`)}
            >
              <div
                className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-full border ${statusColors[pr.status]}`}
              >
                {statusIcons[pr.status]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium hover:text-blue-400 transition truncate">
                  {pr.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
                  <span>#{pr.id.slice(-6)}</span>
                  <span>opened {formatDate(pr.createdAt)}</span>
                  <span>by {pr.authorUsername}</span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded border capitalize ${statusColors[pr.status]}`}
              >
                {pr.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PRListContent;
