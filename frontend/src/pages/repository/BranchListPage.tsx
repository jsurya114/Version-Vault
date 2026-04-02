import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch as GitBranchIcon,
  Search,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  GitPullRequest,
  Info,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  getBranchesThunk,
  createBranchThunk,
  deleteBranchThunk,
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
    isOwner,
    onDelete,
    username,
    reponame,
  }: {
    branch: GitBranch;
    isDefault?: boolean;
    isOwner: boolean;
    onDelete: (name: string) => void;
    username: string;
    reponame: string;
  }) => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(branch.name);
      },
      [onDelete, branch.name],
    );

    return (
      <div
        onClick={() => navigate(`/${username}/${reponame}/tree/${branch.name}`)}
        className="grid grid-cols-[1fr,150px,120px,120px,100px] gap-4 px-4 py-4 items-center hover:bg-white/[0.05] cursor-pointer transition text-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 px-2.5 py-1.5 rounded-md text-blue-400 font-mono text-xs flex items-center gap-2 border border-blue-500/20">
            <GitBranchIcon className="w-3.5 h-3.5" /> {branch.name}
          </div>
          {isDefault && (
            <span className="text-[9px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase ring-1 ring-gray-700">
              Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-gray-400 text-xs">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[7px] font-bold text-white uppercase shadow-sm overflow-hidden border border-gray-800">
            {isOwner && user?.avatar ? (
              <img
                src={user.avatar}
                alt={branch.lastCommitAuthor}
                className="w-full h-full object-cover"
              />
            ) : (
              branch.lastCommitAuthor?.[0] || 'U'
            )}
          </div>
          <span>{timeAgo(branch.lastCommitDate || '')}</span>
        </div>

        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            branch.status === 'success'
              ? 'text-green-500'
              : branch.status === 'failure'
                ? 'text-red-500'
                : branch.status === 'pending'
                  ? 'text-yellow-500'
                  : 'text-gray-600'
          }`}
        >
          {branch.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {branch.status === 'failure' && <X className="w-3.5 h-3.5 text-red-500" />}
          {branch.status === 'pending' && <Clock className="w-3.5 h-3.5 animate-spin" />}

          <span>{branch.checks || '--'}</span>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex bg-gray-800/50 h-1.5 w-16 rounded-full overflow-hidden ring-1 ring-white/5">
            <div className="bg-gray-600 h-full" style={{ width: '60%' }} />
            <div className="bg-blue-500 h-full border-l border-gray-950" style={{ width: '40%' }} />
          </div>
          <span className="text-[10px] text-gray-500 ml-2.5 tabular-nums">3 | 2</span>
        </div>

        <div className="flex items-center justify-end gap-4">
          {!isDefault && (
            <div className="flex items-center gap-1.5 text-gray-500 hover:text-blue-400 transition cursor-pointer text-[10px] font-bold">
              <GitPullRequest className="w-3.5 h-3.5" /> #4
            </div>
          )}
          {!isDefault && (
            <Trash2
              className={`w-4 h-4 transition ${
                !isOwner
                  ? 'text-gray-800 cursor-not-allowed opacity-30'
                  : 'text-gray-600 hover:text-red-500 cursor-pointer'
              }`}
              onClick={isOwner ? handleDelete : undefined}
            />
          )}
        </div>
      </div>
    );
  },
);

// --- Component ---
const BranchListPage = () => {
  const { username, reponame } = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const isOwner = user?.userId === username;

  // Safely select branches and ensure we handle both object array and string array (though it should now be objects)
  const rawBranches = useAppSelector(selectBranches);
  const isLoading = useAppSelector(selectRepositoryLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });

  useEffect(() => {
    if (username && reponame) {
      dispatch(getBranchesThunk({ username, reponame }));
    }
  }, [username, reponame, dispatch]);

  // Fixed filtering: handle object structure
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

        // Show loader for 2 seconds, then show sonar and refresh data
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <AppHeader />

      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Branches</h1>
          <button
            disabled={!isOwner}
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              !isOwner
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50 border border-gray-700'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> New branch
          </button>
        </div>

        {/* Tabs */}
        {/* <div className="flex border-b border-gray-800 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${
                activeTab === tab 
                  ? 'border-blue-500 text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div> */}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Default Branch Section */}
        <SectionHeader title="Default" />
        <BranchTableContainer>
          {(() => {
            const mainBranch = rawBranches.find(
              (b) => (typeof b === 'string' ? b : b.name) === 'main',
            ) || { name: 'main' };
            const branchObj = typeof mainBranch === 'string' ? { name: mainBranch } : mainBranch;
            return (
              <BranchRow
                branch={branchObj}
                isDefault
                isOwner={isOwner}
                onDelete={() => {}}
                username={username!}
                reponame={reponame!}
              />
            );
          })()}

          <div className="p-4 bg-gray-900/30 border-t border-gray-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-gray-200">Your main branch isn't protected</p>
              <p className="text-gray-500 mt-1">
                Protect this branch from force pushing or deletion.
              </p>
            </div>
            <button className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 transition">
              Protect
            </button>
          </div>
        </BranchTableContainer>

        {/* Active Branches */}
        <div className="mt-10">
          <SectionHeader title="Active branches" />
          <BranchTableContainer>
            {filteredBranches
              .filter((b) => (typeof b === 'string' ? b : b.name) !== 'main')
              .map((b) => {
                const branchObj = typeof b === 'string' ? { name: b } : b;
                return (
                  <BranchRow
                    key={branchObj.name}
                    branch={branchObj}
                    isOwner={isOwner}
                    onDelete={handleDeleteClick}
                    username={username!}
                    reponame={reponame!}
                  />
                );
              })}
            {filteredBranches.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-sm italic">
                No other branches found.
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
    </div>
  );
};

// --- Styled Components Helper ---
const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{title}</h2>
);

const BranchTableContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
    <div className="grid grid-cols-[1fr,150px,120px,120px,100px] gap-4 px-4 py-3 bg-gray-950/50 border-b border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      <div>Branch</div>
      <div>Updated</div>
      <div>Check status</div>
      <div className="text-center">Behind/Ahead</div>
      <div className="text-right pr-2">Pull request</div>
    </div>
    {children}
  </div>
);

export default BranchListPage;
