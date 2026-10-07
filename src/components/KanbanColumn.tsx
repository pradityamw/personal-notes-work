'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  colorBorder: string;
  tasks: Task[];
  projectsMap: Record<string, { name: string; color: string }>;
  onOpenCreateModal: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleChecklist: (taskId: string, checklistId: string) => void;
  onToggleCompleted: (taskId: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  colorBorder,
  tasks,
  projectsMap,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onToggleChecklist,
  onToggleCompleted,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full min-w-[280px] w-80 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-2xl p-3 border transition-colors ${
        isOver
          ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-zinc-200/80 dark:border-zinc-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colorBorder}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
            {title}
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onOpenCreateModal(id)}
          className="p-1 rounded-md text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          title={`Tambah task ke ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List (Sortable Area) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => {
            const proj = projectsMap[task.project_id];
            return (
              <TaskCard
                key={task.id}
                task={task}
                projectName={proj?.name}
                projectColor={proj?.color}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onToggleChecklist={onToggleChecklist}
                onToggleCompleted={onToggleCompleted}
              />
            );
          })}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl flex items-center justify-center text-xs text-zinc-400">
            Tarik task ke sini
          </div>
        )}
      </div>
    </div>
  );
}
