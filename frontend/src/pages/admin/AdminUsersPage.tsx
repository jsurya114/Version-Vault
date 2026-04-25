import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getAllUsersThunk } from '../../features/admin/getUsersThunk';
import {
  selectAdminUsers,
  selectAdminLoading,
  selectAdminError,
  selectAdminMeta,
} from '../../features/admin/adminSelectors';
import { UserResponseDTO } from '../../types/admin/adminTypes';
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
  const limit = 5;

  const fetchParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      sort: sortField,
      order: sortOrder,
      status:
        statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'blocked' | 'pending'),
    }),
    [page, search, sortField, sortOrder, statusFilter],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(getAllUsersThunk(fetchParams));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, fetchParams]);

  // column definitions
  const columns: ColumnDef<UserResponseDTO>[] = useMemo(
    () => [
      {
        key: 'username',
        label: 'USER',
        render: (u) => (
          <div className="flex items-center gap-2 min-w-0">
            {u.avatar ? (
              <img
                src={u.avatar}
                alt={u.username}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {u.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{u.username}</p>
              <p className="text-gray-500 text-xs truncate">@{u.userId}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        label: 'EMAIL ADDRESS',
        render: (u) => <span className="text-gray-400 text-sm truncate block">{u.email}</span>,
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
    ],
    [navigate],
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-white text-lg xs:text-xl font-bold">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage platform access, roles, and repository permissions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6">
        {[
          { label: 'Total Users', value: meta.total },
          { label: 'Active', value: users.filter((u) => !u.isBlocked && u.isVerified).length },
          { label: 'Pending', value: users.filter((u) => !u.isVerified).length },
          { label: 'Blocked', value: users.filter((u) => u.isBlocked).length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3 xs:p-4 text-center"
          >
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className="text-white text-xl xs:text-2xl font-bold">{s.value}</p>
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
    </AdminLayout>
  );
};

export default AdminUsersPage;
