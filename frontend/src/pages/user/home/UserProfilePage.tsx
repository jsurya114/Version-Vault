// src/pages/user/home/UserProfilePage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitFork, Star, BookOpen, Users, Calendar, Edit2 } from 'lucide-react';
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
} from '../../../features/repository/repositoryThunks';
import { listPRThunk } from '../../../features/pullrequest/prThunk';
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
import { EditProfileModal } from '../components/EditProfileModal';

interface ActivityGroup {
  date: string;
  items: ActivityItemProps[];
}

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

  const [activeTab, setActiveTab] = useState<'overview' | 'repositories'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [userActivities, setUserActivities] = useState<ActivityGroup[]>([]);
  const [totalContributions, setTotalContributions] = useState<number>(0);

  // Derived State: Are we looking at our OWN profile?
  const isOwnProfile = authUser?.userId === userId;
  const displayUser = isOwnProfile ? authUser : viewedUser;
  const isFollowing = followers.some((f) => f.followerId === authUser?.id);

  // Initial Data Fetching
  useEffect(() => {
    if (userId) {
      // 1. Fetch public profile of the handle in the URL
      dispatch(getProfileThunk(userId));
      dispatch(getFollowersThunk(userId));
      dispatch(getFollowingThunk(userId));
    }
    return () => {
      // Cleanup: clear the viewedUser state when leaving the page
      dispatch(clearViewedUser());
    };
  }, [userId]);

  // Fetch repositories only when we have the database ID of the user we are viewing
  useEffect(() => {
    if (displayUser?.id) {
      dispatch(listRepositoryThunk({ userId: displayUser.id }));
    }
  }, [displayUser?.id]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fetchRealActivity = async () => {
    if (!displayUser) return;
    setActivityLoading(true);
    try {
      const activeRepos = repositories.slice(0, 5);
      const allActivity: (ActivityItemProps & { date: Date })[] = [];
      let total = 0;

      await Promise.all(
        activeRepos.map(async (repo) => {
          const commitsAction = await dispatch(
            getCommitsThunk({
              username: repo.ownerUsername,
              reponame: repo.name,
              limit: 10,
            }),
          );

          if (getCommitsThunk.fulfilled.match(commitsAction)) {
            const commits = commitsAction.payload;
            total += commits.length;

            if (commits.length > 0) {
              const date = new Date(commits[0].date);
              allActivity.push({
                type: 'push',
                repo: `${repo.ownerUsername}/${repo.name}`,
                branch: repo.defaultBranch || 'main',
                count: commits.length,
                date,
                time: formatRelativeTime(date),
                commits: commits.slice(0, 2).map((c) => ({ hash: c.hash, message: c.message })),
              });
            }
          }

          const prsAction = await dispatch(
            listPRThunk({
              username: repo.ownerUsername,
              reponame: repo.name,
            }),
          );

          if (listPRThunk.fulfilled.match(prsAction)) {
            const prs = prsAction.payload.data;
            total += prs.length;
            prs.forEach((pr) => {
              const date = new Date(pr.createdAt || '');
              allActivity.push({
                type: 'pr',
                repo: `${repo.ownerUsername}/${repo.name}`,
                date,
                time: formatRelativeTime(date),
                id: pr.id.substring(0, 4),
                title: pr.title,
                status: pr.status as 'open' | 'closed' | 'merged',
              });
            });
          }
        }),
      );

      allActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

      const grouped: ActivityGroup[] = [];
      allActivity.forEach((item) => {
        const dateStr = item.date
          .toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
          .toUpperCase();

        let group = grouped.find((g) => g.date === dateStr);
        if (!group) {
          group = { date: dateStr, items: [] };
          grouped.push(group);
        }
        group.items.push(item);
      });

      setUserActivities(grouped);
      setTotalContributions(total);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (repositories.length > 0) {
      fetchRealActivity();
    }
  }, [repositories]);

  const handleFollowToggle = async () => {
    if (!userId) return;
    if (isFollowing) {
      await dispatch(unfollowThunk(userId));
    } else {
      await dispatch(followThunk(userId));
    }
    dispatch(getFollowersThunk(userId));
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'Member since recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (userLoading && !displayUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left — Profile Sidebar */}
          <div className="w-full md:w-72 shrink-0 min-w-0">
            {/* Avatar Section */}
            <div className="relative mb-6">
              <div className="w-full aspect-square rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center text-white text-6xl font-bold max-w-[280px] mx-auto">
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
            </div>

            {/* Name + username */}
            <div className="mb-6 px-2 text-left">
              <h1 className="text-white text-2xl font-bold break-all leading-tight mb-1">
                {displayUser?.username || userId}
              </h1>
              <p className="text-gray-500 text-lg font-light">@{userId}</p>
            </div>

            {/* CTA Button (Edit Profile or Follow) */}
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full bg-[#161b22] border border-gray-700 hover:border-gray-500 text-gray-300 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mb-6"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`w-full py-2 text-sm font-bold rounded-lg border transition mb-6 shadow-lg ${
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
              <p className="text-gray-300 text-sm italic mb-6 leading-relaxed border-l-2 border-blue-500 pl-4">
                "{displayUser.bio}"
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm mb-6 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-1 text-gray-400 hover:text-blue-400 cursor-pointer transition">
                <Users className="w-4 h-4" />
                <span className="font-bold text-white">{followers.length}</span>
                <span>followers</span>
              </div>
              <span className="text-gray-700">·</span>
              <div className="flex items-center gap-1 text-gray-400 hover:text-blue-400 cursor-pointer transition">
                <span className="font-bold text-white">{following.length}</span>
                <span>following</span>
              </div>
            </div>

            {/* Metadata (Joined date, etc.) */}
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(displayUser?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right — Main Content Area */}
          <div className="flex-1 min-w-0">
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              repoCount={repositories.length}
            />

            {activeTab === 'overview' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Pinned / Selected Repositories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {repositories.length > 0 ? (
                    repositories
                      .slice(0, 4)
                      .map((repo) => (
                        <PinnedRepoCard
                          key={repo.id}
                          name={repo.name}
                          description={repo.description}
                          language={repo.language || 'JavaScript'}
                          languageColor={repo.language === 'TypeScript' ? '#3178c6' : '#f1e05a'}
                          stars={repo.stars}
                          onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                        />
                      ))
                  ) : (
                    <div className="col-span-2 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl p-12 text-center">
                      <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        No repositories shared with the world yet.
                      </p>
                    </div>
                  )}
                </div>

                {/* Contribution / Activity Timeline */}
                <ActivityTimeline
                  activities={userActivities}
                  totalContributions={totalContributions}
                  isLoading={activityLoading}
                />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 mt-2">
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
                ) : repositories.length === 0 ? (
                  <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-20 text-center">
                    <BookOpen className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium tracking-wide">
                      Nothing to list just yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/60 rounded-xl p-5 cursor-pointer transition-all duration-300 group shadow-md"
                        onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-blue-400 text-base font-bold group-hover:text-blue-300 group-hover:underline decoration-2 underline-offset-4">
                                {repo.name}
                              </span>
                              <span
                                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border ${
                                  repo.visibility === 'public'
                                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                    : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                }`}
                              >
                                {repo.visibility}
                              </span>
                            </div>
                            {repo.description && (
                              <p className="text-gray-400 text-sm mb-3 leading-relaxed max-w-2xl">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-6 text-gray-500 text-xs font-semibold">
                              <span className="flex items-center gap-1.5 group-hover:text-yellow-400 transition-colors">
                                <Star className="w-3.5 h-3.5" />
                                {repo.stars}
                              </span>
                              <span className="flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                                <GitFork className="w-3.5 h-3.5" />
                                {repo.forks}
                              </span>
                              <span className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]" />
                                JavaScript
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
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
        <EditProfileModal user={authUser} onClose={() => setIsEditModalOpen(false)} />
      )}

      <AppFooter />
    </div>
  );
};

export default UserProfilePage;
