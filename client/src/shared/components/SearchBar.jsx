import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Folder, CheckSquare, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { api } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!query.trim()) {
        setResults(null);
        return;
      }
      try {
        const res = await api.get(`/search?q=${query}`);
        if (res.data.success) {
          setResults(res.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search failed', err);
      }
    };
    
    const timeoutId = setTimeout(fetchSearch, 300); // debounce
    return () => clearTimeout(timeoutId);
  }, [query, api]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search projects, tasks, and workspaces..."
          className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-colors"
        />
      </div>

      {isOpen && results && (
        <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          <div className="max-h-[400px] overflow-y-auto p-2">
            
            {/* Workspaces */}
            {results.workspaces?.length > 0 && (
              <div className="mb-4 last:mb-0">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Workspaces</h4>
                {results.workspaces.map(w => (
                  <button 
                    key={w._id}
                    onClick={() => handleNavigate(`/workspaces/${w._id}`)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-3 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{w.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Projects */}
            {results.projects?.length > 0 && (
              <div className="mb-4 last:mb-0">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Projects</h4>
                {results.projects.map(p => (
                  <button 
                    key={p._id}
                    onClick={() => handleNavigate(`/projects/${p._id}`)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-3 transition-colors"
                  >
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tasks */}
            {results.tasks?.length > 0 && (
              <div className="mb-4 last:mb-0">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Tasks</h4>
                {results.tasks.map(t => (
                  <button 
                    key={t._id}
                    // Typically you'd navigate to project and open drawer, or a standalone task page
                    // For now, redirect to projects list or specific project if we have projectId
                    onClick={() => handleNavigate(`/projects/${t.project}`)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-3 transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <div className="flex-1 overflow-hidden">
                      <span className="text-sm font-medium truncate block">{t.title}</span>
                      <span className="text-xs text-muted-foreground">{t.status} • {t.priority}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(!results.workspaces?.length && !results.projects?.length && !results.tasks?.length) && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
