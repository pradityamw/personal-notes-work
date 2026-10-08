'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  FolderKanban,
  AlertCircle,
  FileText,
  Paperclip,
  Sparkles,
  X,
  ExternalLink,
  CheckSquare,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from 'date-fns';
import Link from 'next/link';

type ViewMode = 'monthly' | 'weekly' | 'daily';

export default function CalendarPage() {
  const { tasks, projects, selectedProjectId, setSelectedProjectId } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  // Interactive selected day state for history view
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  const projectsMap = projects.reduce<Record<string, { name: string; color: string }>>((acc, p) => {
    acc[p.id] = { name: p.name, color: p.color };
    return acc;
  }, {});

  // Filter tasks if project filter is set
  const filteredTasks = selectedProjectId
    ? tasks.filter((t) => t.project_id === selectedProjectId)
    : tasks;

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'monthly') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'weekly') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'monthly') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'weekly') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Find all task activity for a date:
  // 1. Tasks completed on this day (Work History)
  // 2. Tasks due/deadline on this day
  // 3. Tasks started on this day
  const getTasksForDate = (day: Date) => {
    return filteredTasks.filter((t) => {
      // Completed date
      const isCompletedDay = t.completed_at ? isSameDay(parseISO(t.completed_at), day) : false;
      // Due date
      const isDueDay = t.due_date ? isSameDay(parseISO(t.due_date), day) : false;
      // Start date
      const isStartDay = t.start_date ? isSameDay(parseISO(t.start_date), day) : false;
      // Updated day fallback for completed tasks without explicit completed_at
      const isUpdatedDone = t.completed && t.updated_at ? isSameDay(parseISO(t.updated_at), day) : false;

      return isCompletedDay || isDueDay || isStartDay || isUpdatedDone;
    });
  };

  // Monthly days array
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Weekly days array
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Selected Day Tasks Activity Breakdown
  const selectedDayTasks = getTasksForDate(selectedDay);
  const selectedDayCompleted = selectedDayTasks.filter((t) => {
    const isCompletedDay = t.completed_at ? isSameDay(parseISO(t.completed_at), selectedDay) : false;
    const isUpdatedDone = t.completed && t.updated_at ? isSameDay(parseISO(t.updated_at), selectedDay) : false;
    return isCompletedDay || isUpdatedDone || (t.completed && t.status === 'done');
  });
  const selectedDayDeadlines = selectedDayTasks.filter(
    (t) => t.due_date && isSameDay(parseISO(t.due_date), selectedDay)
  );

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Kalender & History Pengerjaan
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Klik tanggal berapa pun untuk melihat riwayat tugas & project apa saja yang Anda kerjakan atau selesaikan pada hari itu.
          </p>
        </div>

        {/* View Switchers & Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Project filter dropdown */}
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Semua Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Daily / Weekly / Monthly Switch */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {(['monthly', 'weekly', 'daily'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {mode === 'daily' ? 'Harian' : mode === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>

          {/* Prev, Next, Today */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Left (2 col), Interactive History Panel Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT: Calendar Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {format(
                currentDate,
                viewMode === 'monthly'
                  ? 'MMMM yyyy'
                  : viewMode === 'weekly'
                  ? "'Minggu ke-'w, MMMM yyyy"
                  : 'EEEE, dd MMMM yyyy'
              )}
            </h2>
            <span className="text-xs text-zinc-400">
              Klik tanggal untuk memuat history pekerjaan di panel samping
            </span>
          </div>

          {/* VIEW: MONTHLY */}
          {viewMode === 'monthly' && (
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              {/* Day Names Header */}
              <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 text-center py-2.5 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {monthDays.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isTodayDate = isToday(day);
                  const isDaySelected = isSameDay(day, selectedDay);
                  const hasDoneTasks = dayTasks.some((t) => t.completed || t.status === 'done');

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDay(day);
                      }}
                      className={`min-h-[105px] p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 ${
                        !isCurrentMonth ? 'bg-zinc-50/50 dark:bg-zinc-950/40 opacity-40' : ''
                      } ${
                        isDaySelected
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 z-10'
                          : isTodayDate
                          ? 'bg-zinc-100/70 dark:bg-zinc-800/40'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            isTodayDate
                              ? 'bg-indigo-600 text-white'
                              : isDaySelected
                              ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {hasDoneTasks && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Ada task diselesaikan!" />
                        )}
                      </div>

                      {/* Task Pills */}
                      <div className="space-y-1 mt-1 overflow-y-auto max-h-[65px]">
                        {dayTasks.slice(0, 3).map((t) => {
                          const isDone = t.completed || t.status === 'done';
                          return (
                            <div
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDay(day);
                                setSelectedTaskDetail(t);
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                                isDone
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                  : 'bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                              }`}
                              title={`${t.title} (${projectsMap[t.project_id]?.name})`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: projectsMap[t.project_id]?.color || '#6366f1' }}
                              />
                              <span className="truncate">{t.title}</span>
                            </div>
                          );
                        })}
                        {dayTasks.length > 3 && (
                          <span className="text-[9px] text-zinc-400 pl-1 block">
                            +{dayTasks.length - 3} lainnya...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: WEEKLY */}
          {viewMode === 'weekly' && (
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <div className="grid grid-cols-7 divide-x divide-zinc-200 dark:divide-zinc-800 min-h-[420px]">
                {weekDays.map((day) => {
                  const dayTasks = getTasksForDate(day);
                  const isTodayDate = isToday(day);
                  const isDaySelected = isSameDay(day, selectedDay);

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={`p-3 flex flex-col cursor-pointer transition-colors ${
                        isDaySelected
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500'
                          : isTodayDate
                          ? 'bg-zinc-100/50 dark:bg-zinc-800/20'
                          : ''
                      }`}
                    >
                      <div className="text-center pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          {format(day, 'EEE')}
                        </span>
                        <span
                          className={`text-sm font-bold inline-block mt-0.5 px-2 py-0.5 rounded-full ${
                            isTodayDate ? 'bg-indigo-600 text-white' : 'text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {format(day, 'd MMM')}
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 overflow-y-auto">
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTaskDetail(t);
                            }}
                            className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-750 text-xs space-y-1 hover:border-indigo-400"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: projectsMap[t.project_id]?.color || '#6366f1' }}
                              />
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block uppercase font-medium">
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: DAILY */}
          {viewMode === 'daily' && (
            <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Jadwal & Task: {format(currentDate, 'EEEE, dd MMMM yyyy')}
                  </h3>
                  <p className="text-xs text-zinc-400">Daftar pengerjaan dan deadline pada hari ini.</p>
                </div>
              </div>
              <div className="space-y-3">
                {getTasksForDate(currentDate).length === 0 ? (
                  <div className="text-center py-10 text-xs text-zinc-400">
                    Tidak ada agenda task pada hari ini.
                  </div>
                ) : (
                  getTasksForDate(currentDate).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskDetail(t)}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-indigo-500 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</h4>
                        <p className="text-xs text-zinc-500">{projectsMap[t.project_id]?.name}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Selected Day Work History & Results Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            {/* Header info */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Riwayat & Hasil Kerja
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {selectedDayTasks.length} Task
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {format(selectedDay, 'EEEE, dd MMMM yyyy')}
              </h3>
            </div>

            {/* Empty State */}
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-400 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p>Belum ada catatan pekerjaan atau task yang diselesaikan pada tanggal ini.</p>
                <Link
                  href="/tasks"
                  className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Tambah task di Kanban
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {/* Section 1: Task yang Diselesaikan */}
                {selectedDayCompleted.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Task Selesai Dikerjakan ({selectedDayCompleted.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedDayCompleted.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskDetail(t)}
                          className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-400 cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: projectsMap[t.project_id]?.color || '#10b981' }}
                                />
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {t.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-medium pl-3.5 block mt-0.5">
                                Project: {projectsMap[t.project_id]?.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              Done
                            </span>
                          </div>

                          {/* Result notes if any */}
                          {t.result_notes && (
                            <div className="mt-2 text-[11px] bg-white dark:bg-zinc-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900 text-zinc-700 dark:text-zinc-300">
                              <span className="font-semibold text-emerald-600 block text-[10px]">Hasil:</span>
                              {t.result_notes}
                            </div>
                          )}

                          {/* Attachments preview */}
                          {t.attachments && t.attachments.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400">
                              <Paperclip className="w-3 h-3" />
                              <span>{t.attachments.length} file hasil terlampir</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 2: Task Lainnya / In Progress / Due */}
                {selectedDayTasks.filter((t) => !selectedDayCompleted.includes(t)).length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 mt-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Task Terjadwal / Deadline
                    </h4>
                    <div className="space-y-2">
                      {selectedDayTasks
                        .filter((t) => !selectedDayCompleted.includes(t))
                        .map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTaskDetail(t)}
                            className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 cursor-pointer transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: projectsMap[t.project_id]?.color || '#6366f1' }}
                                />
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                  {t.title}
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold uppercase">
                                {t.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 pl-3.5 block mt-0.5">
                              {projectsMap[t.project_id]?.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Result & Files Modal Preview */}
      {selectedTaskDetail && (
        <div
          onClick={() => setSelectedTaskDetail(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[85vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {projectsMap[selectedTaskDetail.project_id]?.name}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {selectedTaskDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTaskDetail.description && (
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase">Deskripsi:</span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                  {selectedTaskDetail.description}
                </p>
              </div>
            )}

            {/* Result notes */}
            {selectedTaskDetail.result_notes && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Catatan Hasil Pengerjaan:
                </span>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTaskDetail.result_notes}
                </p>
              </div>
            )}

            {/* Attachments / Files */}
            {selectedTaskDetail.attachments && selectedTaskDetail.attachments.length > 0 && (
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase mb-2 block">
                  File & Hasil Kerja Terlampir:
                </span>
                <div className="space-y-2">
                  {selectedTaskDetail.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {file.name}
                        </span>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        download={file.name}
                        className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Buka / Unduh</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Prompt info if any */}
            {selectedTaskDetail.ai_prompt && (
              <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Prompt AI:
                </span>
                <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                  {selectedTaskDetail.ai_prompt}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/tasks"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5"
              >
                <span>Buka di Kanban Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
