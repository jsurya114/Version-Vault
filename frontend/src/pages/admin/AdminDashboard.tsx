import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getAllUsersThunk } from '../../features/admin/getUsersThunk';
import { selectAdminUsers } from '../../features/admin/adminSelectors';
import { getAllRepoThunk } from 'src/features/admin/getRepoThunk';
import { selectAdminRepos, selectAdminReposMeta } from 'src/features/admin/adminRepoSelectors';
import { ROUTES } from '../../constants/routes';
import { useEffect } from 'react';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAdminUsers);
  const repos = useAppSelector(selectAdminRepos);
  const repoMeta = useAppSelector(selectAdminReposMeta);

  useEffect(() => {
    dispatch(getAllUsersThunk({ limit: 5 }));
    dispatch(getAllRepoThunk({ limit: 5 }));
  }, []);

  const newestRepos = repos.slice(0, 3);

  const totalActive = users.filter((u) => !u.isBlocked && u.isVerified).length;
  const totalBlocked = users.filter((u) => u.isBlocked).length;
  const newestUsers = [...users]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  const stats = [
    {
      label: 'Total Users',
      value: users.length.toLocaleString(),
      icon: 'group',
      color: 'text-blue-400',
    },
    {
      label: 'Total Repositories',
      value: repoMeta.total.toLocaleString(),
      icon: 'folder_managed',
      color: 'text-blue-400',
    },
    {
      label: 'Active Users',
      value: totalActive.toLocaleString(),
      icon: 'history',
      color: 'text-blue-400',
    },
    {
      label: 'Blocked Users',
      value: totalBlocked.toLocaleString(),
      icon: 'database',
      color: 'text-blue-400',
    },
  ];

  return (
    <AdminLayout>
      {/* System Integrity */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm">✓</span>
            <span className="text-white text-sm font-medium">System Integrity</span>
          </div>
          <span className="text-gray-500 text-xs">UPTIME: 99.99%</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'API CLUSTER', name: 'versionvault-api-prd' },
            { label: 'DATABASE POOL', name: 'postgres-main-01' },
            { label: 'STORAGE LAYER', name: 's3-blob-store' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2.5"
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <span className={`text-xs ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-white text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* Newest Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Newest Users</h3>
            <Link to={ROUTES.ADMIN_USERS} className="text-blue-400 text-xs hover:underline">
              View All
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left pb-2">USER</th>
                <th className="text-left pb-2">JOINED</th>
                <th className="text-left pb-2">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {newestUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-800/50 last:border-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{u.username}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-400 text-xs">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="py-2.5">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="text-blue-400 hover:text-blue-300 text-xs transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Latest Repositories */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Latest Repositories</h3>
            <Link to={ROUTES.ADMIN_REPOS} className="text-blue-400 text-xs hover:underline">
              View All
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left pb-2">REPOSITORY</th>
                <th className="text-center pb-2">OWNER</th>
                <th className="text-right pb-2">VISIBILITY</th>
              </tr>
            </thead>
            <tbody>
              {newestRepos.length > 0 ? (
                newestRepos.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                          📁
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{r.name}</p>
                          <p className="text-gray-500 text-[10px] uppercase font-mono">
                            {r.defaultBranch}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-blue-400 text-xs text-center font-bold">
                      @{r.ownerUsername}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-black tracking-tighter uppercase ${
                          r.visibility === 'private'
                            ? 'bg-gray-800 text-gray-400 border border-gray-700'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {r.visibility}
                      </span>
                    </td>
                  </tr>
                ))
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
    </AdminLayout>
  );
};

export default AdminDashboard;
