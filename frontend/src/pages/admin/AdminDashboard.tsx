import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getAllUsersThunk } from '../../features/admin/getUsersThunk';
import { selectAdminUsers } from '../../features/admin/adminSelectors';
import { getAllRepoThunk } from 'src/features/admin/getRepoThunk';
import { selectAdminRepos, selectAdminReposMeta } from 'src/features/admin/adminRepoSelectors';
import { ROUTES } from '../../constants/routes';
import React, { useEffect, useMemo } from 'react';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';
import { UserResponseDTO } from '../../types/admin/adminTypes';
import { RepositoryResponseDTO } from '../../types/repository/repositoryTypes';
import { Users, FolderGit2, UserCheck, ShieldBan, CheckCircle2, Folder } from 'lucide-react';

const UserRow = React.memo(({ user }: { user: UserResponseDTO }) => (
  <tr className="border-b border-gray-800/50 last:border-0">
    <td className="py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-xs font-medium truncate">{user.username}</p>
          <p className="text-gray-500 text-xs truncate">{user.email}</p>
        </div>
      </div>
    </td>
    <td className="py-2.5 text-gray-400 text-xs">
      {user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : '—'}
    </td>
    <td className="py-2.5">
      <Link
        to={`/admin/users/${user.id}`}
        className="text-blue-400 hover:text-blue-300 text-xs transition"
      >
        View
      </Link>
    </td>
  </tr>
));

const RepoRow = React.memo(({ repo }: { repo: RepositoryResponseDTO }) => (
  <tr className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition">
    <td className="py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center text-gray-400">
          <Folder className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-medium truncate">{repo.name}</p>
          <p className="text-gray-500 text-[10px] uppercase font-mono">{repo.defaultBranch}</p>
        </div>
      </div>
    </td>
    <td className="py-2.5 text-blue-400 text-xs text-center font-bold truncate">
      @{repo.ownerUsername}
    </td>
    <td className="py-2.5 text-right">
      <span
        className={`text-[9px] px-2 py-0.5 rounded font-black tracking-tighter uppercase ${
          repo.visibility === 'private'
            ? 'bg-gray-800 text-gray-400 border border-gray-700'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}
      >
        {repo.visibility}
      </span>
    </td>
  </tr>
));

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const repos = useAppSelector(selectAdminRepos);
  const repoMeta = useAppSelector(selectAdminReposMeta);

  useEffect(() => {
    dispatch(getAllUsersThunk({ limit: 5 }));
    dispatch(getAllRepoThunk({ limit: 5 }));
  }, []);

  const newestRepos = useMemo(() => repos.slice(0, 3), [repos]);

  const totalActive = useMemo(
    () => users.filter((u) => !u.isBlocked && u.isVerified).length,
    [users],
  );
  const totalBlocked = useMemo(() => users.filter((u) => u.isBlocked).length, [users]);

  const newestUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  }, [users]);

  const stats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: users.length.toLocaleString(),
        icon: <Users className="w-4 h-4" />,
        color: 'text-blue-400',
      },
      {
        label: 'Total Repositories',
        value: (repoMeta?.total ?? 0).toLocaleString(),
        icon: <FolderGit2 className="w-4 h-4" />,
        color: 'text-blue-400',
      },
      {
        label: 'Active Users',
        value: totalActive.toLocaleString(),
        icon: <UserCheck className="w-4 h-4" />,
        color: 'text-blue-400',
      },
      {
        label: 'Blocked Users',
        value: totalBlocked.toLocaleString(),
        icon: <ShieldBan className="w-4 h-4" />,
        color: 'text-red-400',
      },
    ],
    [users.length, repoMeta?.total, totalActive, totalBlocked],
  );

  return (
    <AdminLayout>
      {/* System Integrity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4 mb-4 xs:mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">System Integrity</span>
          </div>
          <span className="text-gray-500 text-xs">UPTIME: 99.99%</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
          {[
            { label: 'API CLUSTER', name: 'versionvault-api-prd' },
            { label: 'DATABASE POOL', name: 'postgres-main-01' },
            { label: 'STORAGE LAYER', name: 's3-blob-store' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col xs:flex-row items-start xs:items-center justify-between bg-gray-800 rounded-lg px-3 xs:px-4 py-2 xs:py-2.5 gap-1 xs:gap-2"
            >
              <div>
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="text-white text-sm">{s.name}</p>
              </div>
              <span className="flex items-center gap-1 text-green-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Operational
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className="text-white text-xl xs:text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
        {/* Newest Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Newest Users</h3>
            <Link to={ROUTES.ADMIN_USERS} className="text-blue-400 text-xs hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left pb-2">USER</th>
                  <th className="text-left pb-2">JOINED</th>
                  <th className="text-left pb-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {newestUsers.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Repositories */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Latest Repositories</h3>
            <Link to={ROUTES.ADMIN_REPOS} className="text-blue-400 text-xs hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  <th className="text-left pb-2">REPOSITORY</th>
                  <th className="text-center pb-2">OWNER</th>
                  <th className="text-right pb-2">VISIBILITY</th>
                </tr>
              </thead>
              <tbody>
                {newestRepos.length > 0 ? (
                  newestRepos.map((r) => <RepoRow key={r.id} repo={r} />)
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-gray-500 text-xs italic text-center">
                      No repositories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
