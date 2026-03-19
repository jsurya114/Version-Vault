import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import {
  getRepositoryThunk,
  deleteRepositoryThunk,
} from 'src/features/repository/repositoryThunks';
import {
  selectSelectedRepository,
  selectRepositoryLoading,
} from 'src/features/repository/repositorySelectors';
import { selectAuthUser } from 'src/features/auth/authSelectors';
import { ROUTES } from 'src/constants/routes';
const RepositoryDetailPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const repo = useAppSelector(selectSelectedRepository);
  const isLoading = useAppSelector(selectRepositoryLoading);
  const user = useAppSelector(selectAuthUser);
  const [copied, setCopied] = useState(false);

  const cloneUrl = `http://localhost:3125/vv/git/${username}/${reponame}.git`;
  const isOwner = user?.userId === username;
  useEffect(() => {
    if (username && reponame) {
      dispatch(getRepositoryThunk({ username, reponame }));
    }
  }, [username, reponame]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${reponame}"? This cannot be undone.`)) return;
    await dispatch(deleteRepositoryThunk({ username: username!, reponame: reponame! }));
    navigate(ROUTES.REPO_LIST);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!repo) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <span className="font-bold text-white text-sm">VersionVault</span>
          </Link>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm">
            <Link to={ROUTES.REPO_LIST} className="text-blue-400 hover:underline">
              {username}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white font-semibold">{reponame}</span>
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded border ${
                repo.visibility === 'public'
                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                  : 'border-gray-600 text-gray-400 bg-gray-700'
              }`}
            >
              {repo.visibility}
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.username?.[0]?.toUpperCase()}
        </div>
      </nav>

      {/* Repo Tabs */}
      <div className="border-b border-gray-800 px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-1">
          {['Code', 'Issues', 'Pull Requests', 'Settings'].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm transition border-b-2 ${
                i === 0
                  ? 'text-white border-blue-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Repo Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-white text-xl font-bold">{repo.name}</h1>
            </div>
            {repo.description && <p className="text-gray-400 text-sm">{repo.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
              <span>⭐ {repo.stars} stars</span>
              <span>🍴 {repo.forks} forks</span>
              <span>🌿 {repo.defaultBranch}</span>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg transition"
            >
              Delete Repository
            </button>
          )}
        </div>

        {/* Clone URL */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white text-sm font-semibold">Clone Repository</h3>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
              HTTP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={cloneUrl}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                copied
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Empty State — Git Commands */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">
            Quick setup — get started with this repository
          </h3>

          {/* New repo */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm font-medium mb-2">
              ...or create a new repository on the command line
            </p>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs space-y-1">
              {[
                'echo "# ' + repo.name + '" >> README.md',
                'git init',
                'git add README.md',
                'git commit -m "first commit"',
                'git branch -M ' + repo.defaultBranch,
                'git remote add origin ' + cloneUrl,
                'git push -u origin ' + repo.defaultBranch,
              ].map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-600 select-none w-4 text-right">{i + 1}</span>
                  <span
                    className={
                      line.includes('remote') || line.includes('push')
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    }
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Existing repo */}
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">
              ...or push an existing repository from the command line
            </p>
            <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs space-y-1">
              {[
                'git remote add origin ' + cloneUrl,
                'git branch -M ' + repo.defaultBranch,
                'git push -u origin ' + repo.defaultBranch,
              ].map((line, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gray-600 select-none w-4 text-right">{i + 1}</span>
                  <span className="text-blue-400">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RepositoryDetailPage;
