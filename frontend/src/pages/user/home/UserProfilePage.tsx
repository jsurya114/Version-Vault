import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GitFork, Star, BookOpen, Users, MapPin, Calendar } from 'lucide-react';
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
import { listRepositoryThunk } from '../../../features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
} from '../../../features/repository/repositorySelectors';
import AppHeader from '../../../types/common/Layout/AppHeader';
import AppFooter from '../../../types/common/Layout/AppFooter';

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

  const isOwnProfile = user?.userId === userId;
  const isFollowing = followers.some((f) => f.followerId === user?.id);

  useEffect(() => {
    if (userId) {
      dispatch(getFollowersThunk(userId));
      dispatch(getFollowingThunk(userId));
      dispatch(listRepositoryThunk({}));
    }
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!userId) return;
    if (isFollowing) {
      await dispatch(unfollowThunk(userId));
    } else {
      await dispatch(followThunk(userId));
    }
    dispatch(getFollowersThunk(userId));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8 w-full flex-1">
        <div className="flex gap-8">
          {/* Left — Profile */}
          <div className="w-72 shrink-0">
            {/* Avatar */}
            <div className="w-full aspect-square rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold mb-4 max-w-[200px] mx-auto">
              {userId?.[0]?.toUpperCase()}
            </div>

            {/* Name + username */}
            <div className="text-center mb-4">
              <h1 className="text-white text-xl font-bold">{user?.username}</h1>
              <p className="text-gray-500 text-sm">@{userId}</p>
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

          {/* Right — Repositories */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Repositories</h2>
              <span className="text-gray-500 text-sm">{repositories.length} repositories</span>
            </div>

            {repoLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : repositories.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No repositories yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repositories.map((repo) => (
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
                          <p className="text-gray-500 text-xs truncate mb-2">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-gray-600 text-xs">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
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
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default UserProfilePage;
