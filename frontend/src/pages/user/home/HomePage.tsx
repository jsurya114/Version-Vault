import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Star,
  Filter,
  ChevronDown,
  BookOpen,
  MoreHorizontal,
  GitMerge,
  Smile,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectAuthUser } from '../../../features/auth/authSelectors';
import { listRepositoryThunk } from '../../../features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
} from '../../../features/repository/repositorySelectors';
import { listChatRepoThunk } from '../../../features/chats/chatThunk';
import { selectChatConversations } from '../../../features/chats/chatSelector';
import { ROUTES } from '../../../constants/routes';
import AppHeader from '../../../types/common/Layout/AppHeader';
import AppFooter from '../../../types/common/Layout/AppFooter';
import { SuccessSonar } from '../../../types/common/Layout/SuccessSonar';

const SideRepoLink = React.memo(({ repo }: { repo: { ownerUsername: string; name: string } }) => (
  <Link
    to={`/${repo.ownerUsername}/${repo.name}`}
    className="flex items-center gap-2 hover:underline text-sm font-medium text-gray-300"
  >
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] shrink-0 font-bold">
      {repo.ownerUsername?.[0]?.toUpperCase()}
    </div>
    <span className="truncate">{repo.name}</span>
  </Link>
));

const HomePage = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector(selectAuthUser);
  const repositories = useAppSelector(selectRepositories);
  const repoLoading = useAppSelector(selectRepositoryLoading);
  const collabRepos = useAppSelector(selectChatConversations);

  const [repoSearch, setRepoSearch] = useState('');
  const [collabSearch, setCollabSearch] = useState('');
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (location.state?.showLoginSuccess && user) {
      setSuccessSonar({
        isOpen: true,
        title: 'Login Successful',
        subtitle: `Welcome back, ${user.username || 'User'}!`,
      });
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, user]);

  useEffect(() => {
    dispatch(listRepositoryThunk({}));
    dispatch(listChatRepoThunk());
  }, [dispatch]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('home-sidebar');
      const toggleBtn = document.getElementById('sidebar-toggle');
      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        toggleBtn &&
        !toggleBtn.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const collabRepoIds = useMemo(() => {
    if (!collabRepos || !user) return new Set<string>();
    return new Set(collabRepos.filter((r) => r.ownerUsername !== user.userId).map((r) => r.id));
  }, [collabRepos, user]);

  const filteredRepos = useMemo(() => {
    return repositories
      .filter((r) => !collabRepoIds.has(r.id))
      .filter((r) => r.name.toLowerCase().includes(repoSearch.toLowerCase()));
  }, [repositories, repoSearch, collabRepoIds]);

  const topRepos = useMemo(() => filteredRepos.slice(0, 7), [filteredRepos]);

  const filteredCollabRepos = useMemo(() => {
    if (!collabRepos || !user) return [];
    return collabRepos
      .filter((r) => r.ownerUsername !== user.userId)
      .filter((r) => r.name.toLowerCase().includes(collabSearch.toLowerCase()));
  }, [collabRepos, collabSearch, user]);

  const topCollabRepos = useMemo(() => filteredCollabRepos.slice(0, 7), [filteredCollabRepos]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col font-sans">
      <AppHeader />

      {/* Mobile sidebar toggle button */}
      <div className="lg:hidden flex items-center px-4 pt-4 pb-2">
        <button
          id="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-md transition"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {sidebarOpen ? 'Close' : 'Repositories'}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-8 flex gap-6 xl:gap-8 w-full flex-1 items-start relative">
        {/* LEFT SIDEBAR — overlay on mobile, static on lg+ */}
        <div
          id="home-sidebar"
          className={`
            ${sidebarOpen ? 'flex' : 'hidden'} lg:flex
            flex-col
            w-72 shrink-0 space-y-4
            lg:static
            fixed top-[130px] left-4 z-40
            bg-gray-950 lg:bg-transparent
            border border-gray-800 lg:border-none
            rounded-xl lg:rounded-none
            p-4 lg:p-0
            shadow-2xl lg:shadow-none
            max-h-[calc(100vh-160px)] overflow-y-auto lg:overflow-visible lg:max-h-none
          `}
        >
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-white text-sm font-semibold">Top repositories</h2>
            <Link
              to={ROUTES.REPO_CREATE}
              className="flex items-center gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition"
            >
              <BookOpen className="w-4 h-4" /> New
            </Link>
          </div>

          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Find a repository..."
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {repoLoading ? (
            <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3 mt-4">
              {topRepos.length === 0 ? (
                <div className="text-sm text-gray-500 mt-4">No repositories found</div>
              ) : (
                topRepos.map((repo) => <SideRepoLink key={repo.id} repo={repo} />)
              )}
              {filteredRepos.length > 7 && (
                <button className="text-xs text-gray-500 hover:text-blue-500 mt-2 block">
                  Show more
                </button>
              )}
            </div>
          )}

          {/* COLLABORATED REPOSITORIES */}
          {collabRepos && collabRepos.length > 0 && (
            <>
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <h2 className="text-white text-sm font-semibold">Collaborated</h2>
                </div>

                <div className="relative mt-2">
                  <input
                    type="text"
                    placeholder="Find a collab repo..."
                    value={collabSearch}
                    onChange={(e) => setCollabSearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-1.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-3 mt-4">
                  {topCollabRepos.length === 0 ? (
                    <div className="text-sm text-gray-500 mt-4">No collab repos found</div>
                  ) : (
                    topCollabRepos.map((repo) => <SideRepoLink key={repo.id} repo={repo} />)
                  )}
                  {filteredCollabRepos.length > 7 && (
                    <button className="text-xs text-gray-500 hover:text-blue-500 mt-2 block">
                      Show more
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* MIDDLE COLUMN */}
        <div className="flex-1 min-w-0 space-y-6 max-w-3xl">
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Home</h1>

          {/* Ask Anything Box (Temporarily Disabled) */}
          {/*
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 shadow-sm">
            <textarea 
              placeholder="Ask anything"
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm text-gray-300 placeholder-gray-500 h-14 outline-none"
            ></textarea>

            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
               <div className="flex items-center gap-2">
                 <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-700 transition">
                    <MessageSquare className="w-3.5 h-3.5" /> Ask <ChevronDown className="w-3 h-3 text-gray-500" />
                 </button>
                 <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-700 transition">
                    <BookOpen className="w-3.5 h-3.5" /> All repositories <ChevronDown className="w-3 h-3 text-gray-500" />
                 </button>
                 <button className="flex items-center justify-center w-8 h-8 text-gray-500 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 hover:text-gray-300 transition">
                    <Plus className="w-4 h-4" />
                 </button>
               </div>
               <div className="flex items-center gap-4">
                 <button className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 font-medium transition">
                   Claude Haiku 4.5 <ChevronDown className="w-3 h-3" />
                 </button>
                 <button className="text-gray-500 hover:text-gray-300 transition">
                   <Send className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
          */}

          {/* Action buttons (Temporarily Disabled) */}
          {/*
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition whitespace-nowrap shadow-sm">
              <Terminal className="w-4 h-4 text-gray-500" /> Agent
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition whitespace-nowrap shadow-sm">
              <CircleDot className="w-4 h-4 text-gray-500" /> Create issue
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition whitespace-nowrap shadow-sm">
              <FileCode className="w-4 h-4 text-gray-500" /> Write code <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition whitespace-nowrap shadow-sm">
              <GitFork className="w-4 h-4 text-gray-500" /> Git <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition whitespace-nowrap shadow-sm">
              <GitPullRequest className="w-4 h-4 text-gray-500" /> Pull requests <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          */}

          {/* Feed Header */}
          <div className="flex items-center justify-between mt-8 mb-2">
            <h2 className="text-white text-sm font-bold">Feed</h2>
            <button className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-semibold text-gray-300 hover:bg-gray-700 transition shadow-sm">
              <Filter className="w-3 h-3 text-gray-500" /> Filter
            </button>
          </div>

          {/* Feed Items */}
          <div className="space-y-4">
            {/* Feed Item 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                    {/* Skeleton graphic of an avatar */}
                    <span className="text-white text-xs font-bold font-mono">F</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400 flex flex-wrap gap-1">
                      <span className="font-semibold text-gray-200 hover:text-blue-400 cursor-pointer">
                        FizanMuhammedFaisal
                      </span>{' '}
                      <span>made this repository public</span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 hover:text-blue-400 cursor-pointer">
                      yesterday
                    </p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-300 transition shrink-0 ml-2">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 sm:p-4 ml-0 sm:ml-10">
                <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] shrink-0 font-bold border border-gray-700">
                      F
                    </div>
                    <Link
                      to="#"
                      className="font-semibold text-gray-300 hover:text-blue-400 text-sm truncate"
                    >
                      FizanMuhammedFaisal/pixelmeet-backend
                    </Link>
                  </div>
                  <div className="flex items-center divide-x divide-gray-700 rounded-md border border-gray-700 bg-gray-800 shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-700 transition h-7">
                      <Star className="w-3.5 h-3.5 text-gray-400" /> Star
                    </button>
                    <button className="px-2 h-7 flex items-center hover:bg-gray-700">
                      <ChevronDown className="w-3 h-3 text-gray-300" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500 border border-gray-700"></span>{' '}
                    TypeScript
                  </span>
                  <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                    <Star className="w-3.5 h-3.5 text-gray-500" /> 1
                  </span>
                </div>
              </div>
            </div>

            {/* Feed Item 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 border border-gray-700">
                    <span className="text-white text-xs font-bold font-mono">N</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400 flex flex-wrap gap-1">
                      <span className="font-semibold text-gray-200 hover:text-blue-400 cursor-pointer">
                        Nandakumar-S-1
                      </span>{' '}
                      <span>contributed to</span>{' '}
                      <span className="font-semibold text-gray-200 hover:text-blue-400 cursor-pointer">
                        Nandakumar-S-1/Nandakumar-S-1
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 hover:text-blue-400 cursor-pointer">
                      2 days ago
                    </p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-300 transition shrink-0 ml-2">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="ml-0 sm:ml-10">
                <h3 className="text-base font-semibold text-gray-300 mb-3 hover:text-blue-400 cursor-pointer">
                  merging changes to main{' '}
                  <span className="text-gray-500 font-normal font-mono text-sm ml-1 hover:text-blue-400">
                    #2
                  </span>
                </h3>

                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-purple-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    <GitMerge className="w-3.5 h-3.5" /> Merged
                  </span>
                  <span className="text-sm text-gray-400 hover:text-blue-400 cursor-pointer">
                    Nandakumar-S-1 merged 35 commits
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition shadow-sm">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Trending repositories */}
            <div className="pt-2">
              <button className="text-sm text-blue-400 hover:underline font-medium w-full text-center py-2">
                See more
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR — hidden on small screens, shown on xl+ */}
        <div className="hidden xl:block w-80 shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-6">Latest from our changelog</h3>

            <div className="relative border-l border-gray-700 ml-[5px] space-y-7 pb-2">
              <div className="relative pl-5">
                <div className="absolute w-[9px] h-[9px] bg-gray-500 rounded-full -left-[5px] top-1.5 border-2 border-gray-900"></div>
                <p className="text-[11px] font-medium text-gray-500 mb-1">12 hours ago</p>
                <a
                  href="#"
                  className="text-sm text-gray-300 hover:text-blue-400 font-medium leading-[1.3] block"
                >
                  Ask @copilot to make changes to any pull request
                </a>
              </div>

              <div className="relative pl-5">
                <div className="absolute w-[9px] h-[9px] bg-gray-500 rounded-full -left-[5px] top-1.5 border-2 border-gray-900"></div>
                <p className="text-[11px] font-medium text-gray-500 mb-1">12 hours ago</p>
                <a
                  href="#"
                  className="text-sm text-gray-300 hover:text-blue-400 font-medium leading-[1.3] block"
                >
                  Manage Copilot coding agent repository access via the API
                </a>
              </div>

              <div className="relative pl-5">
                <div className="absolute w-[9px] h-[9px] bg-gray-500 rounded-full -left-[5px] top-1.5 border-2 border-gray-900"></div>
                <p className="text-[11px] font-medium text-gray-500 mb-1">19 hours ago</p>
                <a
                  href="#"
                  className="text-sm text-gray-300 hover:text-blue-400 font-medium leading-[1.3] block"
                >
                  Faster incremental analysis with CodeQL in pull requests
                </a>
              </div>

              <div className="relative pl-5">
                <div className="absolute w-[9px] h-[9px] bg-gray-500 rounded-full -left-[5px] top-1.5 border-2 border-gray-900"></div>
                <p className="text-[11px] font-medium text-gray-500 mb-1">Yesterday</p>
                <a
                  href="#"
                  className="text-sm text-gray-300 hover:text-blue-400 font-medium leading-[1.3] block"
                >
                  Gemini 3.1 Pro is now available in JetBrains IDEs,...
                </a>
              </div>
            </div>

            <a
              href="#"
              className="text-xs text-gray-400 hover:text-blue-400 mt-5 inline-flex items-center gap-1 group transition"
            >
              View changelog{' '}
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>
        </div>
      </div>

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

export default HomePage;
