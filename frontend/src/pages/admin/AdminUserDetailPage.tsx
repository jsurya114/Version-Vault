import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from 'src/constants/routes';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { getAllUsersThunk } from 'src/features/admin/getUsersThunk';
import {
  selectAdminUsers,
  selectAdminLoading,
  selectAdminError,
  selectAdminMeta,
} from 'src/features/admin/adminSelectors';
import { UserResponseDTO } from 'src/types/admin/adminTypes';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/30',
  blocked: 'bg-red-500/10 text-red-400 border border-red-500/30',
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
};

const roleColors: Record<string, string> = {
  admin: 'bg-blue-500/10 text-blue-400',
  user: 'bg-purple-500/10 text-purple-400',
};

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const users = useAppSelector(selectAdminUsers);
  const isLoading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);
  const meta = useAppSelector(selectAdminMeta);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(
      getAllUsersThunk({
        page,
        limit,
        search: search || undefined,
        sort: sortField,
        order: sortOrder,
      }),
    );
  }, [page, sortField, sortOrder]);

  // search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      dispatch(
        getAllUsersThunk({
          page: 1,
          limit,
          search: search || undefined,
          sort: sortField,
          order: sortOrder,
        }),
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatus = (user: UserResponseDTO) => {
    if (user.isBlocked) return 'blocked';
    if (!user.isVerified) return 'pending';
    return 'active';
  };

  const filtered =
    statusFilter === 'All Status'
      ? users
      : users.filter((u) => getStatus(u).toUpperCase() === statusFilter);

  const handleViewUser = (id: string) => {
    navigate(`/admin/users/${id}`);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
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
              Manage platform access, roles, and repository permissions.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: meta.total },
              { label: 'Active', value: users.filter((u) => !u.isBlocked && u.isVerified).length },
              { label: 'Pending', value: users.filter((u) => !u.isVerified).length },
              { label: 'Blocked', value: users.filter((u) => u.isBlocked).length },
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
          </div>

          {/* Loading / Error */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Table */}
          {!isLoading && !error && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <th className="text-left px-4 py-3">USER</th>
                    <th className="text-left px-4 py-3">EMAIL ADDRESS</th>
                    <th className="text-left px-4 py-3">STATUS</th>
                    <th className="text-left px-4 py-3">ROLE</th>
                    <th className="text-left px-4 py-3">PROVIDER</th>
                    <th
                      className="text-left px-4 py-3 cursor-pointer hover:text-white transition"
                      onClick={() => handleSort('createdAt')}
                    >
                      DATE JOINED{' '}
                      {sortField === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="text-left px-4 py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const status = getStatus(u);
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                              {u.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{u.username}</p>
                              <p className="text-gray-500 text-xs">@{u.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[status]}`}
                          >
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${roleColors[u.role] || 'bg-gray-700 text-gray-400'}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm capitalize">{u.provider}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewUser(u.id)}
                            className="text-blue-400 hover:text-blue-300 text-xs transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, meta.total)} of{' '}
                  {meta.total} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-500 text-xs">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                    className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-700 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
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
