'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar as CalendarIcon,
  Tag,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  X,
  TrendingUp,
  Paperclip,
  ArrowRight,
  Download,
  CalendarDays,
  FileCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Project, ProjectStatus, Task } from '@/types';
import Link from 'next/link';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

export default function ProjectsPage() {
  const { projects, tasks, addProject, updateProject, deleteProject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Dedicated project detail & calendar timeline state
  const [activeProjectDetail, setActiveProjectDetail] = useState<Project | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [deadline, setDeadline] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setColor('#6366f1');
    setStatus('active');
    setDeadline('');
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setColor(proj.color || '#6366f1');
    setStatus(proj.status);
    setDeadline(proj.deadline ? proj.deadline.split('T')[0] : '');
    setTagsInput(proj.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      await updateProject(editingProject.id, {
        name,
        description,
        color,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        tags,
      });
    } else {
      await addProject({
        name,
        description,
        color,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        tags,
      });
    }

    setIsModalOpen(false);
  };

  // Dedicated Project Calendar calculation
  const activeProjTasks = activeProjectDetail
    ? tasks.filter((t) => t.project_id === activeProjectDetail.id)
    : [];

  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDayInProject = (day: Date) => {
    return activeProjTasks.filter((t) => {
      const isCompletedDay = t.completed_at ? isSameDay(parseISO(t.completed_at), day) : false;
      const isDueDay = t.due_date ? isSameDay(parseISO(t.due_date), day) : false;
      const isUpdatedDone = t.completed && t.updated_at ? isSameDay(parseISO(t.updated_at), day) : false;
      return isCompletedDay || isDueDay || isUpdatedDone;
    });
  };

  const selectedDayTasks = getTasksForDayInProject(selectedDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-500" />
            Project Management Hub
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Klik kartu project mana pun untuk membuka <strong>Timeline Kalender Khusus</strong> dan melihat history hasil pengerjaan project tersebut.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Project Baru</span>
        </button>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const projTasks = tasks.filter((t) => t.project_id === proj.id);
          const completedCount = projTasks.filter((t) => t.completed || t.status === 'done').length;

          return (
            <div
              key={proj.id}
              onClick={() => {
                setActiveProjectDetail(proj);
                setSelectedDay(new Date());
              }}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between shadow-xs hover:shadow-lg relative group cursor-pointer"
            >
              <div>
                {/* Top Status & Color pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {proj.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(proj, e)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit Project"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Yakin ingin menghapus project "${proj.name}" dan semua tasknya?`)) {
                          deleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {proj.description || 'Tidak ada deskripsi.'}
                </p>

                {/* Tags */}
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {/* Deadline & Task count */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 py-2 border-t border-zinc-100 dark:border-zinc-800/80 mb-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                    {completedCount} / {projTasks.length} Task Selesai
                  </span>
                  {proj.deadline && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <CalendarIcon className="w-3 h-3 text-zinc-400" />
                      {new Date(proj.deadline).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Progress</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${proj.progress}%`,
                        backgroundColor: proj.color || '#6366f1',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Klik untuk Kalender & History
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEDICATED PROJECT CALENDAR & HISTORY TIMELINE MODAL */}
      {activeProjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: activeProjectDetail.color }}
                  />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {activeProjectDetail.name}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-semibold uppercase">
                    {activeProjectDetail.status} • {activeProjectDetail.progress}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                  {activeProjectDetail.description || 'Kalender timeline dan riwayat pengerjaan khusus project ini.'}
                </p>
              </div>
              <button
                onClick={() => setActiveProjectDetail(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Grid: Left Calendar View, Right Task History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Left: Monthly Calendar */}
              <div className="bg-zinc-50 dark:bg-zinc-950/70 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {format(calendarDate, 'MMMM yyyy')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                      className="p-1 rounded-md text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date();
                        setCalendarDate(today);
                        setSelectedDay(today);
                      }}
                      className="px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                    >
                      Bulan Ini
                    </button>
                    <button
                      onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                      className="p-1 rounded-md text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Day of Week */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map((day) => {
                    const dayTasks = getTasksForDayInProject(day);
                    const isSelected = isSameDay(day, selectedDay);
                    const isTodayDate = isToday(day);
                    const isCurMonth = isSameMonth(day, monthStart);
                    const hasDone = dayTasks.some((t) => t.completed || t.status === 'done');

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDay(day)}
                        className={`h-11 p-1 rounded-xl flex flex-col items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                            : isTodayDate
                            ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : isCurMonth
                            ? 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                            : 'opacity-25 text-zinc-400'
                        }`}
                      >
                        <span className="text-[11px]">{format(day, 'd')}</span>
                        {dayTasks.length > 0 && (
                          <div className="flex gap-0.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected
                                  ? 'bg-white'
                                  : hasDone
                                  ? 'bg-emerald-500'
                                  : 'bg-indigo-500'
                              }`}
                            />
                            {dayTasks.length > 1 && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-white' : 'bg-amber-400'
                                }`}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: History on Selected Date */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Aktivitas Project
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {format(selectedDay, 'EEEE, dd MMMM yyyy')}
                  </h4>
                </div>

                {selectedDayTasks.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-400">
                    Tidak ada pengerjaan atau task pada tanggal ini di project <strong>{activeProjectDetail.name}</strong>.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {selectedDayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                task.completed ? 'text-emerald-500' : 'text-zinc-400'
                              }`}
                            />
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {task.title}
                            </h5>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {task.status}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Result notes if completed */}
                        {task.result_notes && (
                          <div className="ml-6 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] text-zinc-800 dark:text-zinc-200">
                            <span className="font-semibold text-emerald-600 block text-[10px]">
                              Hasil Pengerjaan:
                            </span>
                            {task.result_notes}
                          </div>
                        )}

                        {/* Uploaded attachments preview */}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="ml-6 space-y-1 pt-1">
                            <span className="text-[10px] font-semibold text-zinc-400">File Terlampir:</span>
                            {task.attachments.map((file, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] bg-zinc-50 dark:bg-zinc-800/60 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700"
                              >
                                <span className="truncate max-w-[160px] text-zinc-700 dark:text-zinc-300">
                                  {file.name}
                                </span>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[10px]"
                                >
                                  Unduh File
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href="/tasks"
                    className="w-full py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Buka Kanban Board Project Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create / Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingProject ? 'Edit Project' : 'Buat Project Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Project *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Trading AI, Thesis, Data Science Learning"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tujuan project, lingkup pekerjaan, atau catatan penting..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="pause">Pause</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Warna Label
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-zinc-500">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tags (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Python, AI, Finance, IELTS"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  {editingProject ? 'Simpan Perubahan' : 'Buat Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
