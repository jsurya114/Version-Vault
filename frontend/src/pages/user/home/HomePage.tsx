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
import { getActivityFeedThunk } from '../../../features/activity/activityThunk';
import {
  selectActivityFeed,
  selectActivityLoading,
} from '../../../features/activity/activitySelector';
import { ActivityFeedItem } from '../../../components/ActivityFeedItem';

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

  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const feed = useAppSelector(selectActivityFeed);
  const {
    currentPage,
    totalPages,
    isLoading: feedLoading,
  } = useAppSelector((state) => (state as any).activity);

  useEffect(() => {
    dispatch(getActivityFeedThunk({ page: 1, sort: sortOrder }));
  }, [dispatch, sortOrder]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      dispatch(getActivityFeedThunk({ page: currentPage + 1, sort: sortOrder }));
    }
  };

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
      <div className="lg:hidden flex items-center px-3 xs:px-4 pt-3 xs:pt-4 pb-2">
        <button
          id="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-gray-400 hover:text-white bg-gray-900 border border-gray-800 px-2.5 xs:px-3 py-1.5 rounded-md transition"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {sidebarOpen ? 'Close' : 'Repositories'}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1440px] 3xl:max-w-[1800px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8 flex flex-col lg:flex-row gap-4 sm:gap-6 xl:gap-8 3xl:gap-10 w-full flex-1 items-start relative">
        {/* LEFT SIDEBAR — overlay on mobile, static on lg+ */}
        <div
          id="home-sidebar"
          className={`
            ${sidebarOpen ? 'flex' : 'hidden'} lg:flex
            flex-col
            w-[calc(100%-2rem)] xs:w-72 md:w-64 lg:w-56 xl:w-64 2xl:w-72 3xl:w-80 shrink-0 space-y-4
            lg:static
            fixed top-[120px] xs:top-[130px] left-3 xs:left-4 z-40
            bg-gray-950 lg:bg-transparent
            border border-gray-800 lg:border-none
            rounded-xl lg:rounded-none
            p-3 xs:p-4 lg:p-0
            shadow-2xl lg:shadow-none
            max-h-[calc(100vh-140px)] xs:max-h-[calc(100vh-160px)] overflow-y-auto lg:overflow-visible lg:max-h-none
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

        {/* Mobile sidebar backdrop overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MIDDLE COLUMN */}
        <div className="flex-1 min-w-0 space-y-4 xs:space-y-5 sm:space-y-6 w-full max-w-full lg:max-w-3xl 3xl:max-w-4xl">
          <h1 className="text-lg xs:text-xl sm:text-2xl 3xl:text-3xl font-semibold text-white">
            Home
          </h1>

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
          <div className="flex items-center justify-between mt-4 xs:mt-6 sm:mt-8 mb-2">
            <h2 className="text-white text-sm font-bold">Feed</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase font-bold hidden xs:inline">
                Sort By:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-md text-[10px] xs:text-xs text-gray-300 px-2 py-1 outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Feed Items */}
          <div className="space-y-3 xs:space-y-4">
            {feedLoading && currentPage === 1 ? (
              <div className="text-sm text-gray-500 py-4">Loading fresh activity...</div>
            ) : feed.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                No Activity Founds!
              </div>
            ) : (
              <>
                {feed.map((activity, index) => (
                  <ActivityFeedItem
                    key={activity.id || (activity as any)._id || index}
                    activity={activity}
                  />
                ))}

                {!feedLoading && currentPage < totalPages && (
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-3 mt-2 text-xs font-bold text-blue-400 bg-gray-900/50 border border-gray-800 rounded-xl hover:bg-gray-900 hover:text-blue-300 transition-all shadow-sm"
                  >
                    See more activity
                  </button>
                )}

                {feedLoading && currentPage > 1 && (
                  <div className="text-center py-4 text-xs text-gray-500 italic">
                    Fetching more activities...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR — hidden on small screens, shown on xl+ */}
        <div className="hidden xl:block w-72 2xl:w-80 3xl:w-96 shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 2xl:p-5 3xl:p-6 shadow-sm">
            <h3 className="text-sm 3xl:text-base font-semibold text-white mb-4 2xl:mb-6">
              Latest from our changelog
            </h3>

            <div className="relative border-l border-gray-700 ml-[5px] space-y-5 2xl:space-y-7 pb-2">
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
