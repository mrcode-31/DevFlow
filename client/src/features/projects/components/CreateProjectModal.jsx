import React, { useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';

export default function CreateProjectModal({ isOpen, onClose, onSuccess, workspaceId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { api } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/workspaces/${workspaceId}/projects`, { name, description });
      if (res.data.success) {
        onSuccess(res.data.data);
        onClose();
        setName('');
        setDescription('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Project Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Redesign"
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24"
        />
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
          disabled={loading || !name.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
