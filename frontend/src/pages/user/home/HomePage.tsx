import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  GitBranch,
  Lock,
  Globe,
  Star,
  GitFork,
  Clock,
  Filter,
  ChevronDown,
  LogOut,
  BookOpen,
  Users,
  Zap,
  Settings,
  Home,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { selectAuthUser } from 'src/features/auth/authSelectors';
import { logoutThunk } from 'src/features/auth/authThunks';
import { listRepositoryThunk } from 'src/features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
} from 'src/features/repository/repositorySelectors';
import { ROUTES } from 'src/constants/routes';

const mockActivity = [
  {
    avatar: 'A',
    avatarColor: 'bg-purple-500',
    user: 'alex_dev',
    action: 'merged a pull request into',
    branch: 'main',
    repo: '',
    title: 'feat: add dark mode support to core components',
    desc: 'This PR adds the necessary tailored configuration and theme provider to support light/dark mode switching...',
    tags: ['#402', 'continuevenario'],
    time: '2h ago',
  },
  {
    avatar: 'S',
    avatarColor: 'bg-green-500',
    user: 'sarah_codes',
    action: 'pushed 3 commits to',
    branch: 'analytics-engine',
    repo: '',
    commits: [
      { hash: '3a91f2c', msg: 'fix: memory leak in stream processing unit' },
      { hash: '34615d1', msg: 'refactor: update rust dependencies' },
      { hash: '20c117e', msg: 'docs: update readme with setup instructions' },
    ],
    time: '5h ago',
  },
  {
    avatar: 'M',
    avatarColor: 'bg-blue-500',
    user: 'mark_jenkins',
    action: 'commented on',
    branch: 'Issue #104',
    repo: 'versionvault-docs',
    comment:
      "I think we should emphasize the API documentation in the getting started guide. It's currently buried under the deployment section.",
    time: 'Yesterday',
  },
];

const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const repositories = useAppSelector(selectRepositories);
  const repoLoading = useAppSelector(selectRepositoryLoading);

  const [repoSearch, setRepoSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('All Activities');

  useEffect(() => {
    dispatch(listRepositoryThunk({}));
  }, []);

  const filteredRepos = repositories.filter((r) =>
    r.name.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-50">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.LANDING} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">VersionVault</span>
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search or jump to..."
              className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-12 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-64 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs border border-gray-700 rounded px-1">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            {['Pull Requests', 'Issues', 'ChatRoom'].map((item) => (
              <span
                key={item}
                className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 cursor-pointer transition"
              >
                {item}
              </span>
            ))}
          </div>
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
          <div className="relative group">
            <button className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </button>
            <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-white text-sm font-medium">{user?.username}</p>
                <p className="text-gray-500 text-xs">{user?.userId}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 text-sm transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* TABS */}
      <div className="border-b border-gray-800 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            {['history', 'grade', 'diversity'].map((tab, i) => (
              <button
                key={tab}
                className={`px-4 py-3 text-sm transition border-b-2 ${
                  i === 0
                    ? 'text-white border-blue-500'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 py-2">
            <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-4 py-1.5 rounded-lg transition">
              <GitFork className="w-3.5 h-3.5" /> upload
            </button>
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
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-72 shrink-0 space-y-4">
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

          {/* Build Together Card */}
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

        {/* ACTIVITY FEED */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Activity</h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">Filter by:</span>
              <button className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs px-3 py-1.5 rounded-lg">
                <Filter className="w-3 h-3" />
                {activityFilter}
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {mockActivity.map((item, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${item.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm">
                        <span className="text-white font-medium">{item.user}</span>
                        <span className="text-gray-400"> {item.action} </span>
                        <span className="text-blue-400 font-medium">{item.branch}</span>
                        {item.repo && (
                          <>
                            <span className="text-gray-400"> in </span>
                            <span className="text-blue-400 font-medium">{item.repo}</span>
                          </>
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-gray-600 text-xs shrink-0 ml-2">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </div>
                    </div>

                    {'title' in item && (
                      <div className="bg-gray-800 rounded-lg p-3 mb-2">
                        <p className="text-white text-sm font-medium mb-1">{item.title}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                        {'tags' in item && (
                          <div className="flex items-center gap-2 mt-2">
                            {item.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {'commits' in item && (
                      <div className="bg-gray-800 rounded-lg p-3 space-y-1.5">
                        {item.commits?.map((c) => (
                          <div key={c.hash} className="flex items-center gap-2">
                            <span className="text-blue-400 text-xs font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">
                              {c.hash}
                            </span>
                            <span className="text-gray-400 text-xs truncate">{c.msg}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {'comment' in item && (
                      <div className="bg-gray-800 border-l-2 border-blue-500 rounded-r-lg px-3 py-2">
                        <p className="text-gray-300 text-xs leading-relaxed italic">
                          "{item.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-3 text-gray-500 hover:text-gray-300 text-sm border border-gray-800 hover:border-gray-700 rounded-xl transition">
              Load more activity...
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 mt-10 py-5 px-6">
        <p className="text-center text-gray-700 text-xs">© 2026 VersionVault, Inc.</p>
      </footer>
    </div>
  );
};

export default HomePage;
