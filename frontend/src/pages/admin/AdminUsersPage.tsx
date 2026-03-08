import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from 'src/constants/routes';

const mockUsers = [
  {
    initials: 'SC',
    color: 'bg-orange-500',
    name: 'Sarah Chen',
    handle: '@sarah',
    email: 'sarah.chen@versionvault.io',
    status: 'ACTIVE',
    repos: 12,
    role: 'Admin',
    joined: 'Oct 12, 2023',
  },
  {
    initials: 'JM',
    color: 'bg-blue-500',
    name: 'James Morgan',
    handle: '@jmorgan',
    email: 'j.morgan@enterprise.com',
    status: 'BLOCKED',
    repos: 5,
    role: 'Developer',
    joined: 'Jan 05, 2024',
  },
  {
    initials: 'ER',
    color: 'bg-green-500',
    name: 'Elena Rodriguez',
    handle: '@elendr',
    email: 'elena.r@devispace.io',
    status: 'ACTIVE',
    repos: 4106,
    role: 'Architect',
    joined: 'Sep 18, 2022',
  },
  {
    initials: 'MT',
    color: 'bg-purple-500',
    name: 'Marcus Thorne',
    handle: '@mthorne',
    email: 'm.thorne@cyber-labs.net',
    status: 'PENDING',
    repos: 1,
    role: 'Reviewer',
    joined: 'Feb 29, 2024',
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-400 border border-green-500/30',
  BLOCKED: 'bg-red-500/10 text-red-400 border border-red-500/30',
  PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
};

const roleColors: Record<string, string> = {
  Admin: 'bg-blue-500/10 text-blue-400',
  Developer: 'bg-purple-500/10 text-purple-400',
  Architect: 'bg-cyan-500/10 text-cyan-400',
  Reviewer: 'bg-orange-500/10 text-orange-400',
};

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
          <div className="mb-6">
            <h1 className="text-white text-xl font-bold">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage platform access, roles, and repository permissions for all users.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: '1,248' },
              { label: 'Active', value: '1,182' },
              { label: 'Pending', value: '24' },
              { label: 'Blocked', value: '42' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
              >
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className="text-white text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search users by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600 transition"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none"
            >
              {['All Status', 'ACTIVE', 'BLOCKED', 'PENDING'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition">
              Filter
            </button>
            <button className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition">
              Sort
            </button>
          </div>

          {/* Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs">
                  <th className="text-left px-4 py-3">USER</th>
                  <th className="text-left px-4 py-3">EMAIL ADDRESS</th>
                  <th className="text-left px-4 py-3">STATUS</th>
                  <th className="text-left px-4 py-3">REPOS</th>
                  <th className="text-left px-4 py-3">ROLE</th>
                  <th className="text-left px-4 py-3">DATE JOINED</th>
                  <th className="text-left px-4 py-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.name}
                    className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {u.initials}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[u.status]}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.repos}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${roleColors[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{u.joined}</td>
                    <td className="px-4 py-3">
                      <button className="text-gray-500 hover:text-white text-sm transition">
                        •••
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
              <p className="text-gray-500 text-xs">Showing 1-4 of 1,248 users</p>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 transition">
                  Previous
                </button>
                <button className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 transition">
                  Next
                </button>
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

export default AdminUsersPage;
