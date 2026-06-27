import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { Plus, Folder, Star, Settings2 } from 'lucide-react';
import Modal from '../../../shared/components/Modal';
import CreateProjectModal from '../../projects/components/CreateProjectModal';
import WorkspaceSettingsModal from '../components/WorkspaceSettingsModal';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const { api } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const [wsRes, projRes] = await Promise.all([
          api.get(`/workspaces/${workspaceId}`),
          api.get(`/workspaces/${workspaceId}/projects`)
        ]);
        
        if (wsRes.data.success) setWorkspace(wsRes.data.data);
        if (projRes.data.success) setProjects(projRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [api, workspaceId]);

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const toggleBookmark = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.patch(`/projects/${projectId}/bookmark`);
      if (res.data.success) {
        setProjects(prev => prev.map(p => p._id === projectId ? res.data.data : p));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  if (loading) return <div className="animate-pulse">Loading workspace...</div>;
  if (!workspace) return <div className="text-destructive">Workspace not found.</div>;

  const { user } = useAuth();
  // Get my role
  const isOwner = String(workspace.owner) === String(user?._id || user?.id);
  const myMemberInfo = workspace.members?.find(m => String(m.user?._id || m.user) === String(user?._id || user?.id));
  const myRole = isOwner ? 'Owner' : (myMemberInfo?.role || 'Viewer');
  
  const canManageProjects = ['Owner', 'Admin', 'Project Manager'].includes(myRole);
  const canManageSettings = ['Owner', 'Admin'].includes(myRole);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
            {canManageSettings && (
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                title="Workspace Settings"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            {workspace.description || 'No description provided.'}
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium border border-primary/20">
              My Role: {myRole}
            </span>
          </p>
        </div>
        {canManageProjects && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={`${workspace.name} Settings`}>
        <WorkspaceSettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          workspaceId={workspaceId}
        />
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Project">
        <CreateProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleProjectCreated}
          workspaceId={workspaceId}
        />
      </Modal>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        
        {projects.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Get started by creating your first project.</p>
            {canManageProjects && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => {
              const isBookmarked = project.bookmarkedBy?.includes(user?._id || user?.id);
              return (
              <Link 
                key={project._id} 
                to={`/projects/${project._id}`}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors group relative flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{project.name}</h3>
                  </div>
                  <button 
                    onClick={(e) => toggleBookmark(e, project._id)}
                    className={`transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                  >
                    <Star className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2 mt-2 flex-1">
                  {project.description || 'No description provided.'}
                </p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-secondary rounded-full font-medium text-foreground">
                    {project.status}
                  </span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Workspace Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workspace.members?.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg">
                {member.user?.name ? member.user.name.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{member.user?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
