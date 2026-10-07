'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Filter, X, ArrowRight, CheckCircle2, Image as ImageIcon, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

export default function Header() {
  const { searchQuery, setSearchQuery, projects, tasks, prompts, screenshots, learningNotes } = useApp();
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Compute multi-table universal search matches
  const normalizedQ = searchQuery.toLowerCase().trim();
  const matchedProjects = normalizedQ
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQ) ||
          p.description?.toLowerCase().includes(normalizedQ) ||
          p.tags.some((t) => t.toLowerCase().includes(normalizedQ))
      )
    : [];

  const matchedTasks = normalizedQ
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(normalizedQ) ||
          t.description?.toLowerCase().includes(normalizedQ) ||
          t.notes?.toLowerCase().includes(normalizedQ) ||
          t.ai_prompt?.toLowerCase().includes(normalizedQ)
      )
    : [];

  const matchedPrompts = normalizedQ
    ? prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(normalizedQ) ||
          p.prompt.toLowerCase().includes(normalizedQ) ||
          p.ai_output?.toLowerCase().includes(normalizedQ) ||
          p.tags.some((t) => t.toLowerCase().includes(normalizedQ))
      )
    : [];

  const matchedScreenshots = normalizedQ
    ? screenshots.filter(
        (s) =>
          s.title.toLowerCase().includes(normalizedQ) ||
          s.description?.toLowerCase().includes(normalizedQ) ||
          s.tags.some((t) => t.toLowerCase().includes(normalizedQ))
      )
    : [];

  const matchedNotes = normalizedQ
    ? learningNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(normalizedQ) ||
          n.what_learned.toLowerCase().includes(normalizedQ) ||
          n.insights?.toLowerCase().includes(normalizedQ) ||
          n.solutions?.toLowerCase().includes(normalizedQ) ||
          n.tags.some((t) => t.toLowerCase().includes(normalizedQ))
      )
    : [];

  const totalMatches =
    matchedProjects.length +
    matchedTasks.length +
    matchedPrompts.length +
    matchedScreenshots.length +
    matchedNotes.length;

  return (
    <>
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Universal Search Bar */}
        <div className="relative w-full max-w-lg">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) setIsOpenModal(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsOpenModal(true);
              }}
              placeholder="Cari Task, Prompt, Screenshot, Journal, Project (cth: EMA, Supabase, Docker)..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsOpenModal(false);
                }}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Knowledge Connected</span>
          </div>
        </div>
      </header>

      {/* Universal Search Modal / Dropdown Overlay */}
      {isOpenModal && searchQuery.trim() && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[75vh]">
            {/* Search Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Hasil Pencarian Pintar: &quot;{searchQuery}&quot;
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-medium">
                  {totalMatches} ditemukan
                </span>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Results */}
            <div className="overflow-y-auto p-4 space-y-4">
              {totalMatches === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-sm">
                  Tidak ada data yang cocok dengan &quot;{searchQuery}&quot;. Coba kata kunci lain seperti &quot;EMA&quot;, &quot;Docker&quot;, &quot;Python&quot;.
                </div>
              ) : null}

              {/* Matched Projects */}
              {matchedProjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Projects</h4>
                  <div className="space-y-1.5">
                    {matchedProjects.map((p) => (
                      <Link
                        key={p.id}
                        href="/projects"
                        onClick={() => setIsOpenModal(false)}
                        className="block p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</span>
                          <span className="text-xs text-indigo-600 dark:text-indigo-400">{p.progress}% Selesai</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{p.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Tasks */}
              {matchedTasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Tasks</h4>
                  <div className="space-y-1.5">
                    {matchedTasks.map((t) => (
                      <Link
                        key={t.id}
                        href="/tasks"
                        onClick={() => setIsOpenModal(false)}
                        className="block p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${t.completed ? 'text-emerald-500' : 'text-zinc-400'}`} />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 ml-auto uppercase">
                            {t.status}
                          </span>
                        </div>
                        {t.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{t.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched AI Prompts */}
              {matchedPrompts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">AI Prompts</h4>
                  <div className="space-y-1.5">
                    {matchedPrompts.map((p) => (
                      <Link
                        key={p.id}
                        href="/prompts"
                        onClick={() => setIsOpenModal(false)}
                        className="block p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold">
                            {p.model}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 italic">
                          &quot;{p.prompt}&quot;
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Learning Notes */}
              {matchedNotes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Learning Journal</h4>
                  <div className="space-y-1.5">
                    {matchedNotes.map((n) => (
                      <Link
                        key={n.id}
                        href="/journal"
                        onClick={() => setIsOpenModal(false)}
                        className="block p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{n.what_learned}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Screenshots */}
              {matchedScreenshots.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Screenshots</h4>
                  <div className="space-y-1.5">
                    {matchedScreenshots.map((s) => (
                      <Link
                        key={s.id}
                        href="/screenshots"
                        onClick={() => setIsOpenModal(false)}
                        className="block p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                      >
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.title}</span>
                        </div>
                        {s.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{s.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
