import { useEffect, useState, useCallback } from 'react';
import { Mail, Shield, Trash2, UserPlus, Users, Crown, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

import {
  sendInvitationThunk,
  getPendingInvitationsThunk,
} from '../../../features/collaborator/invitationThunk';
import {
  selectInvitationLoading,
  selectInvitationError,
  selectInvitationSuccess,
  selectPendingInvitations,
} from '../../../features/collaborator/invitationSelectors';
import {
  clearInvitationError,
  clearInvitationSuccess,
} from '../../../features/collaborator/invitationSlice';
import { collaboratorService } from '../../../services/collaborator.service';

interface Collaborator {
  id: string;
  collaboratorId: string;
  collaboratorUsername: string;
  role: string;
  createdAt?: string;
}

interface CollaboratorsTabContentProps {
  username: string;
  reponame: string;
  isOwner: boolean;
}

const CollaboratorsTabContent = ({ username, reponame, isOwner }: CollaboratorsTabContentProps) => {
  const dispatch = useAppDispatch();
  const invLoading = useAppSelector(selectInvitationLoading);
  const invError = useAppSelector(selectInvitationError);
  const invSuccess = useAppSelector(selectInvitationSuccess);
  const pendingInvitations = useAppSelector(selectPendingInvitations);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collabLoading, setCollabLoading] = useState(true);
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeRole, setInviteeRole] = useState('read');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  // Fetch collaborators
  const fetchCollaborators = useCallback(async () => {
    try {
      setCollabLoading(true);
      const data = await collaboratorService.getCollaborators(username, reponame);
      setCollaborators(data);
    } catch {
      // handle silently
    } finally {
      setCollabLoading(false);
    }
  }, [username, reponame]);

  useEffect(() => {
    fetchCollaborators();
    if (isOwner) {
      dispatch(getPendingInvitationsThunk());
    }
  }, [fetchCollaborators, isOwner, dispatch]);

  // Clear messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearInvitationError());
      dispatch(clearInvitationSuccess());
    };
  }, [dispatch]);

  // Auto-clear success message
  useEffect(() => {
    if (invSuccess) {
      const timer = setTimeout(() => dispatch(clearInvitationSuccess()), 4000);
      return () => clearTimeout(timer);
    }
  }, [invSuccess, dispatch]);

  const handleSendInvitation = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inviteeEmail.trim()) return;
      dispatch(
        sendInvitationThunk({
          username,
          reponame,
          inviteeEmail: inviteeEmail.trim(),
          role: inviteeRole,
        }),
      ).then((result: unknown) => {
        if (sendInvitationThunk.fulfilled.match(result)) {
          setInviteeEmail('');
          setInviteeRole('read');
        }
      });
    },
    [dispatch, username, reponame, inviteeEmail, inviteeRole],
  );

  const handleUpdateRole = useCallback(
    async (collabUsername: string, newRole: string) => {
      setUpdatingRole(collabUsername);
      try {
        await collaboratorService.updateRole(username, reponame, collabUsername, newRole);
        setCollaborators((prev) =>
          prev.map((c) =>
            c.collaboratorUsername === collabUsername ? { ...c, role: newRole } : c,
          ),
        );
      } catch {
        // handle silently
      } finally {
        setUpdatingRole(null);
      }
    },
    [username, reponame],
  );

  const handleRemove = useCallback(
    async (collabUsername: string) => {
      setRemovingUser(collabUsername);
      try {
        await collaboratorService.removeCollaborator(username, reponame, collabUsername);
        setCollaborators((prev) => prev.filter((c) => c.collaboratorUsername !== collabUsername));
      } catch {
        // handle silently
      } finally {
        setRemovingUser(null);
      }
    },
    [username, reponame],
  );

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'write':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-700/50 text-gray-400 border-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 w-full flex-1">
      {/* Invite Section — Owner Only */}
      {isOwner && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="text-white text-base font-semibold">Invite Collaborator</h3>
          </div>

          <form onSubmit={handleSendInvitation} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="email"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <select
              value={inviteeRole}
              onChange={(e) => setInviteeRole(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={invLoading || !inviteeEmail.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition flex items-center gap-2"
            >
              {invLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Send Invite
            </button>
          </form>

          {invError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{invError}</p>
            </div>
          )}
          {invSuccess && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">{invSuccess}</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Invitations — Owner Only */}
      {isOwner && pendingInvitations.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white text-sm font-semibold">
              Pending Invitations ({pendingInvitations.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-800">
            {pendingInvitations
              .filter((inv) => inv.repositoryName === reponame)
              .map((inv) => (
                <div
                  key={inv.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30 transition gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{inv.inviteeEmail}</p>
                      <p className="text-gray-500 text-xs">Invitation pending</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border capitalize ${getRoleBadgeClasses(inv.role)}`}
                  >
                    {inv.role}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Collaborators List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="text-white text-sm font-semibold">
            Collaborators ({collaborators.length})
          </h3>
        </div>

        {collabLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collaborators.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No collaborators yet</p>
            {isOwner && (
              <p className="text-gray-600 text-xs mt-1">
                Invite collaborators using the form above
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {/* Owner entry */}
            <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/20 transition gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{username}</p>
                    <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  </div>
                  <p className="text-gray-500 text-xs truncate">Repository owner</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                owner
              </span>
            </div>

            {/* Collaborators */}
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/20 transition gap-2 flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {collab.collaboratorUsername[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{collab.collaboratorUsername}</p>
                    <p className="text-gray-500 text-xs truncate">
                      Joined{' '}
                      {collab.createdAt
                        ? new Date(collab.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <>
                      <div className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1">
                        <Shield className="w-3 h-3 text-gray-500" />
                        <select
                          value={collab.role}
                          onChange={(e) =>
                            handleUpdateRole(collab.collaboratorUsername, e.target.value)
                          }
                          disabled={updatingRole === collab.collaboratorUsername}
                          className="bg-transparent text-gray-300 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="read">Read</option>
                          <option value="write">Write</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleRemove(collab.collaboratorUsername)}
                        disabled={removingUser === collab.collaboratorUsername}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Remove collaborator"
                      >
                        {removingUser === collab.collaboratorUsername ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border capitalize ${getRoleBadgeClasses(collab.role)}`}
                    >
                      {collab.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorsTabContent;
