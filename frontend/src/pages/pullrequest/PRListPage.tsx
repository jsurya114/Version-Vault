import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { GitMerge, GitPullRequest, X, Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { listPRThunk } from '../../features/pullrequest/prThunk';
import { selectPRs, selectPRLoading, selectPRMeta } from '../../features/pullrequest/prSelector';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { PRStatus } from '../../types/pullrequest/pullrequest.types';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';

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

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface PRItemProps {
  pr: {
    id: string;
    title: string;
    status: PRStatus;
    createdAt?: string;
    authorUsername: string;
    sourceBranch: string;
    targetBranch: string;
  };
  onNavigate: (id: string) => void;
}

const PRItem = React.memo(({ pr, onNavigate }: PRItemProps) => (
  <div
    className="flex items-start gap-2 xs:gap-3 sm:gap-4 px-3 xs:px-4 py-3 xs:py-4 hover:bg-gray-800/30 cursor-pointer transition border-b border-gray-800/50 last:border-b-0"
    onClick={() => onNavigate(pr.id)}
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
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 mt-1 text-gray-500 text-[10px] xs:text-xs">
        <span>#{pr.id.slice(-6)}</span>
        <span>opened {formatDate(pr.createdAt)}</span>
        <span>by {pr.authorUsername}</span>
        <span className="flex items-center gap-1">
          {pr.sourceBranch} → {pr.targetBranch}
        </span>
      </div>
    </div>
    <span className={`text-xs px-2 py-0.5 rounded border capitalize ${statusColors[pr.status]}`}>
      {pr.status}
    </span>
  </div>
));

const PRListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const prs = useAppSelector(selectPRs);
  const isLoading = useAppSelector(selectPRLoading);
  const meta = useAppSelector(selectPRMeta);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const limit = 5;

  const fetchParams = useMemo(
    () => ({
      username: username!,
      reponame: reponame!,
      page,
      limit,
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : (statusFilter as 'open' | 'closed' | 'merged'),
    }),
    [username, reponame, page, statusFilter, search],
  );

  const location = useLocation();
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });

  useEffect(() => {
    if (location.state?.showSonar) {
      setSuccessSonar({
        isOpen: true,
        title: location.state.sonarTitle || '',
        subtitle: location.state.sonarSubtitle || '',
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (username && reponame) {
          dispatch(listPRThunk(fetchParams));
        }
      },
      search ? 500 : 0,
    );

    return () => clearTimeout(timer);
  }, [dispatch, fetchParams, search]);

  const handleNavigate = useCallback(
    (id: string) => {
      navigate(`/${username}/${reponame}/pulls/${id}`);
    },
    [navigate, username, reponame],
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
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
          <span className="text-white font-semibold">Pull Requests</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 gap-3">
          <h1 className="text-white font-semibold">Pull Requests</h1>
          <Link
            to={`/${username}/${reponame}/pulls/new`}
            className="flex items-center gap-1.5 xs:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs xs:text-sm px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" /> New Pull Request
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 mb-4">
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
                className={`px-3 py-1 text-xs rounded-md transition capitalize ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
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
                {statusFilter === 'all' && !search
                  ? 'Create your first pull request'
                  : 'Create new pull request'}
              </Link>
            </div>
          ) : (
            prs.map((pr) => <PRItem key={pr.id} pr={pr} onNavigate={handleNavigate} />)
          )}
        </div>

        {/* Pagination */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex flex-col xs:flex-row items-center justify-between mt-4 gap-2">
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

export default PRListPage;
