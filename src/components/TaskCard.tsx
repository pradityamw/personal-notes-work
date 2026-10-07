'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import {
  Calendar,
  CheckSquare,
  Sparkles,
  Paperclip,
  ImageIcon,
  GripVertical,
  MoreVertical,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  projectName?: string;
  projectColor?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleChecklist: (taskId: string, checklistId: string) => void;
  onToggleCompleted: (taskId: string) => void;
}

export default function TaskCard({
  task,
  projectName,
  projectColor = '#6366f1',
  onEdit,
  onDelete,
  onToggleChecklist,
  onToggleCompleted,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const checklistDone = task.checklist.filter((c) => c.completed).length;
  const checklistTotal = task.checklist.length;

  const priorityColor = {
    high: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    low: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  }[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all ${
        task.completed ? 'opacity-70 bg-zinc-50/50 dark:bg-zinc-900/50' : ''
      }`}
    >
      {/* Top row: Drag Handle, Project Tag, Priority, Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-300"
            title="Drag task"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {projectName && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[120px]"
              style={{
                backgroundColor: `${projectColor}15`,
                color: projectColor,
              }}
            >
              {projectName}
            </span>
          )}

          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${priorityColor}`}
          >
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="text-[11px] text-zinc-400 hover:text-indigo-500"
            title="Edit Task"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-[11px] text-zinc-400 hover:text-rose-500 ml-1"
            title="Hapus Task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Task Title & Completed toggle */}
      <div className="flex items-start gap-2.5 mb-2">
        <button
          onClick={() => onToggleCompleted(task.id)}
          className={`mt-0.5 transition-transform hover:scale-110 ${
            task.completed ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-zinc-400'
          }`}
          title="Tandai selesai"
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>
        <h4
          onClick={() => onEdit(task)}
          className={`text-xs font-semibold leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
            task.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {task.title}
        </h4>
      </div>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2.5 pl-6">
          {task.description}
        </p>
      )}

      {/* Checklists Preview */}
      {checklistTotal > 0 && (
        <div className="mb-2.5 pl-6 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium mb-1">
            <span>Checklist</span>
            <span>
              {checklistDone}/{checklistTotal}
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
            />
          </div>
          {task.checklist.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleChecklist(task.id, item.id)}
              className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <input
                type="checkbox"
                checked={item.completed}
                readOnly
                className="w-3 h-3 rounded accent-indigo-600 cursor-pointer pointer-events-none"
              />
              <span className={`truncate ${item.completed ? 'line-through text-zinc-400' : ''}`}>
                {item.text}
              </span>
            </div>
          ))}
          {checklistTotal > 2 && (
            <span className="text-[10px] text-zinc-400 italic">
              +{checklistTotal - 2} item lainnya...
            </span>
          )}
        </div>
      )}

      {/* Badges / Attachments row */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>{format(parseISO(task.due_date), 'dd MMM')}</span>
            </div>
          )}
          {task.ai_prompt && (
            <div className="flex items-center gap-0.5 text-purple-500" title="Ada AI Prompt tersimpan">
              <Sparkles className="w-3 h-3" />
              <span>Prompt</span>
            </div>
          )}
          {task.screenshots && task.screenshots.length > 0 && (
            <div className="flex items-center gap-0.5 text-emerald-500" title="Screenshot terlampir">
              <ImageIcon className="w-3 h-3" />
              <span>{task.screenshots.length}</span>
            </div>
          )}
        </div>

        {task.notes && (
          <span className="text-zinc-400 italic font-mono text-[9px]">Note</span>
        )}
      </div>
    </div>
  );
}
