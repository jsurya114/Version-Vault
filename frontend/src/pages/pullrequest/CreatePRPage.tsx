import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GitPullRequest } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createPRThunk } from '../../features/pullrequest/prThunk';
import { selectPRLoading, selectPRError } from '../../features/pullrequest/prSelector';
import { selectBranches } from '../../features/repository/repositorySelectors';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { SuccessSonar } from '../../types/common/Layout/SuccessSonar';
import { CommonLoader } from '../../types/common/Layout/Loader';

const CreatePRPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const isLoading = useAppSelector(selectPRLoading);
  const error = useAppSelector(selectPRError);
  const branches = useAppSelector(selectBranches);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceBranch, setSourceBranch] = useState('');
  const [targetBranch, setTargetBranch] = useState('main');
  const [successSonar, setSuccessSonar] = useState({ isOpen: false, title: '', subtitle: '' });
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);

  const handleSubmit = async () => {
    if (!title || !sourceBranch || !targetBranch) return;
    const result = await dispatch(
      createPRThunk({
        username: username!,
        reponame: reponame!,
        dto: { title, description, sourceBranch, targetBranch },
      }),
    );
    if (createPRThunk.fulfilled.match(result)) {
      setIsCreatingLoader(true);
      setTimeout(() => {
        setIsCreatingLoader(false);
        setSuccessSonar({
          isOpen: true,
          title: 'Pull Request Opened!',
          subtitle: `Successfully created PR from ${sourceBranch} to ${targetBranch}.`,
        });
        // Delay navigation to show the sonar
        setTimeout(() => {
          navigate(`/${username}/${reponame}/pulls`);
        }, 2500);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      {/* Breadcrumb */}
      <div className="border-b border-gray-800 px-6 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-1 text-sm">
          <Link to={ROUTES.REPO_LIST} className="text-blue-400 hover:underline">
            {username}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}`} className="text-blue-400 hover:underline">
            {reponame}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}/pulls`} className="text-blue-400 hover:underline">
            Pull Requests
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">New</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-6 w-full flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <GitPullRequest className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-white text-xl font-bold">New Pull Request</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          {/* Branches */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-2">Source Branch</label>
              <select
                value={sourceBranch}
                onChange={(e) => setSourceBranch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Select source branch</option>
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2">Target Branch</label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-blue-500"
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="feat: add new feature"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 text-xs mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the changes in this PR..."
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/${username}/${reponame}/pulls`)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title || !sourceBranch || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              {isLoading ? 'Creating...' : 'Create Pull Request'}
            </button>
          </div>
        </div>
      </main>

      <AppFooter />

      {isCreatingLoader && <CommonLoader message="Creating Pull Request..." />}

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

export default CreatePRPage;
