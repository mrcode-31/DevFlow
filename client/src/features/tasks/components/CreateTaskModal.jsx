import React, { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';

export default function CreateTaskModal({ isOpen, onClose, onSuccess, projectId, sprintId, members = [] }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { api } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const payload = { 
        title, 
        priority, 
        estimatedHours: Number(estimatedHours) || 0 
      };
      if (sprintId) payload.sprint = sprintId;
      if (assignee) payload.assignee = assignee;

      const res = await api.post(`/projects/${projectId}/tasks`, payload);
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
        setTitle('');
        setEstimatedHours('');
        setPriority('Medium');
        setAssignee('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Task Title</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement Login API"
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Assign To</label>
        <select 
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Unassigned</option>
          {members.map(member => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.email})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Est. Hours</label>
          <input 
            type="number"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="e.g. 5"
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading || !title.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
