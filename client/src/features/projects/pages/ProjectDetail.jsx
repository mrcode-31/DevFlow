import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import KanbanBoard from '../../kanban/components/KanbanBoard';
import Modal from '../../../shared/components/Modal';
import CreateTaskModal from '../../tasks/components/CreateTaskModal';
import TaskDrawer from '../../tasks/components/TaskDrawer';
import { Plus, Settings2, ArrowLeft } from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { api, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [drawerTaskId, setDrawerTaskId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`)
        ]);
        if (projectRes.data.success) setProject(projectRes.data.data);
        if (tasksRes.data.success) setTasks(tasksRes.data.data);
      } catch (error) {
        console.error('Failed to fetch project data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api, projectId]);

  useEffect(() => {
    const handleOpenDrawer = (e) => {
      if (e.detail?.taskId) setDrawerTaskId(e.detail.taskId);
    };
    window.addEventListener('open-task-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-task-drawer', handleOpenDrawer);
  }, []);

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  if (loading) return <div className="animate-pulse p-4">Loading Kanban Board...</div>;

  // Determine my role in this project from the workspace
  const isOwner = String(project?.workspace?.owner) === String(user?._id || user?.id);
  const myMemberInfo = project?.workspace?.members?.find(m => String(m.user?._id || m.user) === String(user?._id || user?.id));
  const myRole = isOwner ? 'Owner' : (myMemberInfo?.role || 'Viewer');
  const canManageTasks = ['Owner', 'Admin', 'Project Manager', 'Developer'].includes(myRole);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link 
            to={project?.workspace?._id ? `/workspaces/${project.workspace._id}` : "/dashboard"}
            className="p-1.5 hover:bg-muted rounded-md transition-colors -ml-2"
            title="Back to Workspace"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project?.name || 'Board'}</h1>
            <p className="text-xs text-muted-foreground mt-1">Role: {myRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors">
            <Settings2 className="w-5 h-5" />
          </button>
          {canManageTasks && (
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task">
        <CreateTaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => setIsTaskModalOpen(false)} 
          onSuccess={handleTaskCreated}
          projectId={projectId}
          members={project?.members || []}
        />
      </Modal>

      <TaskDrawer 
        taskId={drawerTaskId} 
        isOpen={!!drawerTaskId} 
        onClose={() => setDrawerTaskId(null)} 
        members={project?.members || []}
        canManageTasks={canManageTasks}
      />

      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialTasks={tasks} projectId={projectId} canManageTasks={canManageTasks} />
      </div>
    </div>
  );
}
