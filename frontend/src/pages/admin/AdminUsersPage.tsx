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
import DataTable from '../../types/common/Table/DataTable';
import Pagination from '../../types/common/Pagination/Pagination';
import TableFilters from '../../types/common/Filters/TableFilters';
import { ColumnDef } from '../../types/common/Table/TableTypes';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/30',
  blocked: 'bg-red-500/10 text-red-400 border border-red-500/30',
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
};

const roleColors: Record<string, string> = {
  admin: 'bg-blue-500/10 text-blue-400',
  user: 'bg-purple-500/10 text-purple-400',
};

const getStatus = (user: UserResponseDTO) => {
  if (user.isBlocked) return 'blocked';
  if (!user.isVerified) return 'pending';
  return 'active';
};

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const users = useAppSelector(selectAdminUsers);
  const isLoading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);
  const meta = useAppSelector(selectAdminMeta);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 2;

  const fetchUsers = (overrides = {}) => {
    dispatch(
      getAllUsersThunk({
        page,
        limit,
        search: search || undefined,
        sort: sortField,
        order: sortOrder,
        status: statusFilter === 'all' ? undefined : (statusFilter as any),
        ...overrides,
      }),
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortField, sortOrder, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers({ page: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // column definitions
  const columns: ColumnDef<UserResponseDTO>[] = [
    {
      key: 'username',
      label: 'USER',
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {u.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{u.username}</p>
            <p className="text-gray-500 text-xs">@{u.userId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'EMAIL ADDRESS',
      render: (u) => <span className="text-gray-400 text-sm">{u.email}</span>,
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (u) => {
        const status = getStatus(u);
        return (
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'role',
      label: 'ROLE',
      render: (u) => (
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${roleColors[u.role] || 'bg-gray-700 text-gray-400'}`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: 'provider',
      label: 'PROVIDER',
      render: (u) => <span className="text-gray-400 text-sm capitalize">{u.provider}</span>,
    },
    {
      key: 'createdAt',
      label: 'DATE JOINED',
      render: (u) => (
        <span className="text-gray-400 text-sm">
          {u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (u) => (
        <button
          onClick={() => navigate(`/admin/users/${u.id}`)}
          className="text-blue-400 hover:text-blue-300 text-xs transition"
        >
          View
        </button>
      ),
    },
  ];

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

          {/* Reusable Filters */}
          <TableFilters
            search={search}
            onSearchChange={(val) => setSearch(val)}
            searchPlaceholder="Search users by name, email, or ID..."
            filterValue={statusFilter}
            filterOptions={[
              { label: 'All Status', value: 'all' },
              { label: 'ACTIVE', value: 'active' },
              { label: 'BLOCKED', value: 'blocked' },
              { label: 'PENDING', value: 'pending' },
            ]}
            onFilterChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            sortField={sortField}
            sortOptions={[
              { label: 'Date Joined', value: 'createdAt' },
              { label: 'Username', value: 'username' },
              { label: 'Email', value: 'email' },
            ]}
            onSortFieldChange={(val) => {
              setSortField(val);
              setPage(1);
            }}
            sortOrder={sortOrder}
            onSortOrderChange={(val) => {
              setSortOrder(val);
              setPage(1);
            }}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Reusable Table */}
          <DataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            emptyMessage="No users found"
          />

          {/* Reusable Pagination */}
          {!isLoading && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={limit}
              onPageChange={(p) => setPage(p)}
            />
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
