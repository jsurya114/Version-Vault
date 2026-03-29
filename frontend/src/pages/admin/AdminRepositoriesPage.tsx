import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-950 text-white flex">
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition"
          >
            User Management
          </Link>
          <Link
            to={ROUTES.ADMIN_REPOS}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-medium"
          >
            Repository Management
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-16 py-1.5 text-sm text-gray-300 focus:outline-none w-64"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
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
        </main>
      </div>
    </div>
  );
};

export default AdminRepositoriesPage;
