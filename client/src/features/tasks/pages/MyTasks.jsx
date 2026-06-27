import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Clock } from 'lucide-react';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await api.get('/tasks/me');
        if (res.data.success) {
          setTasks(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, [api]);

  const groupedTasks = {
    'Todo': tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Review': tasks.filter(t => t.status === 'Review'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  const priorityColors = {
    Low: 'bg-green-500/10 text-green-600 border-green-500/20',
    Medium: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    High: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    Urgent: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-2 text-lg">All tasks assigned to you across your projects.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 w-32 bg-muted rounded mb-4"></div>
              <div className="h-24 bg-card rounded-xl border border-border"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div key={status}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'Done' ? 'bg-green-500' :
                  status === 'Review' ? 'bg-orange-500' :
                  status === 'In Progress' ? 'bg-blue-500' : 'bg-muted-foreground'
                }`} />
                {status}
                <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {statusTasks.length}
                </span>
              </h2>

              {statusTasks.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-card/30">
                  <p className="text-muted-foreground">No {status} tasks right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statusTasks.map(task => (
                    <div key={task._id} className="bg-card border border-border p-5 rounded-xl hover:border-primary/50 transition-colors shadow-sm group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {task.project?.name || 'Unknown Project'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base mb-4 line-clamp-2">{task.title}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold tracking-wide uppercase border ${priorityColors[task.priority] || priorityColors.Medium}`}>
                          {task.priority}
                        </span>
                        {task.storyPoints > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-muted text-muted-foreground rounded-md border border-border/50">
                            <Clock className="w-3 h-3" />
                            <span>{task.storyPoints} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
