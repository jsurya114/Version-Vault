import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  listRepositoryThunk,
  deleteRepositoryThunk,
} from '../../features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
  selectRepositoryError,
  selectRepositoryMeta,
} from '../../features/repository/repositorySelectors';
import { selectAuthUser } from '../../features/auth/authSelectors';
import TableFilters from '../../types/common/Filters/TableFilters';
import DataTable from '../../types/common/Table/DataTable';
import { ROUTES } from '../../constants/routes';
import Pagination from '../../types/common/Pagination/Pagination';
import { ColumnDef } from '../../types/common/Table/TableTypes';
import { RepositoryResponseDTO } from '../../types/repository/repositoryTypes';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import DeleteConfirmModal from '../../types/common/Layout/DeleteConfirmationModal';

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
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    repo: RepositoryResponseDTO | null;
  }>({ open: false, repo: null });
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

  const handleDelete = async () => {
    if (!deleteModal.repo) return;
    await dispatch(
      deleteRepositoryThunk({
        username: authUser?.userId || '',
        reponame: deleteModal.repo.name,
      }),
    );
    setDeleteModal({ open: false, repo: null });
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
          onClick={() => setDeleteModal({ open: true, repo: r })}
          className="text-red-400 hover:text-red-300 text-xs transition"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      <main className="p-6 max-w-6xl mx-auto w-full flex-1">
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
      <AppFooter />
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, repo: null })}
        onConfirm={handleDelete}
        repoPath={`${authUser?.userId}/${deleteModal.repo?.name}`}
      />
    </div>
  );
};

export default RepositoryListPage;
