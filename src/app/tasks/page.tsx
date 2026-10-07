'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useApp } from '@/context/AppContext';
import { Task, TaskStatus, TaskPriority, ChecklistItem } from '@/types';
import KanbanColumn from '@/components/KanbanColumn';
import TaskCard from '@/components/TaskCard';
import { Plus, X, Sparkles, Filter, CheckSquare, Paperclip, ImageIcon } from 'lucide-react';

const COLUMNS: { id: TaskStatus; title: string; colorBorder: string }[] = [
  { id: 'backlog', title: '1. Backlog', colorBorder: 'bg-zinc-400' },
  { id: 'todo', title: '2. To Do', colorBorder: 'bg-blue-500' },
  { id: 'in_progress', title: '3. In Progress', colorBorder: 'bg-amber-500' },
  { id: 'review', title: '4. Review', colorBorder: 'bg-purple-500' },
  { id: 'done', title: '5. Done', colorBorder: 'bg-emerald-500' },
];

export default function TasksPage() {
  const {
    tasks,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    toggleTaskChecklist,
    toggleTaskCompleted,
  } = useApp();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [notes, setNotes] = useState('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // 4px drag threshold to allow smooth clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Map of project id to name/color
  const projectsMap = projects.reduce<Record<string, { name: string; color: string }>>((acc, p) => {
    acc[p.id] = { name: p.name, color: p.color };
    return acc;
  }, {});

  // Filter tasks based on selected project
  const filteredTasks = selectedProjectId
    ? tasks.filter((t) => t.project_id === selectedProjectId)
    : tasks;

  // Open modal for Create
  const handleOpenCreateModal = (defaultStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setProjectId(selectedProjectId || projects[0]?.id || '');
    setStatus(defaultStatus);
    setPriority('medium');
    setStartDate('');
    setDueDate('');
    setReminder('');
    setAiPrompt('');
    setNotes('');
    setChecklistItems([]);
    setNewChecklistText('');
    setScreenshotUrl('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setProjectId(task.project_id);
    setStatus(task.status);
    setPriority(task.priority);
    setStartDate(task.start_date ? task.start_date.split('T')[0] : '');
    setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setReminder(task.reminder ? task.reminder.split('T')[0] : '');
    setAiPrompt(task.ai_prompt || '');
    setNotes(task.notes || '');
    setChecklistItems(task.checklist || []);
    setNewChecklistText('');
    setScreenshotUrl(task.screenshots?.[0]?.url || '');
    setIsModalOpen(true);
  };

  // Add checklist item
  const handleAddChecklist = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (!newChecklistText.trim()) return;
    e.preventDefault();
    setChecklistItems([
      ...checklistItems,
      { id: 'c-' + Date.now(), text: newChecklistText.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklistItems(checklistItems.filter((c) => c.id !== id));
  };

  // Submit Modal
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    const screenshots = screenshotUrl
      ? [{ name: 'Attached Image', url: screenshotUrl }]
      : [];

    if (editingTask) {
      await updateTask(editingTask.id, {
        title,
        description,
        project_id: projectId,
        status,
        priority,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        reminder: reminder ? new Date(reminder).toISOString() : null,
        ai_prompt: aiPrompt,
        notes,
        checklist: checklistItems,
        screenshots,
      });
    } else {
      await addTask({
        title,
        description,
        project_id: projectId,
        status,
        priority,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        reminder: reminder ? new Date(reminder).toISOString() : null,
        color_label: projectsMap[projectId]?.color || '#6366f1',
        completed: status === 'done',
        checklist: checklistItems,
        ai_prompt: aiPrompt,
        notes,
        attachments: [],
        screenshots,
      });
    }

    setIsModalOpen(false);
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Check if dragging over a column container
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      const activeTaskItem = tasks.find((t) => t.id === activeId);
      if (activeTaskItem && activeTaskItem.status !== overId) {
        moveTaskStatus(activeId as string, overId as TaskStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

    // Dropped on a column
    const isColumn = COLUMNS.some((col) => col.id === overId);
    if (isColumn && activeTaskItem.status !== overId) {
      moveTaskStatus(activeId, overId as TaskStatus);
      return;
    }

    // Dropped on another task
    const overTaskItem = tasks.find((t) => t.id === overId);
    if (overTaskItem && activeTaskItem.status !== overTaskItem.status) {
      moveTaskStatus(activeId, overTaskItem.status);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Todo Kanban Board
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Drag-and-drop antar 5 kolom status. Otomatis menghitung progress project saat task selesai.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project dropdown filter */}
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Semua Project ({tasks.length} task)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({tasks.filter((t) => t.project_id === p.id).length})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleOpenCreateModal('todo')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((column) => {
              const columnTasks = filteredTasks.filter((t) => t.status === column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  colorBorder={column.colorBorder}
                  tasks={columnTasks}
                  projectsMap={projectsMap}
                  onOpenCreateModal={handleOpenCreateModal}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={deleteTask}
                  onToggleChecklist={toggleTaskChecklist}
                  onToggleCompleted={toggleTaskCompleted}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                projectName={projectsMap[activeTask.project_id]?.name}
                projectColor={projectsMap[activeTask.project_id]?.color}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleChecklist={() => {}}
                onToggleCompleted={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingTask ? 'Edit Task' : 'Buat Task Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Judul Task *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Implementasi Backtest EMA 20 & 50"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Project & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Project *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Kolom Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail eksekusi tugas..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Deadline (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Reminder
                  </label>
                  <input
                    type="date"
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Checklist kecil di dalam task */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Checklist Sub-tugas
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={handleAddChecklist}
                    placeholder="Ketik item checklist lalu Enter..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    className="px-3 py-1.5 text-xs rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium"
                  >
                    Tambah
                  </button>
                </div>
                {checklistItems.length > 0 && (
                  <div className="space-y-1 max-h-28 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
                        <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          • {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklist(item.id)}
                          className="text-zinc-400 hover:text-rose-500 text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Knowledge Base Integrations: AI Prompt & Screenshot */}
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Konteks Knowledge Base (Prompt & Screenshot)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Prompt AI yang Digunakan untuk Tugas Ini
                  </label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Contoh: Buatkan script Python vectorized backtest EMA..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    URL Screenshot / Gambar Pendukung (Supabase Storage atau Web)
                  </label>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... atau Supabase Storage URL"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Catatan / Pembelajaran
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Temuan, kendala, atau takeaways khusus..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  {editingTask ? 'Simpan Task' : 'Buat Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
