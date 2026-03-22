import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  GitFork,
  Lock,
  Globe,
  Star,
  Clock,
  Filter,
  ChevronDown,
  BookOpen,
  Search,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { selectAuthUser } from 'src/features/auth/authSelectors';
import { listRepositoryThunk } from 'src/features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
  selectRepositoryMeta,
} from 'src/features/repository/repositorySelectors';
import { ROUTES } from 'src/constants/routes';
import AppHeader from 'src/types/common/Layout/AppHeader';
import AppFooter from 'src/types/common/Layout/AppFooter';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const repositories = useAppSelector(selectRepositories);
  const repoLoading = useAppSelector(selectRepositoryLoading);
  const meta = useAppSelector(selectRepositoryMeta);

  const [repoSearch, setRepoSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(listRepositoryThunk({}));
  }, []);

  const filteredRepos = repositories.filter((r) =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  const recentRepos = [...repositories]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    return 'today';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      {/* TABS */}
      <div className="border-b border-gray-800 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'repos', label: 'Repositories' },
              { id: 'activity', label: 'Activity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'repos') navigate(ROUTES.REPO_LIST);
                }}
                className={`px-4 py-3 text-sm transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-white border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 py-2">
            <Link
              to={ROUTES.REPO_CREATE}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> New Repository
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6 flex-1">
        {/* LEFT SIDEBAR */}
        <div className="w-72 shrink-0 space-y-4">
          {/* User card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{user?.username}</p>
                <p className="text-gray-500 text-xs">@{user?.userId}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-800 pt-3">
              <div>
                <p className="text-white text-sm font-bold">{meta.total}</p>
                <p className="text-gray-500 text-xs">Repos</p>
              </div>
              <div>
                <p className="text-white text-sm font-bold">0</p>
                <p className="text-gray-500 text-xs">Followers</p>
              </div>
              <div>
                <p className="text-white text-sm font-bold">0</p>
                <p className="text-gray-500 text-xs">Following</p>
              </div>
            </div>
          </div>

          {/* Top Repositories */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-semibold">Top Repositories</h3>
              <Link to={ROUTES.REPO_LIST} className="text-blue-400 text-xs hover:underline">
                View all
              </Link>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
              <input
                type="text"
                placeholder="Find a repository..."
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition"
              />
            </div>

            {repoLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 text-xs">No repositories yet</p>
                <Link
                  to={ROUTES.REPO_CREATE}
                  className="text-blue-400 text-xs hover:underline mt-1 block"
                >
                  Create your first repo
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredRepos.slice(0, 5).map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition group"
                    onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-xs font-medium truncate group-hover:text-white transition">
                        {repo.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {repo.visibility === 'private' ? (
                          <Lock className="w-2.5 h-2.5 text-gray-600" />
                        ) : (
                          <Globe className="w-2.5 h-2.5 text-gray-600" />
                        )}
                        <span className="text-gray-600 text-xs capitalize">{repo.visibility}</span>
                      </div>
                    </div>
                    <Star className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-500 transition shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Build Together */}
          <div className="bg-blue-600 rounded-xl p-4">
            <h3 className="text-white font-semibold text-sm mb-1">Build Together</h3>
            <p className="text-blue-100 text-xs leading-relaxed mb-3">
              Discover trending projects and contribute to open source.
            </p>
            <button className="bg-white hover:bg-gray-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-lg transition">
              Explore Projects
            </button>
          </div>
        </div>

        {/* MAIN — Recent Activity + Recent Repos */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Recent Repositories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">Recent Repositories</h2>
              <Link to={ROUTES.REPO_LIST} className="text-blue-400 text-xs hover:underline">
                View all
              </Link>
            </div>
            {repoLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentRepos.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">No repositories yet</p>
                <Link
                  to={ROUTES.REPO_CREATE}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition inline-block"
                >
                  Create your first repository
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 cursor-pointer transition"
                    onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-400 text-sm font-medium hover:underline">
                            {repo.name}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded border ${
                              repo.visibility === 'public'
                                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                : 'border-gray-600 text-gray-400 bg-gray-700'
                            }`}
                          >
                            {repo.visibility}
                          </span>
                        </div>
                        {repo.description && (
                          <p className="text-gray-500 text-xs truncate">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-gray-600 text-xs">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" /> {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" /> {repo.forks}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Updated {timeAgo(repo.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed — coming soon */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
              <button className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs px-3 py-1.5 rounded-lg">
                <Filter className="w-3 h-3" />
                All Activities
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <Clock className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Activity feed coming soon</p>
              <p className="text-gray-600 text-xs mt-1">
                Push commits, open PRs, and follow users to see activity here
              </p>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default HomePage;
