import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanTask from './KanbanTask';

export default function KanbanColumn({ column, tasks }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const getColumnColor = (id) => {
    switch(id) {
      case 'Backlog': return 'border-t-gray-400 dark:border-t-gray-600';
      case 'Todo': return 'border-t-blue-500 dark:border-t-blue-500';
      case 'In Progress': return 'border-t-yellow-400 dark:border-t-yellow-500';
      case 'Review': return 'border-t-purple-500 dark:border-t-purple-500';
      case 'Done': return 'border-t-green-500 dark:border-t-green-500';
      default: return 'border-t-border';
    }
  };

  return (
    <div className={`bg-muted/30 rounded-xl w-80 shrink-0 flex flex-col h-full border border-border max-h-full overflow-hidden shadow-sm border-t-[3px] ${getColumnColor(column.id)}`}>
      <div className="p-3.5 border-b border-border bg-card/40 flex justify-between items-center backdrop-blur-sm">
        <h3 className="font-semibold text-sm text-foreground tracking-tight">{column.title}</h3>
        <span className="bg-background text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium border border-border shadow-sm">
          {tasks.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col relative"
      >
        <SortableContext 
          items={tasks.map(t => t._id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <KanbanTask key={task._id} task={task} />
          ))}
          
          {tasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border/50 rounded-xl bg-background/30 text-muted-foreground m-1">
              <p className="text-sm font-medium">No tasks yet</p>
              <p className="text-xs mt-1 opacity-70">Drag and drop tasks here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
