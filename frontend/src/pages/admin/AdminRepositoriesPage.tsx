import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../types/common/Layout/Admin/AdminLayout';
import { ROUTES } from '../../constants/routes';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getAllRepoThunk } from 'src/features/admin/getRepoThunk';
import {
  selectAdminRepos,
  selectAdminReposLoading,
  selectAdminReposError,
  selectAdminReposMeta,
} from '../../features/admin/adminRepoSelectors';
import { RepositoryResponseDTO } from 'src/types/repository/repositoryTypes';
import DataTable from '../../types/common/Table/DataTable';
import Pagination from '../../types/common/Pagination/Pagination';
import TableFilters from '../../types/common/Filters/TableFilters';
import { ColumnDef } from '../../types/common/Table/TableTypes';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/30',
  blocked: 'bg-red-500/10 text-red-400 border border-red-500/30',
};

const AdminRepositoriesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const repos = useAppSelector(selectAdminRepos);
  const isLoading = useAppSelector(selectAdminReposLoading);
  const error = useAppSelector(selectAdminReposError);
  const meta = useAppSelector(selectAdminReposMeta);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchRepos = (overrides = {}) => {
    dispatch(
      getAllRepoThunk({
        page,
        limit,
        search: search || undefined,
        sort: sortField,
        order: sortOrder,
        status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'blocked'),
        ...overrides,
      }),
    );
  };

  useEffect(() => {
    fetchRepos();
  }, [page, sortField, sortOrder, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRepos({ page: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const columns: ColumnDef<RepositoryResponseDTO>[] = [
    {
      key: 'name',
      label: 'REPOSITORY',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{r.name}</p>
            <p className="text-gray-500 text-xs">by @{r.ownerUsername}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'visibility',
      label: 'VISIBILITY',
      render: (r) => (
        <span className="text-gray-400 text-xs uppercase tracking-tight bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50">
          {r.visibility}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (r) => {
        const status = r.isBlocked ? 'blocked' : 'active';
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'stars',
      label: 'STATS',
      render: (r) => (
        <div className="flex items-center gap-3 text-gray-500 text-xs">
          <span className="flex items-center gap-1">★ {r.stars}</span>
          <span className="flex items-center gap-1">⑂ {r.forks}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'CREATED',
      render: (r) => (
        <span className="text-gray-500 text-sm">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (r) => (
        <button
          onClick={() => navigate(`/admin/repositories/${r.id}`)}
          className="text-blue-400 hover:text-blue-300 text-xs transition font-medium"
        >
          Manage
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Repository Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Audit, monitor and regulate platform repositories.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-xs mb-1">Total Repositories</p>
          <p className="text-white text-2xl font-bold">{meta.total}</p>
        </div>
        {/* Add more stats as needed */}
      </div>

      <TableFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or owner..."
        filterValue={statusFilter}
        filterOptions={[
          { label: 'All Status', value: 'all' },
          { label: 'ACTIVE', value: 'active' },
          { label: 'BLOCKED', value: 'blocked' },
        ]}
        onFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sortField={sortField}
        sortOptions={[
          { label: 'Creation Date', value: 'createdAt' },
          { label: 'Name', value: 'name' },
          { label: 'Stars', value: 'stars' },
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={repos}
        isLoading={isLoading}
        emptyMessage="No repositories found"
      />

      {!isLoading && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </AdminLayout>
  );
};

export default AdminRepositoriesPage;
