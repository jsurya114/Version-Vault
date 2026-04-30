import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  GitCommit,
  Terminal,
  ChevronDown,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { workflowService, WorkflowRun } from '../../services/workflow.service';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';

const statusConfig = {
  QUEUED: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Queued',
  },
  RUNNING: {
    icon: Loader2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Running',
  },
  SUCCESS: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    label: 'Success',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Failed',
  },
};

const ActionsPage = () => {
  const { username, reponame } = useParams();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    if (!username || !reponame) return;
    try {
      const data = await workflowService.listRuns(username, reponame);
      setRuns(data);
    } catch (error) {
      console.error('Failed to fetch workflow runs:', error);
    } finally {
      setLoading(false);
    }
  }, [username, reponame]);

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 10000);
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const handleToggleRun = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      setSelectedRun(null);
      return;
    }
    setExpandedRunId(runId);
    setRunLoading(true);
    try {
      const data = await workflowService.getRun(runId);
      setSelectedRun(data);
    } catch (error) {
      console.error('Failed to fetch run details:', error);
    } finally {
      setRunLoading(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AppHeader />

      {/* Header bar */}
      <div className="border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/${username}/${reponame}`)}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h1 className="text-lg font-semibold">Actions</h1>
            </div>
            <span className="text-gray-500 text-sm">
              {username}/{reponame}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
              {runs.length} run{runs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : runs.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Play className="w-7 h-7 text-gray-600" />
              </div>
              <h2 className="text-white text-lg font-semibold mb-2">No workflow runs yet</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                CI/CD is enabled for this repository. Push a commit or merge a pull request to
                trigger your first pipeline run automatically.
              </p>
            </div>
          ) : (
            /* Runs list */
            <div className="space-y-2">
              {runs.map((run) => {
                const config = statusConfig[run.status];
                const StatusIcon = config.icon;
                const isExpanded = expandedRunId === run._id;

                return (
                  <div key={run._id} className="border border-gray-800 rounded-xl overflow-hidden">
                    {/* Run row */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition hover:bg-gray-900/50 ${
                        isExpanded ? 'bg-gray-900/50 border-b border-gray-800' : ''
                      }`}
                      onClick={() => handleToggleRun(run._id)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}
                      >
                        <StatusIcon
                          className={`w-4 h-4 ${config.color} ${run.status === 'RUNNING' ? 'animate-spin' : ''}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">Pipeline Run</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${config.bg} ${config.border} ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-500 text-xs flex items-center gap-1">
                            <GitCommit className="w-3 h-3" />
                            {run.commitHash.substring(0, 7)}
                          </span>
                          <span className="text-gray-600 text-xs">{timeAgo(run.createdAt)}</span>
                        </div>
                      </div>

                      <div className="text-gray-500">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded logs */}
                    {isExpanded && (
                      <div className="bg-gray-950 border-t border-gray-800">
                        <div className="px-4 py-2.5 border-b border-gray-800/50 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-xs font-semibold">Build Logs</span>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                          {runLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                          ) : selectedRun?.logs ? (
                            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {selectedRun.logs}
                            </pre>
                          ) : (
                            <p className="text-gray-600 text-xs text-center py-6 italic">
                              No logs available yet. Waiting for the pipeline to start...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default ActionsPage;
