import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitFork, BookOpen, Users, Calendar, Edit2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  getFollowersThunk,
  getFollowingThunk,
  followThunk,
  unfollowThunk,
} from '../../../features/follow/followThunk';
import {
  selectFollowers,
  selectFollowing,
  selectFollowLoading,
} from '../../../features/follow/followSelectors';
import { selectAuthUser } from '../../../features/auth/authSelectors';
import {
  listRepositoryThunk,
  getCommitsThunk,
  getStarredUsersThunk,
} from '../../../features/repository/repositoryThunks';
import { getAllCollabsReposThunk } from '../../../features/collaborator/invitationThunk';
import {
  selectRepositories,
  selectRepositoryLoading,
} from '../../../features/repository/repositorySelectors';
import { getProfileThunk } from 'src/features/user/userThunk';
import { clearViewedUser } from 'src/features/user/userSlice';
import { selectViewedUser, selectUserLoading } from 'src/features/user/userSelector';
import AppHeader from '../../../types/common/Layout/AppHeader';
import AppFooter from '../../../types/common/Layout/AppFooter';
import ProfileTabs from '../../../types/common/Profile/ProfileTabs';
import PinnedRepoCard from '../../../types/common/Profile/PinnedRepoCard';
import ActivityTimeline, {
  ActivityItemProps,
} from '../../../types/common/Profile/ActivityTimeline';
import { selectCollabRepos } from 'src/features/collaborator/invitationSelectors';
import { EditProfileModal } from '../components/EditProfileModal';
import { getMeThunk } from '../../../features/auth/authThunks';
import { UserResponseDTO } from '../../../types/admin/adminTypes';
import { GitCommit, RepositoryResponseDTO } from 'src/types/repository/repositoryTypes';
import ContributionGraph from '../../../types/common/Profile/ContributionGraph';
import { FollowListModal } from '../components/FollowListModal';
import { StarButton } from '../../repository/components/StarButton'; // Fixed Import Path
import { StarListModal } from '../components/StarListModal';

interface ActivityGroup {
  month: string;
  items: ActivityItemProps[];
}

const formatDateJoined = (dateString?: string | Date) => {
  if (!dateString) return 'Member since recently';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const RepoItem = React.memo(
  ({
    repo,
    onClick,
    isCollab,
    authUserId,
    onStarCountClick,
  }: {
    repo: RepositoryResponseDTO; // Updated to use the full DTO
    onClick: () => void;
    isCollab?: boolean;
    authUserId?: string;
    onStarCountClick: () => void;
  }) => (
    <div
      className="bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/60 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300 group shadow-md"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            <span className="text-blue-400 text-sm sm:text-base font-bold group-hover:text-blue-300 group-hover:underline decoration-2 underline-offset-4 break-all">
              {isCollab ? `${repo.ownerUsername}/${repo.name}` : repo.name}
            </span>
            <span
              className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                repo.visibility === 'public'
                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                  : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
              }`}
            >
              {repo.visibility}
            </span>
            {isCollab && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold border border-purple-500/30 text-purple-400 bg-purple-500/10 shrink-0">
                collaborator
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-gray-400 text-sm mb-3 leading-relaxed max-w-2xl">
              {repo.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6 text-gray-500 text-xs font-semibold flex-wrap">
              {/* Dynamic Star Button */}
              <div onClick={(e) => e.stopPropagation()}>
                <StarButton
                  username={repo.ownerUsername}
                  reponame={repo.name}
                  initialStars={repo.stars || 0}
                  initialStarredBy={repo.starredBy || []}
                  isOwner={authUserId === repo.ownerId}
                  onCountClick={onStarCountClick}
                />
              </div>

              <span className="flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                <GitFork className="w-3.5 h-3.5" />
                {repo.forks}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]" />
                {repo.language || 'JavaScript'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
);

const UserProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userId } = useParams(); // URL handle

  // State for different user contexts
  const authUser = useAppSelector(selectAuthUser);
  const viewedUser = useAppSelector(selectViewedUser);
  const userLoading = useAppSelector(selectUserLoading);

  const followers = useAppSelector(selectFollowers);
  const following = useAppSelector(selectFollowing);
  const followLoading = useAppSelector(selectFollowLoading);
  const repositories = useAppSelector(selectRepositories);
  const repoLoading = useAppSelector(selectRepositoryLoading);
  const [starModal, setStarModal] = useState({ isOpen: false, data: [] as UserResponseDTO[] });
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [userActivities, setUserActivities] = useState<ActivityGroup[]>([]);
  const [dailyStats, setDailyStats] = useState<{ [key: string]: number }>({});
  const [totalYearlyContributions, setTotalYearlyContributions] = useState(0);
  const collabRepos = useAppSelector(selectCollabRepos);

  const [followModal, setFollowModal] = useState<{
    isOpen: boolean;
    type: 'Followers' | 'Following';
  }>({
    isOpen: false,
    type: 'Followers',
  });

  // Derived State: Are we looking at our OWN profile?
  const isOwnProfile = authUser?.userId === userId;
  const displayUser = (isOwnProfile ? authUser : viewedUser) as UserResponseDTO | null;
  const isFollowing = followers.some((f) => f.followerId === authUser?.id);
  const visibleRepositories = isOwnProfile
    ? repositories
    : repositories.filter((repo) => repo.visibility === 'public');

  // Initial Data Fetching
  useEffect(() => {
    if (userId) {
      setDailyStats({});
      setUserActivities([]);
      setTotalYearlyContributions(0);
      // 1. Fetch public profile of the handle in the URL
      dispatch(getProfileThunk(userId));
      dispatch(getFollowersThunk(userId));
      dispatch(getFollowingThunk(userId));
      if (isOwnProfile) {
        dispatch(getAllCollabsReposThunk());
      }
    }
    return () => {
      // Cleanup: clear the viewedUser state when leaving the page
      dispatch(clearViewedUser());

      setDailyStats({});
      setUserActivities([]);
      setTotalYearlyContributions(0);
    };
  }, [userId]);

  // Fetch repositories only when we have the database ID of the user we are viewing
  useEffect(() => {
    if (displayUser?.id) {
      dispatch(listRepositoryThunk({ userId: displayUser.id }));
    }
  }, [displayUser?.id]);

  const allProfileRepos = useMemo(() => {
    if (!isOwnProfile) return visibleRepositories;
    const ownedIds = new Set(repositories.map((r) => r.id));
    const uniqueCollabRepos = collabRepos
      .filter((r) => !ownedIds.has(r.repo.id))
      .map((r) => r.repo);
    return [...visibleRepositories, ...uniqueCollabRepos];
  }, [isOwnProfile, visibleRepositories, repositories, collabRepos]);

  // Inside UserProfilePage.tsx component:

  const fetchRealActivity = useCallback(async () => {
    if (!displayUser) return;
    setActivityLoading(true);
    try {
      const userSpecificRepos = repositories.filter((r) => r.ownerId === displayUser.id);
      const activeRepos = userSpecificRepos.slice(0, 10);
      const months: { [key: string]: ActivityItemProps[] } = {};
      const stats: { [key: string]: number } = {};
      let yearTotal = 0;

      // Fetch all commits in parallel
      const commitPromises = activeRepos.map((repo) =>
        dispatch(
          getCommitsThunk({
            username: repo.ownerUsername,
            reponame: repo.name,
            limit: 30,
          }),
        ).then((action) => ({ repo, action })),
      );

      const results = await Promise.all(commitPromises);

      for (const { repo, action } of results) {
        const date = new Date(repo.createdAt || new Date());
        const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const repoDayKey = date.toISOString().split('T')[0];

        stats[repoDayKey] = (stats[repoDayKey] || 0) + 1;
        yearTotal++;

        if (!months[monthKey]) months[monthKey] = [];

        if (getCommitsThunk.fulfilled.match(action)) {
          const commits = action.payload;
          if (commits.length > 0) {
            let commitGroup = months[monthKey].find((item) => item.type === 'commits');
            if (!commitGroup) {
              commitGroup = { type: 'commits', totalCommits: 0, repoCount: 0, repos: [] };
              months[monthKey].unshift(commitGroup);
            }

            commitGroup.repos?.push({
              repoName: `${repo.ownerUsername}/${repo.name}`,
              commitCount: commits.length,
            });
            commitGroup.repoCount = (commitGroup.repoCount || 0) + 1;
            commitGroup.totalCommits = (commitGroup.totalCommits || 0) + commits.length;

            commits.forEach((c: GitCommit) => {
              const commitDayKey = new Date(c.date).toISOString().split('T')[0];
              stats[commitDayKey] = (stats[commitDayKey] || 0) + 1;
              yearTotal++;
            });
          }
        }

        let repoGroup = months[monthKey].find((item) => item.type === 'repo_created');
        if (!repoGroup) {
          repoGroup = { type: 'repo_created', repoCount: 0, repos: [] };
          months[monthKey].push(repoGroup);
        }

        repoGroup.repos?.push({
          repoName: `${repo.ownerUsername}/${repo.name}`,
          language: repo.language || 'TypeScript',
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          commitCount: 0,
        });
        repoGroup.repoCount = (repoGroup.repoCount || 0) + 1;
      }

      setDailyStats(stats);
      setTotalYearlyContributions(yearTotal);

      const sortedActivities = Object.entries(months)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([month, items]) => ({ month, items }));

      setUserActivities(sortedActivities);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setActivityLoading(false);
    }
  }, [displayUser, repositories, dispatch]);

  useEffect(() => {
    if (repositories.length > 0 && displayUser?.id) {
      fetchRealActivity();
    } else if (repositories.length === 0) {
      setDailyStats({});
      setUserActivities([]);
      setTotalYearlyContributions(0);
    }
  }, [repositories, displayUser?.id]);

  const handleFollowToggle = useCallback(async () => {
    if (!userId) return;
    if (isFollowing) {
      await dispatch(unfollowThunk(userId));
    } else {
      await dispatch(followThunk(userId));
    }
    dispatch(getFollowersThunk(userId));
    dispatch(getFollowingThunk(userId));
    dispatch(getMeThunk());
  }, [dispatch, userId, isFollowing]);

  if (userLoading && !displayUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8 w-full flex-1 min-w-0">
        <div className="flex flex-col md:flex-row gap-4 xs:gap-6 md:gap-8">
          {/* Left — Profile Sidebar */}
          <div className="w-full md:w-56 lg:w-64 xl:w-72 shrink-0 min-w-0">
            {/* Avatar Section — smaller on mobile, full width column on md+ */}
            <div className="relative mb-3 xs:mb-4 sm:mb-6">
              {/* On mobile: horizontal layout (avatar + name side by side) */}
              <div className="flex md:block items-center gap-4">
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-full md:aspect-square rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center text-white text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-bold md:max-w-[280px] md:mx-auto shrink-0">
                  {displayUser?.avatar ? (
                    <img
                      src={displayUser.avatar}
                      alt={displayUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayUser?.username?.[0]?.toUpperCase() || userId?.[0]?.toUpperCase()
                  )}
                </div>

                {/* Name + username shown inline on mobile only */}
                <div className="md:hidden min-w-0">
                  <h1 className="text-white text-base xs:text-lg sm:text-xl font-bold break-all leading-tight mb-0.5">
                    {displayUser?.username || userId}
                  </h1>
                  <p className="text-gray-500 text-sm xs:text-base font-light">@{userId}</p>
                </div>
              </div>
            </div>

            {/* Name + username — only shown on md+ (hidden on mobile, shown inline above) */}
            <div className="hidden md:block mb-6 px-2 text-left">
              <h1 className="text-white text-2xl font-bold break-all leading-tight mb-1">
                {displayUser?.username || userId}
              </h1>
              <p className="text-gray-500 text-lg font-light">@{userId}</p>
            </div>

            {/* CTA Button (Edit Profile or Follow) */}
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full bg-[#161b22] border border-gray-700 hover:border-gray-500 text-gray-300 py-1.5 xs:py-2 rounded-lg font-bold text-xs xs:text-sm transition-all flex items-center justify-center gap-2 mb-3 xs:mb-4 sm:mb-6"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`w-full py-1.5 xs:py-2 text-xs xs:text-sm font-bold rounded-lg border transition mb-3 xs:mb-4 sm:mb-6 shadow-lg ${
                  isFollowing
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                    : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-blue-900/40'
                }`}
              >
                {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}

            {/* User Bio */}
            {displayUser?.bio && (
              <p className="text-gray-300 text-xs xs:text-sm italic mb-3 xs:mb-4 sm:mb-6 leading-relaxed border-l-2 border-blue-500 pl-3 xs:pl-4">
                "{displayUser.bio}"
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 xs:gap-4 text-xs xs:text-sm mb-3 xs:mb-4 sm:mb-6 pb-3 xs:pb-4 sm:pb-6 border-b border-gray-800 flex-wrap">
              {/* Corrected: following.length shows how many people THIS user follows */}
              <div
                onClick={() => setFollowModal({ isOpen: true, type: 'Following' })}
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 cursor-pointer transition"
              >
                <Users className="w-4 h-4" />
                <span className="font-bold text-white">{following.length}</span>
                <span>following</span>
              </div>

              <span className="text-gray-700">·</span>

              {/* Corrected: followers.length shows how many people follow THIS user */}
              <div
                onClick={() => setFollowModal({ isOpen: true, type: 'Followers' })}
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 cursor-pointer transition"
              >
                <span className="font-bold text-white">{followers.length}</span>
                <span>followers</span>
              </div>
            </div>

            {/* Metadata (Joined date, etc.) */}
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined {formatDateJoined(displayUser?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right — Main Content Area */}
          <div className="flex-1 min-w-0 overflow-x-hidden">
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              repoCount={allProfileRepos.length}
            />

            {activeTab === 'overview' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Pinned / Selected Repositories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4 mb-4 xs:mb-6 sm:mb-8">
                  {allProfileRepos.length > 0 ? (
                    allProfileRepos
                      .slice(0, 4)
                      .map((repo) => (
                        <PinnedRepoCard
                          key={repo.id}
                          name={
                            collabRepos.some((cr) => cr.repo.id === repo.id)
                              ? `${repo.ownerUsername}/${repo.name}`
                              : repo.name
                          }
                          description={repo.description}
                          language={repo.language || 'JavaScript'}
                          languageColor={repo.language === 'TypeScript' ? '#3178c6' : '#f1e05a'}
                          stars={repo.stars}
                          onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                        />
                      ))
                  ) : (
                    <div className="col-span-1 sm:col-span-2 bg-gray-900/30 border border-dashed border-gray-800 rounded-xl xs:rounded-2xl p-6 xs:p-8 sm:p-12 text-center">
                      <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No repositories shared with the world yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* ContributionGraph — allow horizontal scroll only on this specific element on tiny screens */}
                <div className="overflow-x-auto mb-4 xs:mb-6 sm:mb-0 rounded-xl -mx-1 px-1">
                  <ContributionGraph
                    data={dailyStats}
                    totalContributions={totalYearlyContributions}
                    currentYear={new Date().getFullYear()}
                    joinedYear={new Date(displayUser?.createdAt || new Date()).getFullYear()}
                  />
                </div>
                {/* Contribution / Activity Timeline */}
                <ActivityTimeline activities={userActivities} isLoading={activityLoading} />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 mt-2 flex-wrap gap-2">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" /> Repositories
                  </h2>
                  <span className="text-gray-500 text-sm font-medium">
                    {repositories.length} public projects
                  </span>
                </div>

                {repoLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : allProfileRepos.length === 0 ? (
                  <div className="bg-gray-900/30 border border-gray-800 rounded-xl xs:rounded-2xl p-8 xs:p-12 sm:p-20 text-center">
                    <BookOpen className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium tracking-wide">
                      Nothing to list just yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {allProfileRepos.map((repo) => (
                      <RepoItem
                        key={repo.id}
                        repo={repo}
                        onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                        authUserId={authUser?.id}
                        isCollab={collabRepos.some((cr) => cr.repo.id === repo.id)}
                        onStarCountClick={async () => {
                          const result = await dispatch(
                            getStarredUsersThunk({
                              username: repo.ownerUsername,
                              reponame: repo.name,
                            }),
                          ).unwrap();
                          setStarModal({ isOpen: true, data: result });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isOwnProfile && isEditModalOpen && (
        <EditProfileModal
          user={authUser as unknown as UserResponseDTO}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      <FollowListModal
        isOpen={followModal.isOpen}
        title={followModal.type}
        data={followModal.type === 'Followers' ? followers : following}
        onClose={() => setFollowModal({ ...followModal, isOpen: false })}
      />
      <StarListModal
        isOpen={starModal.isOpen}
        data={starModal.data}
        onClose={() => setStarModal({ ...starModal, isOpen: false })}
      />

      <AppFooter />
    </div>
  );
};

export default UserProfilePage;
