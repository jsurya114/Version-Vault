import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/app/hooks';
import { logoutThunk } from 'src/features/auth/authThunks';
import { ROUTES } from 'src/constants/routes';

const stats = [
  { label: 'Total Users', value: '12,842', icon: 'group', color: 'text-blue-400' },
  { label: 'Total Repositories', value: '84,209', icon: 'folder_managed', color: 'text-blue-400' },
  { label: 'Total Commits', value: '2.4M', icon: 'history', color: 'text-blue-400' },
  { label: 'Total Storage Used', value: '1.2 TB', icon: 'database', color: 'text-blue-400' },
];

const newestUsers = [
  {
    initials: 'SM',
    color: 'bg-green-600',
    name: 'Sarah Miller',
    email: 'sarah@enterprise.com',
    joined: '2 mins ago',
  },
  {
    initials: 'JD',
    color: 'bg-blue-600',
    name: 'John Doe',
    email: 'j.doe@startup.io',
    joined: '14 mins ago',
  },
  {
    initials: 'RC',
    color: 'bg-purple-600',
    name: 'Robert Chen',
    email: 'rchen@corp.net',
    joined: '28 mins ago',
  },
];

const latestRepos = [
  { name: 'nexus-core-api', version: 'v4.1-stable', size: '142.5 MB', visibility: 'PRIVATE' },
  { name: 'frontend-dashboard-ui', version: 'v2.0-beta', size: '84.2 MB', visibility: 'PUBLIC' },
  { name: 'auth-microservice', version: 'v3.1-stable', size: '12.8 MB', visibility: 'PRIVATE' },
];

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate(ROUTES.ADMIN_LOGIN);
  };

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

        <nav className="flex flex-col gap-1 px-2 flex-1">
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm"
          >
            Overview
          </Link>
          <Link
            to={ROUTES.ADMIN_USERS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition"
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

        <div className="px-2 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-gray-800 text-sm transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or jump to..."
              className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-16 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 w-64 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs border border-gray-700 rounded px-1">
              ⌘K
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />{' '}
                    Operational
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
                    <tr key={u.name} className="border-b border-gray-800/50 last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full ${u.color} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {u.initials}
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{u.name}</p>
                            <p className="text-gray-500 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-400 text-xs">{u.joined}</td>
                      <td className="py-2.5">
                        <button className="text-gray-500 hover:text-white text-xs transition">
                          •••
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Latest Repos */}
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
                    <th className="text-left pb-2">SIZE</th>
                    <th className="text-left pb-2">VISIBILITY</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRepos.map((r) => (
                    <tr key={r.name} className="border-b border-gray-800/50 last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                            📁
                          </div>
                          <div>
                            <p className="text-white text-xs font-medium">{r.name}</p>
                            <p className="text-gray-500 text-xs">{r.version}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-400 text-xs">{r.size}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            r.visibility === 'PRIVATE'
                              ? 'bg-gray-800 text-gray-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {r.visibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-3 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-600 text-xs">LIVE UPDATES</span>
          </div>
          <p className="text-gray-700 text-xs">
            VersionVault Internal Control Panel v4.12.0 • © 2024 Secure Systems Inc.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
