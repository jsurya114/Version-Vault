import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import {
  getUserByIdThunk,
  blockUserThunk,
  unBlockUserThunk,
} from 'src/features/admin/getUsersThunk';
import { selectSelectedUser, selectAdminLoading } from 'src/features/admin/adminSelectors';
import { ROUTES } from 'src/constants/routes';

const AdminUserDetailPage = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const user = useAppSelector(selectSelectedUser);
  const isLoading = useAppSelector(selectAdminLoading);

  const handleBlock = async () => {
    if (!user) return;
    if (user.isBlocked) {
      await dispatch(unBlockUserThunk(user.id));
    } else {
      await dispatch(blockUserThunk(user.id));
    }
  };

  useEffect(() => {
    if (id) dispatch(getUserByIdThunk(id));
  }, [id]);

  const getStatus = () => {
    if (!user) return 'unknown';
    if (user.isBlocked) return 'BLOCKED';
    if (!user.isVerified) return 'PENDING';
    return 'ACTIVE';
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border border-green-500/30',
    BLOCKED: 'bg-red-500/10 text-red-400 border border-red-500/30',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const status = getStatus();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-44 shrink-0 border-r border-gray-800 flex flex-col py-4">
        <div className="px-4 mb-6 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">VersionVault</span>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition"
          >
            Overview
          </Link>
          <Link
            to={ROUTES.ADMIN_USERS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm"
          >
            User Management
          </Link>
          <Link
            to={ROUTES.ADMIN_REPOS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition"
          >
            Repository Management
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or jump to..."
              className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-16 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none w-64 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs border border-gray-700 rounded px-1">
              ⌘K
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-white text-xl font-bold">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage platform access, roles, and repository permissions for all users.
            </p>
          </div>

          {/* User Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white text-2xl font-bold">{user.username}</h2>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[status]}`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500 text-sm">System User ID:</span>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                  #{user.id.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* User Details Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">User Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">DISPLAY NAME</label>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                      {user.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs mb-1">EMAIL ADDRESS</label>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs mb-1">BIO</label>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm min-h-16">
                    {user.bio || 'No bio provided.'}
                  </div>
                </div>
              </div>

              {/* Recent Repositories */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Recent Repositories</h3>
                  <span className="text-blue-400 text-xs hover:underline cursor-pointer">
                    View All
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b border-gray-800">
                      <th className="text-left pb-2">Repository Name</th>
                      <th className="text-left pb-2">Visibility</th>
                      <th className="text-left pb-2">Last Push</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-600 text-sm">
                        No repositories yet
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Account Management */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Account Management</h3>

                <div className="mb-4">
                  <label className="block text-gray-500 text-xs mb-1">USER ROLE</label>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm capitalize">
                    {user.role === 'user' ? 'Standard Member' : user.role}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">
                    Determines system-wide permissions and API limits.
                  </p>
                </div>

                <div className="border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Suspend Account</p>
                      <p className="text-gray-500 text-xs mt-0.5">Revoke all access immediately</p>
                    </div>
                    <button
                      onClick={handleBlock}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                        user.isBlocked
                          ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>

                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">
                  Save Changes
                </button>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">COMMITS</p>
                    <p className="text-white text-2xl font-bold">0</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">STORAGE</p>
                    <p className="text-white text-2xl font-bold">0 GB</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-500 text-xs">ACCOUNT HEALTH</p>
                    <p className="text-gray-400 text-xs">
                      {user.isVerified && !user.isBlocked ? '100% Compliance' : '0% Compliance'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-green-400 h-1.5 rounded-full"
                      style={{ width: user.isVerified && !user.isBlocked ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-800 py-3 px-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-gray-600 text-xs">LIVE UPDATES</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
