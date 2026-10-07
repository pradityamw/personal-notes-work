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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
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

type ViewMode = 'monthly' | 'weekly' | 'daily';

export default function CalendarPage() {
  const { tasks, projects } = useApp();
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  React.useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date());
  }, []);

  const projectsMap = projects.reduce<Record<string, { name: string; color: string }>>((acc, p) => {
    acc[p.id] = { name: p.name, color: p.color };
    return acc;
  }, {});

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
    setCurrentDate(new Date());
  };

  // Find tasks matching date
  const getTasksForDate = (day: Date) => {
    return tasks.filter((t) => {
      if (!t.due_date) return false;
      try {
        return isSameDay(parseISO(t.due_date), day);
      } catch {
        return false;
      }
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

  return (
    <div className="space-y-6">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Kalender & Timeline
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Visualisasikan jadwal deadline tugas, timeline project, dan reminder harian.
          </p>
        </div>

        {/* View Switchers & Navigation */}
        <div className="flex items-center gap-3">
          {/* Daily / Weekly / Monthly Switch */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
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

      {/* Date Title Banner */}
      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        {format(
          currentDate,
          viewMode === 'monthly' ? 'MMMM yyyy' : viewMode === 'weekly' ? "'Minggu ke-'w, MMMM yyyy" : 'EEEE, dd MMMM yyyy'
        )}
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

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    !isCurrentMonth ? 'bg-zinc-50/50 dark:bg-zinc-950/40 opacity-40' : ''
                  } ${isTodayDate ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isTodayDate
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-zinc-400 font-semibold">
                        {dayTasks.length} task
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px]">
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                          t.completed
                            ? 'line-through text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
                            : 'bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                        }`}
                        title={t.title}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: projectsMap[t.project_id]?.color || '#6366f1' }}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
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
          <div className="grid grid-cols-7 divide-x divide-zinc-200 dark:divide-zinc-800 min-h-[400px]">
            {weekDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 flex flex-col ${
                    isTodayDate ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
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
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-750 text-xs space-y-1"
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
                          {t.priority} • {t.status}
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
        <div className="max-w-2xl bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Agenda Tanggal {format(currentDate, 'dd MMMM yyyy')}
              </h2>
              <p className="text-xs text-zinc-400">Semua deadline dan pengingat yang dijadwalkan hari ini.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              {getTasksForDate(currentDate).length} Task Terjadwal
            </span>
          </div>

          <div className="space-y-3">
            {getTasksForDate(currentDate).length === 0 ? (
              <div className="text-center py-12 text-sm text-zinc-400">
                Tidak ada task atau deadline pada tanggal ini.
              </div>
            ) : (
              getTasksForDate(currentDate).map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 ${t.completed ? 'text-emerald-500' : 'text-zinc-400'}`} />
                      <h4
                        className={`text-sm font-semibold ${
                          t.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {t.title}
                      </h4>
                    </div>
                    {t.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-6">{t.description}</p>
                    )}
                    <div className="pl-6 pt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-medium text-indigo-500">
                        {projectsMap[t.project_id]?.name}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{t.priority} priority</span>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold uppercase">
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
