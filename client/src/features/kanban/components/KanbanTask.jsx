import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripHorizontal } from 'lucide-react';

export default function KanbanTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    Low: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20',
    Medium: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20',
    High: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20',
    Urgent: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20'
  };

  const priorityBadge = priorityColors[task.priority] || priorityColors.Medium;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-task-drawer', { detail: { taskId: task._id } }));
      }}
      className={`group bg-card p-3 rounded-xl shadow-sm border border-border cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all relative overflow-hidden ${
        isDragging ? 'opacity-50 ring-2 ring-primary ring-offset-2 z-50 scale-105' : ''
      }`}
    >
      {/* Accent bar based on priority on the left side */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        task.priority === 'Urgent' ? 'bg-red-500' : 
        task.priority === 'High' ? 'bg-orange-500' : 
        task.priority === 'Medium' ? 'bg-blue-500' : 'bg-green-500'
      }`} />
      
      {/* Drag Handle & Task ID */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {task.taskKey || `TASK-${task._id.substring(task._id.length - 4).toUpperCase()}`}
        </span>
        <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <GripHorizontal className="w-4 h-4" />
        </div>
      </div>

      <div className="flex justify-between items-start mb-3 gap-2 pl-1">
        <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">{task.title}</h4>
      </div>
      
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pl-1">
          {task.labels.map((label, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md font-medium">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 pl-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-1 rounded-md font-bold tracking-wide uppercase border ${priorityBadge}`}>
            {task.priority}
          </span>
          {task.storyPoints > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-muted text-muted-foreground rounded-md border border-border/50">
              <Clock className="w-3 h-3" />
              <span>{task.storyPoints}</span>
            </div>
          )}
        </div>
        
        {task.assignee ? (
          <div 
            className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-background text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-1 ring-border"
            title={task.assignee.name}
          >
            {getInitials(task.assignee.name)}
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-dashed border-border bg-muted/50 flex items-center justify-center ring-1 ring-border">
            <span className="text-[10px] text-muted-foreground font-bold">?</span>
          </div>
        )}
      </div>
    </div>
  );
}
