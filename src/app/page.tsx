'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  AlertCircle,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ListTodo,
  Plus,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { format, isToday, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { projects, tasks, prompts, learningNotes } = useApp();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed || t.status === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const totalProjects = projects.length;

  // Average progress across all projects
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
    : 0;

  // Tasks due today or with reminder today
  const todayTasks = tasks.filter((t) => {
    if (t.due_date) {
      try {
        return isToday(parseISO(t.due_date));
      } catch {
        return false;
      }
    }
    return false;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-900 border border-indigo-900/40 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-medium mb-2 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Knowledge Base & Task Command Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Project Memory & Task Manager
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Satu tempat terpadu untuk mengelola tugas harian, multi-project timeline, prompt AI, screenshot backtest, dan catatan pembelajaran pribadi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Task Baru</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium border border-zinc-700 transition-colors"
          >
            <span>Projects</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Task
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{totalTasks}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Terbagi di {totalProjects} project aktif</p>
          </div>
        </div>

        {/* Card 2: Task Selesai */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Task Selesai
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedTasks}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
            </p>
          </div>
        </div>

        {/* Card 3: Task Belum Selesai */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Belum Selesai
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingTasks}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Menunggu eksekusi & review</p>
          </div>
        </div>

        {/* Card 4: Progress Project Rata-rata */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Avg. Project Progress
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{avgProgress}%</h3>
              <span className="text-xs font-medium text-purple-500">keseluruhan</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Overview & Today's Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project Progress Breakdown (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Progress Project ({totalProjects})</h2>
            </div>
            <Link
              href="/projects"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.project_id === proj.id);
              const doneCount = projTasks.filter((t) => t.completed || t.status === 'done').length;

              return (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: proj.color }} />
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {proj.name}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full uppercase font-medium tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[32px] mb-3">
                      {proj.description || 'Tidak ada deskripsi.'}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {proj.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {doneCount} dari {projTasks.length} task selesai
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{proj.progress}%</span>
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Kalender Tugas Hari Ini & Quick Shortcuts (1 Col) */}
        <div className="space-y-6">
          {/* Today Tasks Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Kalender Tugas Hari Ini
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-medium">
                {format(new Date(), 'dd MMMM yyyy')}
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                <p>Tidak ada deadline task yang jatuh tempo hari ini.</p>
                <Link
                  href="/tasks"
                  className="mt-2 inline-block text-indigo-500 hover:underline font-semibold"
                >
                  Lihat semua task di Kanban
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-rose-500'
                              : task.priority === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <h4
                          className={`text-xs font-semibold ${
                            task.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{task.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 uppercase font-medium">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats: Knowledge base */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Knowledge Base Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link
                href="/prompts"
                className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 hover:bg-purple-100/50 transition-colors"
              >
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{prompts.length}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">AI Prompts</div>
              </Link>
              <Link
                href="/journal"
                className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 hover:bg-amber-100/50 transition-colors"
              >
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{learningNotes.length}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Learning Journals</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
