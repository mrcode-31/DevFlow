import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Mail, Shield, Trash2 } from 'lucide-react';

export default function WorkspaceSettingsModal({ isOpen, onClose, workspaceId }) {
  const { api, user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchWorkspace = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}`);
        if (res.data.success) setWorkspace(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [api, workspaceId, isOpen]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviteError('');
    setInviteLoading(true);

    try {
      const res = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
      if (res.data.success) {
        setWorkspace(res.data.data); // backend returns updated workspace
        setEmail('');
        setRole('Viewer');
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  if (!isOpen) return null;
  if (loading) return <div className="p-4 text-center">Loading settings...</div>;
  if (!workspace) return <div className="p-4 text-destructive">Workspace not found</div>;

  const isOwner = String(workspace.owner) === String(user?._id || user?.id);
  const myMemberInfo = workspace.members?.find(m => String(m.user?._id || m.user) === String(user?._id || user?.id));
  const myRole = isOwner ? 'Owner' : (myMemberInfo?.role || 'Viewer');
  const canManageMembers = myRole === 'Owner' || myRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      {canManageMembers && (
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h3 className="font-semibold text-sm mb-3">Invite Member</h3>
          <form onSubmit={handleInvite} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
            </div>
            <select 
              value={role}
              onChange={e => setRole(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-32"
            >
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Developer">Developer</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button 
              type="submit"
              disabled={inviteLoading || !email}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              Invite
            </button>
          </form>
        </div>
      )}

      {/* Members List */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Workspace Members
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {/* Owner row (mock user details since owner might just be an ID if not fully populated) */}
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                O
              </div>
              <div>
                <p className="text-sm font-medium">Workspace Owner</p>
                <p className="text-xs text-muted-foreground">Owner</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">Owner</span>
          </div>

          {workspace.members?.map((member, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  {member.user?.name ? member.user.name.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.user?.name || 'Member'}</p>
                  <p className="text-xs text-muted-foreground">{member.user?.email || member.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {member.role}
                </span>
                {canManageMembers && (
                  <button className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button 
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
}
