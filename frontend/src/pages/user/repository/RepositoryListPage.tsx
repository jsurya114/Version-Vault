import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import {
  listRepositoryThunk,
  deleteRepositoryThunk,
} from 'src/features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
  selectRepositoryError,
  selectRepositoryMeta,
} from 'src/features/repository/repositorySelectors';
import { selectAuthUser } from 'src/features/auth/authSelectors';
import TableFilters from 'src/types/common/Filters/TableFilters';
import DataTable from 'src/types/common/Table/DataTable';
import { ROUTES } from 'src/constants/routes';
import Pagination from 'src/types/common/Pagination/Pagination';
import { ColumnDef } from 'src/types/common/Table/TableTypes';
import { RepositoryResponseDTO } from 'src/types/repository/repositoryTypes';

const visibilityColors: Record<string, string> = {
  public: 'bg-green-500/10 text-green-400 border border-green-500/30',
  private: 'bg-gray-700 text-gray-400 border border-gray-600',
};

const RepositoryListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const repositories = useAppSelector(selectRepositories);
  const isLoading = useAppSelector(selectRepositoryLoading);
  const error = useAppSelector(selectRepositoryError);
  const meta = useAppSelector(selectRepositoryMeta);
  const authUser = useAppSelector(selectAuthUser);

  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchRepos = (overrides = {}) => {
    dispatch(
      listRepositoryThunk({
        page,
        limit,
        search: search || undefined,
        sort: sortField,
        order: sortOrder,
        status: visibilityFilter === 'all' ? undefined : (visibilityFilter as any),
        ...overrides,
      }),
    );
  };

  useEffect(() => {
    fetchRepos();
  }, [page, sortField, sortOrder, visibilityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRepos({ page: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (repo: RepositoryResponseDTO) => {
    if (!confirm(`Delete "${repo.name}"? This cannot be undone.`)) return;
    await dispatch(
      deleteRepositoryThunk({
        username: authUser?.userId || '',
        reponame: repo.name,
      }),
    );
    fetchRepos();
  };

  const columns: ColumnDef<RepositoryResponseDTO>[] = [
    {
      key: 'name',
      label: 'REPOSITORY',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
            📁
          </div>
          <div>
            <p
              className="text-blue-400 text-sm font-medium hover:underline cursor-pointer"
              onClick={() => navigate(`/${authUser?.userId}/${r.name}`)}
            >
              {r.name}
            </p>
            <p className="text-gray-500 text-xs">{r.description || 'No description'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'visibility',
      label: 'VISIBILITY',
      render: (r) => (
        <span
          className={`text-xs px-2 py-0.5 rounded font-medium ${visibilityColors[r.visibility]}`}
        >
          {r.visibility.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'defaultBranch',
      label: 'DEFAULT BRANCH',
      render: (r) => <span className="text-gray-400 text-sm">{r.defaultBranch}</span>,
    },
    {
      key: 'stars',
      label: 'STARS',
      render: (r) => <span className="text-gray-400 text-sm">⭐ {r.stars}</span>,
    },
    {
      key: 'createdAt',
      label: 'CREATED',
      render: (r) => (
        <span className="text-gray-400 text-sm">
          {r.createdAt
            ? new Date(r.createdAt).toLocaleDateString('en-US', {
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
      render: (r) => (
        <button
          onClick={() => handleDelete(r)}
          className="text-red-400 hover:text-red-300 text-xs transition"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Topbar */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">VersionVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white text-sm transition">
            Home
          </Link>
          <Link
            to={ROUTES.REPO_CREATE}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
          >
            + New
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {authUser?.userId?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-xl font-bold">Repositories</h1>
            <p className="text-gray-500 text-sm mt-1">{meta.total} repositories</p>
          </div>
          <Link
            to={ROUTES.REPO_CREATE}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New repository
          </Link>
        </div>

        {/* Filters */}
        <TableFilters
          search={search}
          onSearchChange={(val) => setSearch(val)}
          searchPlaceholder="Search repositories..."
          filterValue={visibilityFilter}
          filterOptions={[
            { label: 'All', value: 'all' },
            { label: 'PUBLIC', value: 'public' },
            { label: 'PRIVATE', value: 'private' },
          ]}
          onFilterChange={(val) => {
            setVisibilityFilter(val);
            setPage(1);
          }}
          sortField={sortField}
          sortOptions={[
            { label: 'Created At', value: 'createdAt' },
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

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={repositories}
          isLoading={isLoading}
          emptyMessage="No repositories yet. Create your first repository!"
        />

        {/* Pagination */}
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
    </div>
  );
};

export default RepositoryListPage;
