import { useEffect, useState, useCallback, useRef } from 'react';
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
  SkipForward,
  Circle,
} from 'lucide-react';
import { workflowService, WorkflowRun, StepResult } from '../../services/workflow.service';
import { socketService } from '../../services/socketService';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';

const runStatusConfig = {
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

const stepStatusConfig: Record<
  StepResult['status'],
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  pending: {
    icon: Circle,
    color: 'text-[#8b949e]',
    bg: '',
    border: '',
  },
  running: {
    icon: Loader2,
    color: 'text-[#58a6ff]',
    bg: '',
    border: '',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-[#238636]',
    bg: '',
    border: '',
  },
  failed: {
    icon: XCircle,
    color: 'text-[#f85149]',
    bg: '',
    border: '',
  },
  skipped: {
    icon: SkipForward,
    color: 'text-[#8b949e]',
    bg: '',
    border: '',
  },
};

const formatDuration = (ms?: number) => {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
};

const StepRow = ({
  step,
  isExpanded,
  onToggle,
}: {
  step: StepResult;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const logRef = useRef<HTMLDivElement>(null);
  const cfg = stepStatusConfig[step.status];
  const StepIcon = cfg.icon;

  useEffect(() => {
    if (isExpanded && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [step.logs, isExpanded]);

  return (
    <div className="border-b border-[#21262d] last:border-0 group/step">
      <div
        className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[#161b22] transition"
        onClick={onToggle}
      >
        <div className="text-[#8b949e] group-hover/step:text-[#e6edf3] transition-colors w-4 flex items-center justify-center">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        <StepIcon
          className={`w-4 h-4 shrink-0 ${cfg.color} ${step.status === 'running' ? 'animate-spin' : ''}`}
        />
        <span
          className={`text-sm flex-1 ${
            step.status === 'skipped' ? 'text-[#8b949e]' : 'text-[#e6edf3]'
          }`}
        >
          {step.name}
        </span>
        {step.duration != null && step.duration > 0 && (
          <span className="text-xs text-[#8b949e] font-mono">{formatDuration(step.duration)}</span>
        )}
      </div>
      {isExpanded && (
        <div
          ref={logRef}
          className="bg-[#010409] mx-11 mb-3 mt-1 rounded-md border border-[#30363d] max-h-96 overflow-y-auto"
        >
          {step.logs ? (
            <pre className="text-[12px] font-mono text-[#e6edf3] whitespace-pre-wrap leading-relaxed p-4">
              {step.logs}
            </pre>
          ) : (
            <p className="text-[#8b949e] text-xs italic p-4">
              {step.status === 'pending'
                ? 'Waiting to start...'
                : step.status === 'running'
                  ? 'Waiting for output...'
                  : 'No output'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const ActionsTabContent = ({ username, reponame }: { username: string; reponame: string }) => {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const fetchRuns = useCallback(async () => {
    if (!username || !reponame) return;
    try {
      const data = await workflowService.listRuns(username, reponame);
      setRuns(data);
      // If we have an expanded run that is still running, update it
      if (expandedRunId) {
        const updatedRun = data.find((r) => r._id === expandedRunId);
        if (updatedRun && (updatedRun.status === 'SUCCESS' || updatedRun.status === 'FAILED')) {
          // Fetch full details to get final step data
          const fullRun = await workflowService.getRun(expandedRunId);
          setSelectedRun(fullRun);
        }
      }
    } catch (error) {
      console.error('Failed to fetch workflow runs:', error);
    } finally {
      setLoading(false);
    }
  }, [username, reponame, expandedRunId]);

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 8000);
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const handleToggleRun = async (runId: string) => {
    if (expandedRunId === runId) {
      setExpandedRunId(null);
      setSelectedRun(null);
      setExpandedSteps(new Set());
      return;
    }
    setExpandedRunId(runId);
    setRunLoading(true);
    setExpandedSteps(new Set());
    try {
      const data = await workflowService.getRun(runId);
      setSelectedRun(data);
      // Auto-expand running or failed steps
      const autoExpand = new Set<number>();
      data.steps?.forEach((step, i) => {
        if (step.status === 'running' || step.status === 'failed') {
          autoExpand.add(i);
        }
      });
      setExpandedSteps(autoExpand);
    } catch (error) {
      console.error('Failed to fetch run details:', error);
    } finally {
      setRunLoading(false);
    }
  };

  const toggleStep = (stepIndex: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepIndex)) {
        next.delete(stepIndex);
      } else {
        next.add(stepIndex);
      }
      return next;
    });
  };

  // Real-time socket updates for step-level events
  useEffect(() => {
    if (!expandedRunId) return;

    socketService.joinRun(expandedRunId);

    const handleStep = (data: {
      runId: string;
      type: string;
      stepIndex?: number;
      logChunk?: string;
      status?: string;
      duration?: number;
      steps?: StepResult[];
    }) => {
      if (data.runId !== expandedRunId) return;

      if (data.type === 'steps_init' && data.steps) {
        setSelectedRun((prev) => (prev ? { ...prev, steps: data.steps! } : prev));
      }

      if (data.type === 'step_status' && data.stepIndex != null) {
        setSelectedRun((prev) => {
          if (!prev) return prev;
          const newSteps = [...(prev.steps || [])];
          if (newSteps[data.stepIndex!]) {
            newSteps[data.stepIndex!] = {
              ...newSteps[data.stepIndex!],
              status: data.status as StepResult['status'],
              ...(data.duration != null ? { duration: data.duration } : {}),
            };
          }
          return { ...prev, steps: newSteps };
        });

        // Auto-expand running steps and collapse completed ones like GitHub
        if (data.status === 'running') {
          setExpandedSteps(new Set([data.stepIndex!]));
        } else if (data.status === 'success') {
          setExpandedSteps((prev) => {
            const next = new Set(prev);
            next.delete(data.stepIndex!);
            return next;
          });
        }
      }

      if (data.type === 'step_log' && data.stepIndex != null && data.logChunk) {
        setSelectedRun((prev) => {
          if (!prev) return prev;
          const newSteps = [...(prev.steps || [])];
          if (newSteps[data.stepIndex!]) {
            newSteps[data.stepIndex!] = {
              ...newSteps[data.stepIndex!],
              logs: (newSteps[data.stepIndex!].logs || '') + data.logChunk,
            };
          }
          return { ...prev, steps: newSteps };
        });
      }
    };

    // Listen for step-level events
    const socket = socketService.getSocket();
    socket?.on('run_step', handleStep);

    // Also listen for legacy log events (backward compat)
    const handleLog = (data: { runId: string; logChunk: string }) => {
      if (data.runId === expandedRunId) {
        setSelectedRun((prev) =>
          prev ? { ...prev, logs: (prev.logs || '') + data.logChunk } : prev,
        );
      }
    };
    socketService.onRunLog(handleLog);

    return () => {
      socket?.off('run_step', handleStep);
      socketService.offRunLog(handleLog);
      socketService.leaveRun(expandedRunId);
    };
  }, [expandedRunId]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const hasSteps = selectedRun?.steps && selectedRun.steps.length > 0;

  return (
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
              const config = runStatusConfig[run.status];
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

                  {/* Expanded step-by-step view */}
                  {isExpanded && (
                    <div className="bg-[#0d1117] border-t border-[#30363d]">
                      <div className="px-4 py-3 border-b border-[#30363d] flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#8b949e]" />
                        <span className="text-[#e6edf3] text-sm font-semibold">Job Setup & Execution</span>
                        {selectedRun?.steps && (
                          <span className="text-xs text-[#8b949e] ml-auto">
                            {selectedRun.steps.filter((s) => s.status === 'success').length}/
                            {selectedRun.steps.length} passed
                          </span>
                        )}
                      </div>
                      <div className="py-0">
                        {runLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          </div>
                        ) : hasSteps ? (
                          <div>
                            {selectedRun.steps.map((step, idx) => (
                              <StepRow
                                key={`${step.name}-${idx}`}
                                step={step}
                                isExpanded={expandedSteps.has(idx)}
                                onToggle={() => toggleStep(idx)}
                              />
                            ))}
                          </div>
                        ) : selectedRun?.logs ? (
                          /* Fallback to raw logs for old runs without steps */
                          <div className="p-4 max-h-96 overflow-y-auto">
                            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                              {selectedRun.logs}
                            </pre>
                          </div>
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
  );
};

const ActionsPage = () => {
  const { username, reponame } = useParams();
  const navigate = useNavigate();

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
        </div>
      </div>

      <ActionsTabContent username={username!} reponame={reponame!} />

      <AppFooter />
    </div>
  );
};

export default ActionsPage;
