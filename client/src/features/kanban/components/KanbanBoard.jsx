import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import { useAuth } from '../../../shared/context/AuthContext';
import { io } from 'socket.io-client';

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'Todo', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Review', title: 'Review' },
  { id: 'Done', title: 'Done' }
];

export default function KanbanBoard({ initialTasks = [], projectId, canManageTasks = true }) {
  const [tasks, setTasks] = useState(initialTasks);
  const { api } = useAuth();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if (!projectId) return;

    // Connect to WebSockets
    const socket = io('http://localhost:5000', { withCredentials: true });
    
    socket.on('connect', () => {
      socket.emit('join_project', projectId);
    });

    socket.on('task:updated', (updatedTask) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    if (!canManageTasks) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id; // Either a column ID or a task ID

    const activeTask = tasks.find(t => t._id === activeId);
    if (!activeTask) return;

    let targetColumn = overId;
    
    // If dropping on a task, figure out its column
    const overTask = tasks.find(t => t._id === overId);
    if (overTask) {
      targetColumn = overTask.status;
    }

    if (activeTask.status === targetColumn) return;

    // Optimistic UI Update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => 
      t._id === activeId ? { ...t, status: targetColumn } : t
    ));

    // API Call
    try {
      const res = await api.put(`/tasks/${activeId}`, { status: targetColumn });
      if (!res.data.success) throw new Error('API failed');
    } catch (error) {
      // Rollback on failure
      console.error('Failed to update task status', error);
      setTasks(previousTasks);
    }
  };

  if (!canManageTasks) {
    // Render without DnD
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id} 
            column={col} 
            tasks={tasks.filter(t => t.status === col.id)} 
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id} 
            column={col} 
            tasks={tasks.filter(t => t.status === col.id)} 
          />
        ))}
      </DndContext>
    </div>
  );
}
