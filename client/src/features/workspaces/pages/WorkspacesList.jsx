import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../../../shared/components/Modal';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

export default function WorkspacesList() {
  const { api } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await api.get('/workspaces');
        if (res.data.success) {
          setWorkspaces(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [api]);

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces(prev => [newWorkspace, ...prev]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Workspace">
        <CreateWorkspaceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleWorkspaceCreated}
        />
      </Modal>

      {loading ? (
        <div className="text-muted-foreground animate-pulse">Loading workspaces...</div>
      ) : workspaces.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No workspaces found</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Create a workspace to start collaborating on projects.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
          >
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(workspace => (
            <Link 
              key={workspace._id} 
              to={`/workspaces/${workspace._id}`}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors">{workspace.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2 flex-1">
                {workspace.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <span>{workspace.members?.length || 0} members</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
