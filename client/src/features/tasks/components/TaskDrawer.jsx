import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { X, MessageSquare, History, AlignLeft, Clock } from 'lucide-react';

export default function TaskDrawer({ taskId, isOpen, onClose, members = [], canManageTasks = false }) {
  const { api, user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('details'); // details, comments, history
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!isOpen || !taskId) return;

    const fetchTaskData = async () => {
      setLoading(true);
      try {
        const [taskRes, commentsRes, historyRes] = await Promise.all([
          api.get(`/tasks/${taskId}`).catch(() => ({ data: { data: null }})),
          api.get(`/tasks/${taskId}/comments`).catch(() => ({ data: { data: [] }})),
          api.get(`/tasks/${taskId}/history`).catch(() => ({ data: { data: [] }}))
        ]);

        setTask(taskRes.data.data);
        setComments(commentsRes.data.data || []);
        setHistory(historyRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskData();
  }, [taskId, isOpen, api]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { content: newComment });
      if (res.data.success) {
        // optimistically add with populated user mock
        setComments([...comments, { ...res.data.data, user: { _id: user._id || user.id, name: user.name } }]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-card border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-muted-foreground">TASK-{taskId?.slice(-4)}</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border shrink-0">
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments ({comments.length})
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">Loading task...</div>
          ) : (
            <>
              {activeTab === 'details' && task && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                      <div className="p-2 bg-secondary rounded-md text-sm font-medium">{task.status}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                      <div className="p-2 bg-secondary rounded-md text-sm font-medium">{task.priority}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Assignee</label>
                      {canManageTasks ? (
                        <select 
                          value={task.assignee?._id || ''}
                          onChange={async (e) => {
                            const newAssigneeId = e.target.value;
                            try {
                              const res = await api.put(`/tasks/${taskId}`, { assignee: newAssigneeId || null });
                              if (res.data.success) {
                                setTask(res.data.data);
                                // Refresh history to show the change
                                const historyRes = await api.get(`/tasks/${taskId}/history`).catch(()=>({data:{data:[]}}));
                                setHistory(historyRes.data.data || []);
                              }
                            } catch (err) {
                              console.error('Failed to update assignee', err);
                            }
                          }}
                          className="w-full p-2 bg-secondary border-none rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Unassigned</option>
                          {members.map(m => (
                            <option key={m._id} value={m._id}>
                              {m.name || 'Unknown'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-2 bg-secondary rounded-md text-sm font-medium flex items-center gap-2">
                          {task.assignee ? (
                            <>
                              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                                {task.assignee.name ? task.assignee.name.charAt(0) : 'U'}
                              </div>
                              {task.assignee.name}
                            </>
                          ) : 'Unassigned'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Est. Hours</label>
                      <div className="p-2 bg-secondary rounded-md text-sm font-medium">{task.estimatedHours || 0}h</div>
                    </div>
                  </div>
                </div>
              )}

          {activeTab === 'comments' && (
            <div className="space-y-6 flex flex-col h-full">
              <div className="flex-1 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No comments yet.</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {comment.user?.name ? comment.user.name.charAt(0) : 'U'}
                      </div>
                      <div className="flex-1 bg-muted/50 p-3 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm">{comment.user?.name || 'User'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handlePostComment} className="mt-4 shrink-0 relative">
                <textarea 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full pl-3 pr-12 py-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 bottom-2 p-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {history.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No history available.</div>
              ) : (
                history.map(item => (
                  <div key={item._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-secondary text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      <History className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-sm text-foreground">{item.user?.name || 'System'}</div>
                        <time className="font-caveat font-medium text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      <div className="text-sm text-muted-foreground">{item.action}</div>
                      {item.details && <div className="text-xs text-muted-foreground mt-1 italic">{item.details}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
