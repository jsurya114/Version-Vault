import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../app/store';
import { RepositoryResponseDTO } from '../../../types/repository/repositoryTypes';
import { sendAgentMessageThunk } from '../../../features/ai-agent/aiAgentThunk';
import { selectAiAgentStatus } from '../../../features/ai-agent/aiAgentSelector';
import { selectIsPro } from '../../../features/subscription/subscriptionSelector';
import { getSubscriptionStatusThunk } from '../../../features/subscription/subscriptionThunks';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import {
  FolderPlus,
  FileText,
  Terminal,
  Cpu,
  Layers,
  Package,
  Lock,
  Globe,
  Sparkles,
  AlertCircle,
  Crown,
} from 'lucide-react';

interface AiAgentRepoCreatorProps {
  onRepoCreated: (repoData: RepositoryResponseDTO) => void;
}

export const AiAgentRepoCreator: React.FC<AiAgentRepoCreatorProps> = ({ onRepoCreated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectAiAgentStatus);
  const isPro = useSelector(selectIsPro);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(getSubscriptionStatusThunk());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectBrief: '',
    visibility: 'public',
    techStack: [] as string[],
    architecture: '',
    dependencies: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  if (!isPro) {
    return (
      <div className="w-full h-[650px] bg-gray-50 dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
        <div className="text-center px-8 z-10">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg">
              <Crown className="w-3 h-3" />
            </div>
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            AI Architect Locked
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 max-w-[280px] mx-auto font-medium">
            Project scaffolding via AI is a Pro feature. Upgrade to unlock instant boilerplate
            generation.
          </p>
          <Link
            to={ROUTES.SUBSCRIPTION}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Crown className="w-4 h-4" />
            UPGRADE TO PRO
          </Link>
        </div>
      </div>
    );
  }

  const techOptions = [
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'PostgreSQL',
    'TypeScript',
    'JavaScript',
    'Python',
    'Django',
    'Flask',
    'FastAPI',
    'Java',
    'Spring Boot',
    'Go',
    'Rust',
    'Next.js',
    'Vue.js',
    'Angular',
    'TailwindCSS',
    'Docker',
    'Redis',
    'GraphQL',
  ];
  const architectureOptions = [
    'None',
    'MVC',
    'Monolithic',
    'Microservices',
    'Hexagonal',
    'Clean Architecture',
  ];

  const handleTechToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isLoading) return;

    setErrorMessage('');

    const resultAction = await dispatch(sendAgentMessageThunk(formData));

    if (sendAgentMessageThunk.fulfilled.match(resultAction)) {
      if (resultAction.payload.repo) {
        onRepoCreated(resultAction.payload.repo);
      } else {
        setErrorMessage(resultAction.payload.response || 'Unknown generation error');
      }
    } else {
      setErrorMessage((resultAction.payload as string) || 'Failed to communicate with AI');
    }
  };

  return (
    <div className="w-full h-[650px] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 custom-scrollbar">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Repository Architect</h2>
            <p className="text-sm text-blue-100 mt-1">
              Design and scaffold your next project instantly.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Fields Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <FolderPlus className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Core Info
              </h3>
              <span className="ml-auto text-xs font-medium text-red-500">Required</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repository Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                placeholder="e.g. awesome-ai-project"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value.replace(/\s+/g, '-') })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Brief{' '}
                <span className="text-gray-500 font-normal text-xs ml-1">(Optional)</span>
              </label>
              <textarea
                placeholder="Describe what the app does... e.g. A task manager with user authentication and real-time updates."
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500"
                value={formData.projectBrief}
                onChange={(e) => setFormData({ ...formData, projectBrief: e.target.value })}
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Visibility
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.visibility === 'public' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <Globe className="w-4 h-4" />
                  <input
                    type="radio"
                    className="hidden"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={() => setFormData({ ...formData, visibility: 'public' })}
                  />
                  <span className="text-sm font-medium">Public</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.visibility === 'private' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <Lock className="w-4 h-4" />
                  <input
                    type="radio"
                    className="hidden"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={() => setFormData({ ...formData, visibility: 'private' })}
                  />
                  <span className="text-sm font-medium">Private</span>
                </label>
              </div>
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Architecture & Config
              </h3>
              <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400">
                Optional
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Description
              </label>
              <input
                placeholder="A short description for the repository..."
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Tech Stack
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1 pb-1">
                {techOptions.map((tech) => (
                  <button
                    type="button"
                    key={tech}
                    onClick={() => handleTechToggle(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      formData.techStack.includes(tech)
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20 scale-105'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 hover:text-purple-500 dark:hover:text-purple-400'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Architecture
                </label>
                <div className="relative">
                  <select
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none text-sm"
                    value={formData.architecture}
                    onChange={(e) => setFormData({ ...formData, architecture: e.target.value })}
                  >
                    <option value="" disabled>
                      Select style...
                    </option>
                    {architectureOptions.map((arch) => (
                      <option key={arch} value={arch}>
                        {arch}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Dependencies
                </label>
                <input
                  placeholder="lodash, axios..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm placeholder-gray-400 dark:placeholder-gray-500"
                  value={formData.dependencies}
                  onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl shadow-lg hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Architecting Project...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Generate Repository</span>
                <div className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.3)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] transition-all duration-500 group-hover:bg-[position:100%_100%]"></div>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};
