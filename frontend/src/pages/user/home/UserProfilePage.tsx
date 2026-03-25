import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitFork, Star, BookOpen, Users, Calendar } from 'lucide-react';
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
import AppHeader from '../../../types/common/Layout/AppHeader';
import AppFooter from '../../../types/common/Layout/AppFooter';
import ProfileTabs from '../../../types/common/Profile/ProfileTabs';
import PinnedRepoCard from '../../../types/common/Profile/PinnedRepoCard';
import ActivityTimeline, {
  ActivityItemProps,
} from '../../../types/common/Profile/ActivityTimeline';
import { useState } from 'react';
import axiosInstance from 'src/services/axiosInstance';

interface ActivityGroup {
  date: string;
  items: ActivityItemProps[];
}

const UserProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = useAppSelector(selectAuthUser);
  const followers = useAppSelector(selectFollowers);
  const following = useAppSelector(selectFollowing);
  const followLoading = useAppSelector(selectFollowLoading);
  const repositories = useAppSelector(selectRepositories);
  const repoLoading = useAppSelector(selectRepositoryLoading);
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories'>('overview');
  const [activityLoading, setActivityLoading] = useState(false);
  const [userActivities, setUserActivities] = useState<ActivityGroup[]>([]);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [profileUser, setProfileUser] = useState(null);

  const isOwnProfile = user?.userId === userId;
  const isFollowing = followers.some((f) => f.followerId === user?.id);

  useEffect(() => {
    if (userId) {
      dispatch(getFollowersThunk(userId));
      dispatch(getFollowingThunk(userId));
      dispatch(listRepositoryThunk({}));
    }
  }, [userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      setProfileUser(response.data);
    };
    fetchProfile();
  }, [userId]);

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
    setActivityLoading(true);
    try {
      const activeRepos = repositories.slice(0, 5);
      const allActivity: (ActivityItemProps & { date: Date })[] = [];
      let total = 0;

      await Promise.all(
        activeRepos.map(async (repo) => {
          // Fetch commits
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

          // Fetch PRs
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

      // Sort by date descending
      allActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

      // Group by date string
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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        <div className="flex gap-8">
          {/* Left — Profile */}
          <div className="w-72 shrink-0 min-w-0">
            {/* Avatar */}
            <div className="w-full aspect-square rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold mb-4 max-w-[200px] mx-auto">
              {userId?.[0]?.toUpperCase()}
            </div>

            {/* Name + username */}
            <div className="text-center mb-4 px-2 overflow-hidden">
              <h1 className="text-white text-xl font-bold break-all leading-tight">
                {user?.username}
              </h1>
              <p className="text-gray-500 text-sm break-all">@{userId}</p>
            </div>

            {/* Follow button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`w-full py-2 text-sm font-medium rounded-lg border transition mb-4 ${
                  isFollowing
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                    : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1 text-gray-400 hover:text-white cursor-pointer transition">
                <Users className="w-4 h-4" />
                <span className="font-medium text-white">{followers.length}</span>
                <span>followers</span>
              </div>
              <span className="text-gray-700">·</span>
              <div className="flex items-center gap-1 text-gray-400 hover:text-white cursor-pointer transition">
                <span className="font-medium text-white">{following.length}</span>
                <span>following</span>
              </div>
            </div>

            {/* Meta */}
            <div className="space-y-2 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {/* <span>Joined {formatDate(user?.createdAt)}</span> */}
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex-1 min-w-0">
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              repoCount={repositories.length}
            />

            {activeTab === 'overview' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Pinned Repositories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {repositories.slice(0, 2).map((repo) => (
                    <PinnedRepoCard
                      key={repo.id}
                      name={repo.name}
                      description={repo.description}
                      language="JavaScript"
                      languageColor="#f1e05a"
                      stars={repo.stars}
                      onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                    />
                  ))}
                  {repositories.length === 0 && (
                    <div className="col-span-2 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl p-8 text-center">
                      <p className="text-gray-500 text-sm">No pinned repositories yet</p>
                    </div>
                  )}
                </div>

                {/* Activity Timeline */}
                <ActivityTimeline
                  activities={userActivities}
                  totalContributions={totalContributions}
                  isLoading={activityLoading}
                />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" /> Repositories
                  </h2>
                  <span className="text-gray-500 text-sm">{repositories.length} total</span>
                </div>

                {repoLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 text-center">
                    <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No repositories yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {repositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="bg-gray-900/40 border border-gray-800 hover:border-gray-700 rounded-xl p-4 cursor-pointer transition-all duration-200 group"
                        onClick={() => navigate(`/${repo.ownerUsername}/${repo.name}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-blue-400 text-sm font-medium group-hover:underline">
                                {repo.name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                  repo.visibility === 'public'
                                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                    : 'border-gray-600 text-gray-400 bg-gray-700'
                                }`}
                              >
                                {repo.visibility}
                              </span>
                            </div>
                            {repo.description && (
                              <p className="text-gray-500 text-xs truncate mb-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-gray-600 text-xs font-medium">
                              <span className="flex items-center gap-1 group-hover:text-yellow-400 transition-colors">
                                <Star className="w-3 h-3" />
                                {repo.stars}
                              </span>
                              <span className="flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                                <GitFork className="w-3 h-3" />
                                {repo.forks}
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

      <AppFooter />
    </div>
  );
};

export default UserProfilePage;
