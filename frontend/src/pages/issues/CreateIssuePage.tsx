import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CircleDot, Users, X, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { createIssueThunk } from '../../features/issues/issueThunk';
import { selectIssueLoading, selectIssueError } from '../../features/issues/issueSelector';
import { selectAuthUser } from '../../features/auth/authSelectors';
import AppHeader from '../../types/common/Layout/AppHeader';
import AppFooter from '../../types/common/Layout/AppFooter';
import { ROUTES } from '../../constants/routes';
import { IssuePriority } from '../../types/issues/issues.types';
import { collaboratorService } from '../../services/collaborator.service';

import { CommonLoader } from '../../types/common/Layout/Loader';

interface Collaborator {
  username: string;
  role: string;
}

const CreateIssuePage = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { username, reponame } = useParams();
  const isLoading = useAppSelector(selectIssueLoading);
  const error = useAppSelector(selectIssueError);
  const authUser = useAppSelector(selectAuthUser);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [isCreatingLoader, setIsCreatingLoader] = useState(false);

  // Assignees state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch collaborators on mount
  useEffect(() => {
    if (username && reponame) {
      collaboratorService
        .getCollaborators(username, reponame)
        .then((data) => {
          const collabs = data.map((c: { username: string; role: string }) => ({
            username: c.username,
            role: c.role,
          }));
          // Also include the repo owner
          if (!collabs.find((c: Collaborator) => c.username === username)) {
            collabs.unshift({ username: username!, role: 'owner' });
          }
          // Filter out the current user so they can't assign themselves
          const filteredCollabs = collabs.filter(
            (c: Collaborator) => c.username !== authUser?.userId,
          );
          setCollaborators(filteredCollabs);
        })
        .catch(() => setCollaborators([]));
    }
  }, [username, reponame, authUser?.userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAssignee = useCallback((uname: string) => {
    setAssignees((prev) =>
      prev.includes(uname) ? prev.filter((a) => a !== uname) : [...prev, uname],
    );
  }, []);

  const removeAssignee = useCallback((uname: string) => {
    setAssignees((prev) => prev.filter((a) => a !== uname));
  }, []);

  const filteredCollaborators = collaborators.filter(
    (c) =>
      c.username.toLowerCase().includes(assigneeSearch.toLowerCase()) &&
      !assignees.includes(c.username),
  );

  const handleAddLabel = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && labelInput.trim()) {
        setLabels((prev) => [...prev, labelInput.trim()]);
        setLabelInput('');
      }
    },
    [labelInput],
  );

  const handleRemoveLabel = useCallback((label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title) return;
    const result = await dispatch(
      createIssueThunk({
        username: username!,
        reponame: reponame!,
        dto: { title, description, priority, labels, assignees },
      }),
    );
    if (createIssueThunk.fulfilled.match(result)) {
      setIsCreatingLoader(true);
      setTimeout(() => {
        setIsCreatingLoader(false);
        navigate(`/${username}/${reponame}/issues`, {
          state: {
            showSonar: true,
            sonarTitle: 'Issue Created!',
            sonarSubtitle: `Successfully created issue: ${title}`,
          },
        });
      }, 1500);
    }
  }, [dispatch, username, reponame, title, description, priority, labels, assignees, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">
      <AppHeader />

      <div className="border-b border-gray-800 px-3 xs:px-4 sm:px-6 py-2">
        <div className="max-w-3xl mx-auto flex items-center gap-1 text-xs xs:text-sm min-w-0 flex-wrap">
          <Link to={ROUTES.REPO_LIST} className="text-blue-400 hover:underline">
            {username}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}`} className="text-blue-400 hover:underline">
            {reponame}
          </Link>
          <span className="text-gray-600">/</span>
          <Link to={`/${username}/${reponame}/issues`} className="text-blue-400 hover:underline">
            Issues
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">New</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 w-full flex-1">
        <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6">
          <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
            <CircleDot className="w-4 h-4 xs:w-5 xs:h-5 text-green-400" />
          </div>
          <h1 className="text-white text-lg xs:text-xl font-bold">New Issue</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 xs:p-5 sm:p-6 space-y-4 xs:space-y-5">
          <div>
            <label className="block text-gray-400 text-xs mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2">Priority</label>
            <div className="flex flex-wrap items-center gap-2">
              {(['low', 'medium', 'high'] as IssuePriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 xs:px-4 py-1.5 text-xs rounded-lg border capitalize transition ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : p === 'medium'
                          ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                          : 'bg-gray-700 border-gray-500 text-gray-300'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div ref={dropdownRef}>
            <label className="block text-gray-400 text-xs mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Assignees
            </label>

            {/* Selected assignees */}
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {assignees.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] text-white font-bold">
                      {a[0].toUpperCase()}
                    </div>
                    {a}
                    <button
                      onClick={() => removeAssignee(a)}
                      className="hover:text-red-400 transition ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown trigger */}
            <button
              onClick={() => setShowAssigneeDropdown((prev) => !prev)}
              className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:border-gray-600 transition"
            >
              <span>
                {assignees.length > 0
                  ? `${assignees.length} assignee${assignees.length > 1 ? 's' : ''} selected`
                  : 'Select collaborators to assign...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showAssigneeDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {showAssigneeDropdown && (
              <div className="mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10 relative">
                <div className="p-2 border-b border-gray-700">
                  <input
                    type="text"
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    placeholder="Search collaborators..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                    autoFocus
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredCollaborators.length > 0 ? (
                    filteredCollaborators.map((c) => (
                      <button
                        key={c.username}
                        onClick={() => toggleAssignee(c.username)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-700/50 transition"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                          {c.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-200 flex-1">{c.username}</span>
                        <span className="text-[10px] text-gray-500 capitalize px-1.5 py-0.5 bg-gray-900 rounded">
                          {c.role}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-3 italic">
                      {assigneeSearch
                        ? 'No matching collaborators'
                        : 'All collaborators have been assigned'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2">Labels (press Enter to add)</label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder="Add a label..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  >
                    {label}
                    <button
                      onClick={() => handleRemoveLabel(label)}
                      className="hover:text-red-400 transition"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col xs:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate(`/${username}/${reponame}/issues`)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition"
            >
              {isLoading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </div>
      </main>

      <AppFooter />

      {isCreatingLoader && <CommonLoader message="Creating Issue..." />}
    </div>
  );
});

export default CreateIssuePage;
