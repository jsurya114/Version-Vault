import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitFork, Folder} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  listRepositoryThunk,
  deleteRepositoryThunk,
  updateVisibilityThunk,
} from '../../features/repository/repositoryThunks';
import {
  selectRepositories,
  selectRepositoryLoading,
  selectRepositoryError,
  selectRepositoryMeta,
} from '../../features/repository/repositorySelectors';
import { getAllCollabsReposThunk } from '../../features/collaborator/invitationThunk';
import { selectCollabRepos } from '../../features/collaborator/invitationSelectors';
import { selectAuthUser } from '../../features/auth/authSelectors';
import TableFilters from '../../types/common/Filters/TableFilters';
import DataTable from '../../types/common/Table/DataTable';
import { ROUTES } from '../../constants/routes';
import Pagination from '../../types/common/Pagination/Pagination';
import { ColumnDef } from '../../types/common/Table/TableTypes';
import { RepositoryResponseDTO } from '../../types/repository/repositoryTypes';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import DeleteConfirmModal from '../../types/common/Modal/DeleteConfirmationModal';
import VisibilityConfirmModal from '../../types/common/Modal/VisibilityModal';
import { StarButton } from './components/StarButton';
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
  const [visibilityModal, setVisibilityModal] = useState<{
    open: boolean;
    repo: RepositoryResponseDTO | null;
  }>({ open: false, repo: null });

  const limit = 5;

  const fetchParams = useMemo(
    () => ({
      page,
      limit: 5,
      search: search || undefined,
      sort: sortField,
      order: sortOrder,
      status: visibilityFilter === 'all' ? undefined : (visibilityFilter as 'active'),
    }),
    [page, search, sortField, sortOrder, visibilityFilter],
  );
  const collabRepos = useAppSelector(selectCollabRepos);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        dispatch(listRepositoryThunk(fetchParams));
      },
      search ? 500 : 0,
    );
    return () => clearTimeout(timer);
  }, [dispatch, fetchParams, search]);
  useEffect(() => {
    dispatch(getAllCollabsReposThunk());
  }, [dispatch]);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.repo) return;
    await dispatch(
      deleteRepositoryThunk({
        username: authUser?.userId || '',
        reponame: deleteModal.repo.name,
      }),
    );
    setDeleteModal({ open: false, repo: null });
  }, [dispatch, authUser?.userId, deleteModal.repo]);

  const allRepos = useMemo(() => {
    const ownedIds = new Set(repositories.map((r) => r.id));
    const uniqueCollabRepos = collabRepos
      .filter((r) => !ownedIds.has(r.repo.id))
      .map((c) => c.repo);
    return [...repositories, ...uniqueCollabRepos];
  }, [repositories, collabRepos]);

  const openVisibilityModal = useCallback((repo: RepositoryResponseDTO) => {
    setVisibilityModal({ open: true, repo });
  }, []);

  const handleConfirmVisibility = useCallback(async () => {
    if (!visibilityModal.repo) return;

    const newVisibility = visibilityModal.repo.visibility === 'public' ? 'private' : 'public';
    await dispatch(
      updateVisibilityThunk({
        username: authUser?.userId || '',
        reponame: visibilityModal.repo.name,
        visibility: newVisibility,
      }),
    );

    setVisibilityModal({ open: false, repo: null });
  }, [dispatch, authUser?.userId, visibilityModal.repo]);

  const columns: ColumnDef<RepositoryResponseDTO>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'REPOSITORY',
        render: (r) => {
          const isCollab = collabRepos.some((cr) => cr.repo.id === r.id);
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className="text-blue-400 text-sm font-medium hover:underline cursor-pointer"
                    onClick={() => navigate(`/${r.ownerUsername}/${r.name}`)}
                  >
                    {isCollab ? `${r.ownerUsername}/${r.name}` : r.name}
                  </p>

                  {isCollab && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold border border-purple-500/30 text-purple-400 bg-purple-500/10">
                      collaborator
                    </span>
                  )}
                  {r.isFork && (
                    <span className="text-[10px] flex items-center gap-1 uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold border border-blue-500/30 text-blue-400 bg-blue-500/10">
                      <GitFork className="w-3 h-3" /> Forked
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{r.description || 'No description'}</p>
                {r.isFork && (
                  <p className="text-gray-500 text-[10px] mt-0.5 flex items-center gap-1">
                    <GitFork className="w-2.5 h-2.5" />
                    {r.parentRepoOwnerUsername
                      ? `Forked from ${r.parentRepoOwnerUsername}`
                      : 'Forked repository'}
                  </p>
                )}
              </div>
            </div>
          );
        },
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
        render: (r) => (
          <div onClick={(e) => e.stopPropagation()}>
            {' '}
            {/* Prevents navigating to the repo when clicking the button */}
            <StarButton
              username={r.ownerUsername}
              reponame={r.name}
              initialStars={r.stars}
              initialStarredBy={r.starredBy || []}
              isOwner={authUser?.id === r.ownerId}
            />
          </div>
        ),
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
        render: (r) => {
          const collabEntry = collabRepos.find((cr) => cr.repo.id === r.id);
          if (collabEntry) {
            return (
              <span
                className={`text-xs italic ${
                  collabEntry.role === 'read'
                    ? 'text-gray-600'
                    : collabEntry.role === 'write'
                      ? 'text-blue-400'
                      : 'text-purple-400'
                }`}
              >
                {collabEntry.role} access
              </span>
            );
          }
          return (
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openVisibilityModal(r);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
              >
                Make {r.visibility === 'public' ? 'Private' : 'Public'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal({ open: true, repo: r });
                }}
                className="text-red-400 hover:text-red-300 text-xs transition"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, authUser?.userId, openVisibilityModal, collabRepos],
  );

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
          data={allRepos}
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
        itemPath={`${authUser?.userId}/${deleteModal.repo?.name}`}
        itemName="repository"
        isLoading={isLoading}
      />
      <VisibilityConfirmModal
        isOpen={visibilityModal.open}
        onClose={() => setVisibilityModal({ open: false, repo: null })}
        onConfirm={handleConfirmVisibility}
        repoName={visibilityModal.repo?.name || ''}
        newVisibility={visibilityModal.repo?.visibility === 'public' ? 'private' : 'public'}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RepositoryListPage;
