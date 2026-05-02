import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { CircleDot, CheckCircle, Plus, Search, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { listIssuesThunk } from '../../features/issues/issueThunk';
import {
  selectIssueLoading,
  selectIssues,
  selectIssueMeta,
} from '../../features/issues/issueSelector';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { IssuePriority } from '../../types/issues/issues.types';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import { repositoryService } from '../../services/repository.service';
import { RepositoryResponseDTO } from '../../types/repository/repositoryTypes';

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

interface IssueItemProps {
  issue: {
    id: string;
    status: string;
    title: string;
    labels: string[];
    createdAt?: string;
    authorUsername: string;
    priority: string;
  };
  onNavigate: (id: string) => void;
}

const IssueItem = React.memo(({ issue, onNavigate }: IssueItemProps) => (
  <div
    className="flex items-start gap-2 xs:gap-3 sm:gap-4 px-3 xs:px-4 py-3 xs:py-4 hover:bg-gray-800/30 cursor-pointer transition border-b border-gray-800/50 last:border-b-0"
    onClick={() => onNavigate(issue.id)}
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
        {issue.labels.map((label: string) => (
          <span
            key={label}
            className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3 mt-1 text-gray-500 text-[10px] xs:text-xs">
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
));

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
  const limit = 5;

  // Repositories state for selector
  const [repos, setRepos] = useState<RepositoryResponseDTO[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const repoDropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredRepos = useMemo(() => {
    return repos.filter((r) => r.name.toLowerCase().includes(repoSearch.toLowerCase()));
  }, [repos, repoSearch]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await repositoryService.listRepositories({ limit: 100 });
        setRepos(response.data);
      } catch (err) {
        console.error('Failed to fetch repositories', err);
      }
    };
    fetchRepos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (repoDropdownRef.current && !repoDropdownRef.current.contains(e.target as Node)) {
        setShowRepoDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchParams = useMemo(
    () => ({
      username: username!,
      reponame: reponame!,
      page,
      limit,
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : (statusFilter as 'open' | 'closed'),
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
          dispatch(listIssuesThunk(fetchParams));
        }
      },
      search ? 500 : 0,
    );

    return () => clearTimeout(timer);
  }, [dispatch, fetchParams, search]);

  const handleNavigate = useCallback(
    (id: string) => {
      navigate(`/${username}/${reponame}/issues/${id}`);
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
          <span className="text-white font-semibold">Issues</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-white font-semibold">Issues</h1>

            {/* Repository Selection */}
            <div ref={repoDropdownRef} className="relative z-10">
              <button
                onClick={() => setShowRepoDropdown((prev) => !prev)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 transition"
              >
                <span className="truncate max-w-[150px] xs:max-w-[200px]">
                  {username}/{reponame}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showRepoDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showRepoDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20">
                  <div className="p-2 border-b border-gray-700">
                    <input
                      type="text"
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Find a repository..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredRepos.length > 0 ? (
                      filteredRepos.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setShowRepoDropdown(false);
                            setRepoSearch('');
                            navigate(`/${r.ownerUsername}/${r.name}/issues`);
                          }}
                          className={`w-full flex flex-col gap-0.5 px-3 py-2 text-left hover:bg-gray-700/50 transition ${
                            r.name === reponame && r.ownerUsername === username
                              ? 'bg-blue-600/10 border-l-2 border-blue-500'
                              : ''
                          }`}
                        >
                          <span className="text-sm text-gray-100 font-medium">{r.name}</span>
                          <span className="text-[10px] text-gray-500">{r.ownerUsername}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4 italic">
                        No matching repositories
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`/${username}/${reponame}/issues/new`}
            className="flex items-center gap-1.5 xs:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs xs:text-sm px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg transition whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" /> New Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 mb-4">
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
            issues.map((issue) => (
              <IssueItem key={issue.id} issue={issue} onNavigate={handleNavigate} />
            ))
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

export default IssueListPage;
