import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch as GitBranchIcon,
  Search,
  Plus,
  Trash2,
  Clock,
  GitPullRequest,
  GitMerge,
  Info,
  X,
  Pencil,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  getBranchesThunk,
  createBranchThunk,
  deleteBranchThunk,
  renameBranchThunk,
} from '../../features/repository/repositoryThunks';
import {
  selectBranches,
  selectRepositoryLoading,
} from '../../features/repository/repositorySelectors';
import { GitBranch } from '../../types/repository/repositoryTypes';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import CreateBranchModal from '../../types/common/Modal/CreateBranchModal';
import DeleteConfirmModal from '../../types/common/Modal/DeleteConfirmationModal';
import { CommonLoader } from '../../types/common/Layout/Loader';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import { collaboratorService } from 'src/services/collaborator.service';

// --- Time Helper ---
const timeAgo = (dateStr: string) => {
  if (!dateStr) return 'unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${mins} min${mins > 1 ? 's' : ''} ago`;
};

const BranchRow = React.memo(
  ({
    branch,
    isDefault,
    canDelete,
    onDelete,
    onEdit,
    username,
    reponame,
  }: {
    branch: GitBranch;
    isDefault?: boolean;
    canDelete: boolean;
    onDelete: (name: string) => void;
    onEdit: (name: string) => void;
    username: string;
    reponame: string;
  }) => {
    const navigate = useNavigate();

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(branch.name);
      },
      [onDelete, branch.name],
    );

    // Dynamic Bar Calculation
    const totalDiff = (branch.behind || 0) + (branch.ahead || 0);
    const behindPercent = totalDiff > 0 ? ((branch.behind || 0) / totalDiff) * 100 : 0;
    const aheadPercent = totalDiff > 0 ? ((branch.ahead || 0) / totalDiff) * 100 : 0;

    return (
      <div
        onClick={() => navigate(`/${username}/${reponame}/tree/${branch.name}`)}
        className="md:grid lg:grid-cols-[1fr,150px,120px,120px,160px] md:grid-cols-[minmax(0,1fr)_130px_110px_140px] md:gap-4 px-3 xs:px-4 py-3 xs:py-4 items-center hover:bg-white/[0.05] cursor-pointer transition text-sm group flex flex-col md:flex-row gap-2.5 md:gap-4"
      >
        <div className="flex items-center gap-2 xs:gap-3 flex-wrap w-full md:w-auto">
          <div className="bg-blue-500/10 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-md text-blue-400 font-mono text-[11px] xs:text-xs flex items-center gap-1.5 xs:gap-2 border border-blue-500/20 max-w-full">
            <GitBranchIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />{' '}
            <span className="truncate">{branch.name}</span>
          </div>
          {isDefault && (
            <span className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase ring-1 ring-gray-700">
              Default
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5 xs:gap-1 text-gray-400 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[7px] font-bold text-white uppercase shadow-sm border border-gray-800">
              {branch.lastCommitAuthor?.[0] || 'U'}
            </div>
            <span className="font-medium text-gray-300">
              {branch.lastCommitAuthor || 'Unknown User'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 ml-7">
            <Clock className="w-3 h-3" />
            pushed {timeAgo(branch.lastCommitDate || '')}
          </div>
        </div>

        <div className={`items-center gap-1.5 text-xs font-medium text-gray-600 hidden lg:flex`}>
          {/* Placeholder for CI/CD checks logic */}
          <span className="opacity-50">--</span>
        </div>

        {/* Dynamic Behind/Ahead Section */}
        <div className="flex items-center justify-start md:justify-center min-w-0 md:min-w-[120px] w-full md:w-auto">
          {totalDiff > 0 ? (
            <div className="flex items-center gap-3 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <div className="relative flex bg-gray-800 h-1.5 w-16 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-gray-500 h-full transition-all duration-500"
                  style={{ width: `${behindPercent}%` }}
                />
                <div
                  className="bg-blue-400 h-full border-l border-gray-950 shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all duration-500"
                  style={{ width: `${aheadPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] tabular-nums font-bold">
                <span className={branch.behind ? 'text-gray-300' : 'text-gray-600'}>
                  {branch.behind || 0}
                </span>
                <span className="text-gray-700">|</span>
                <span className={branch.ahead ? 'text-blue-400' : 'text-gray-600'}>
                  {branch.ahead || 0}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-radius duration-300">
              <div className="h-1 w-16 bg-gray-800 rounded-full" />
              <span className="text-[10px] text-gray-700 font-mono">0 | 0</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 xs:gap-4 w-full md:w-auto shrink-0 md:min-w-[140px] lg:min-w-[160px]">
          {!isDefault && branch.prId ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${username}/${reponame}/pulls/${branch.prId}`);
              }}
              className={`flex items-center gap-1.5 transition cursor-pointer text-[11px] font-bold px-2 py-1 rounded border 
                ${
                  branch.prStatus === 'merged'
                    ? 'text-purple-400 hover:text-purple-300 bg-purple-500/10 border-purple-500/30'
                    : branch.prStatus === 'closed'
                      ? 'text-red-400 hover:text-red-300 bg-red-500/10 border-red-500/30'
                      : 'text-green-400 hover:text-green-300 bg-green-500/10 border-green-500/30'
                }`}
            >
              {branch.prStatus === 'merged' ? (
                <GitMerge className="w-3 h-3" />
              ) : branch.prStatus === 'closed' ? (
                <X className="w-3 h-3" />
              ) : (
                <GitPullRequest className="w-3 h-3" />
              )}
              #{branch.prNumber}
            </div>
          ) : !isDefault && branch.ahead! > 0 ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${username}/${reponame}/pulls/new?head=${branch.name}`);
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition cursor-pointer"
            >
              <GitPullRequest className="w-3 h-3" />
              New pull request
            </div>
          ) : null}
          {!isDefault && (
            <div className="flex items-center gap-3 ml-2">
              <Pencil
                className={`w-3.5 h-3.5 transition ${
                  !canDelete
                    ? 'text-gray-800 cursor-not-allowed opacity-30'
                    : 'text-gray-600 hover:text-blue-400 cursor-pointer'
                }`}
                onClick={
                  canDelete
                    ? (e) => {
                        e.stopPropagation();
                        onEdit(branch.name);
                      }
                    : undefined
                }
              />
              <Trash2
                className={`w-4 h-4 transition ${
                  !canDelete
                    ? 'text-gray-800 cursor-not-allowed opacity-30'
                    : 'text-gray-600 hover:text-red-500 cursor-pointer'
                }`}
                onClick={canDelete ? handleDelete : undefined}
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

// --- Main Component ---
const BranchListPage = () => {
  const { username, reponame } = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const isOwner = user?.userId === username;
  const [hasWriteAccess, setHasWriteAccess] = useState(false);

  const rawBranches = useAppSelector(selectBranches);
  const isLoading = useAppSelector(selectRepositoryLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState('');

  useEffect(() => {
    if (username && reponame) {
      dispatch(getBranchesThunk({ username, reponame }));
    }
  }, [username, reponame, dispatch]);

  useEffect(() => {
    if (username && reponame && user) {
      if (isOwner) {
        setHasWriteAccess(true);
      } else {
        collaboratorService
          .checkAccess(username, reponame)
          .then((data) => {
            setHasWriteAccess(data.hasAccess && data.role !== 'read');
          })
          .catch(() => setHasWriteAccess(false));
      }
    }
  }, [username, reponame, user, isOwner]);

  const filteredBranches = useMemo(
    () =>
      rawBranches.filter((b) => {
        const name = typeof b === 'string' ? b : b.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      }),
    [rawBranches, searchTerm],
  );

  const handleCreateBranch = useCallback(
    async (newBranch: string, fromBranch: string) => {
      const result = await dispatch(
        createBranchThunk({
          username: username!,
          reponame: reponame!,
          newBranch,
          fromBranch,
        }),
      );
      if (createBranchThunk.fulfilled.match(result)) {
        setShowCreateModal(false);
        setIsCreatingLoader(true);

        setTimeout(() => {
          setIsCreatingLoader(false);
          setSuccessSonar({
            isOpen: true,
            title: 'Branch Created!',
            subtitle: `Branch "${newBranch}" is ready.`,
          });
          dispatch(getBranchesThunk({ username: username!, reponame: reponame! }));
        }, 2000);
      }
    },
    [dispatch, username, reponame],
  );

  // Put this handler near handleConfirmDelete
  const handleConfirmRename = useCallback(async () => {
    if (!renameInput.trim()) return;
    const result = await dispatch(
      renameBranchThunk({
        username: username!,
        reponame: reponame!,
        branchName: selectedBranch,
        newBranchName: renameInput.trim(),
      }),
    );
    if (renameBranchThunk.fulfilled.match(result)) {
      setShowRenameModal(false);
      setRenameInput('');
      setSuccessSonar({
        isOpen: true,
        title: 'Branch Renamed',
        subtitle: `Branch has been renamed to "${renameInput.trim()}".`,
      });
      // Refresh the list after rename
      dispatch(getBranchesThunk({ username: username!, reponame: reponame! }));
    }
  }, [dispatch, username, reponame, selectedBranch, renameInput]);

  const handleEditClick = useCallback((name: string) => {
    setSelectedBranch(name);
    setRenameInput(name); // prepopulate with old name
    setShowRenameModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const result = await dispatch(
      deleteBranchThunk({
        username: username!,
        reponame: reponame!,
        branchName: selectedBranch,
      }),
    );
    if (deleteBranchThunk.fulfilled.match(result)) {
      setShowDeleteModal(false);
      dispatch(getBranchesThunk({ username: username!, reponame: reponame! }));
    }
  }, [dispatch, username, reponame, selectedBranch]);

  const handleDeleteClick = useCallback((name: string) => {
    setSelectedBranch(name);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans overflow-x-hidden">
      <AppHeader />

      <main className="max-w-6xl mx-auto w-full px-3 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8 flex-1">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-6 xs:mb-8 gap-3">
          <h1 className="text-xl xs:text-2xl font-bold">Branches</h1>
          <button
            disabled={!hasWriteAccess}
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-medium transition text-xs xs:text-sm whitespace-nowrap ${
              !hasWriteAccess
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50 border border-gray-700'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> New branch
          </button>
        </div>

        <div className="relative mb-6 xs:mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-xs xs:text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <SectionHeader title="Default" />
        <BranchTableContainer>
          {(() => {
            const mainBranch = rawBranches.find(
              (b) => (typeof b === 'string' ? b : b.name) === 'main',
            );
            const branchObj =
              typeof mainBranch === 'string'
                ? { name: mainBranch, current: true }
                : mainBranch || { name: 'main', current: true };

            return (
              <BranchRow
                branch={branchObj as GitBranch}
                isDefault
                canDelete={false}
                onDelete={() => {}}
                onEdit={handleEditClick}
                username={username!}
                reponame={reponame!}
              />
            );
          })()}

          <div className="p-3 xs:p-4 bg-gray-900/30 border-t border-gray-800 flex items-start gap-2 xs:gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 text-xs xs:text-sm min-w-0">
              <p className="font-medium text-gray-200">Your main branch isn't protected</p>
              <p className="text-gray-500 mt-1">
                Protect this branch from force pushing or deletion.
              </p>
            </div>
            <button className="text-[10px] xs:text-xs bg-gray-800 hover:bg-gray-700 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-lg border border-gray-700 transition shrink-0">
              Protect
            </button>
          </div>
        </BranchTableContainer>

        <div className="mt-10">
          <SectionHeader title="Active branches" />
          <BranchTableContainer>
            {filteredBranches
              .filter((b) => (typeof b === 'string' ? b : b.name) !== 'main')
              .map((b) => {
                const branchObj = typeof b === 'string' ? { name: b, current: false } : b;
                return (
                  <BranchRow
                    key={branchObj.name}
                    branch={branchObj as GitBranch}
                    canDelete={isOwner || branchObj.createdBy === user?.id}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditClick}
                    username={username!}
                    reponame={reponame!}
                  />
                );
              })}
            {filteredBranches.filter((b) => (typeof b === 'string' ? b : b.name) !== 'main')
              .length === 0 && (
              <div className="p-10 text-center text-gray-500 text-sm italic">
                No active branches found.
              </div>
            )}
          </BranchTableContainer>
        </div>
      </main>

      <AppFooter />

      <CreateBranchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateBranch}
        currentBranch="main"
        branches={rawBranches}
        isLoading={isLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemPath={selectedBranch}
        itemName="branch"
        isLoading={isLoading}
      />

      {isCreatingLoader && <CommonLoader message="Setting up your branch..." />}

      {successSonar.isOpen && (
        <SuccessSonar
          isOpen={successSonar.isOpen}
          onClose={() => setSuccessSonar((prev) => ({ ...prev, isOpen: false }))}
          title={successSonar.title}
          subtitle={successSonar.subtitle}
        />
      )}

      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden p-6">
            <h3 className="text-xl font-bold text-white mb-2">Rename Branch</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter a new name for the branch{' '}
              <span className="text-blue-400 font-mono">{selectedBranch}</span>.
            </p>
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition mb-6 font-mono"
              placeholder="e.g. feature/new-logic"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="text-sm text-gray-400 hover:text-white transition px-4 py-2"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRename}
                disabled={isLoading || renameInput === selectedBranch || !renameInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
              >
                {isLoading ? 'Renaming...' : 'Rename Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helpers ---
const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{title}</h2>
);

const BranchTableContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
    <div className="hidden md:grid lg:grid-cols-[1fr,150px,120px,120px,160px] md:grid-cols-[minmax(0,1fr)_130px_110px_140px] gap-4 px-4 py-3 bg-gray-950/50 border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      <div>Branch</div>
      <div>Updated</div>
      <div className="hidden lg:block">Check status</div>
      <div className="text-center">Behind/Ahead</div>
      <div className="text-right pr-2">Pull request</div>
    </div>
    {children}
  </div>
);

export default BranchListPage;
