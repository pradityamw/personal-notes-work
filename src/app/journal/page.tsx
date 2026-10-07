'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ArrowRightCircle,
  Trash2,
  Edit,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { LearningJournal } from '@/types';
import { format } from 'date-fns';

export default function JournalPage() {
  const { learningNotes, projects, addLearningNote, updateLearningNote, deleteLearningNote } = useApp();
  const [searchFilter, setSearchFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<LearningJournal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [insights, setInsights] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [solutions, setSolutions] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [noteDate, setNoteDate] = useState('2026-10-07');

  React.useEffect(() => {
    setNoteDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const projectsMap = projects.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {});

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setWhatLearned('');
    setInsights('');
    setMistakes('');
    setSolutions('');
    setNextSteps('');
    setProjectId(projects[0]?.id || '');
    setTagsInput('');
    setNoteDate(format(new Date(), 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const openEditModal = (n: LearningJournal) => {
    setEditingNote(n);
    setTitle(n.title);
    setWhatLearned(n.what_learned);
    setInsights(n.insights || '');
    setMistakes(n.mistakes || '');
    setSolutions(n.solutions || '');
    setNextSteps(n.next_steps || '');
    setProjectId(n.project_id || '');
    setTagsInput(n.tags.join(', '));
    setNoteDate(n.date || format(new Date(), 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !whatLearned.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      await updateLearningNote(editingNote.id, {
        title,
        what_learned: whatLearned,
        insights,
        mistakes,
        solutions,
        next_steps: nextSteps,
        project_id: projectId || null,
        tags,
        date: noteDate,
      });
    } else {
      await addLearningNote({
        title,
        what_learned: whatLearned,
        insights,
        mistakes,
        solutions,
        next_steps: nextSteps,
        project_id: projectId || null,
        tags,
        date: noteDate,
      });
    }

    setIsModalOpen(false);
  };

  const filtered = learningNotes.filter((n) => {
    const q = searchFilter.toLowerCase();
    return (
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.what_learned.toLowerCase().includes(q) ||
      n.insights?.toLowerCase().includes(q) ||
      n.mistakes?.toLowerCase().includes(q) ||
      n.solutions?.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Learning Journal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Database pembelajaran harian pribadi: Catat apa yang dipelajari, insight kunci, kesalahan (mistakes), solusi praktis, dan next step.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Jurnal Belajar</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Cari insight, kesalahan, atau solusi yang pernah dicatat..."
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      {/* Journal Cards Stack */}
      <div className="space-y-4">
        {filtered.map((note) => (
          <div
            key={note.id}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400/50 dark:hover:border-amber-600/50 transition-all shadow-xs hover:shadow-md relative group space-y-4"
          >
            {/* Top Bar: Date, Project, Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {note.date}
                </span>
                {note.project_id && projectsMap[note.project_id] && (
                  <span className="text-zinc-400">• Project: {projectsMap[note.project_id]}</span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(note)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Hapus catatan belajar ini?')) deleteLearningNote(note.id);
                  }}
                  className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note Title */}
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{note.title}</h2>

            {/* 5 Structural Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Apa yang dipelajari */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Apa yang Dipelajari</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {note.what_learned}
                </p>
              </div>

              {/* Pillar 2: Insight Kunci */}
              {note.insights && (
                <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Insight & Prinsip Utama</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {note.insights}
                  </p>
                </div>
              )}

              {/* Pillar 3: Kesalahan yang dialami */}
              {note.mistakes && (
                <div className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Kesalahan yang Terjadi</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {note.mistakes}
                  </p>
                </div>
              )}

              {/* Pillar 4: Solusi */}
              {note.solutions && (
                <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Solusi Praktis</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {note.solutions}
                  </p>
                </div>
              )}
            </div>

            {/* Pillar 5: Next Step */}
            {note.next_steps && (
              <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <ArrowRightCircle className="w-3.5 h-3.5" />
                  <span>Next Step / Langkah Berikutnya</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {note.next_steps}
                </p>
              </div>
            )}

            {/* Tags Bottom Bar */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {note.tags.map((t) => (
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
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-zinc-400">
            Belum ada catatan jurnal pembelajaran yang cocok.
          </div>
        )}
      </div>

      {/* Modal Learning Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingNote ? 'Edit Jurnal Pembelajaran' : 'Tulis Jurnal Belajar Hari Ini'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Judul Catatan Belajar *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Optimasi Polars vs Pandas pada Dataset Besar"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Project Terkait
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">(Tanpa Project)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5 Question Prompts */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  1. Apa yang Dipelajari? *
                </label>
                <textarea
                  rows={2}
                  required
                  value={whatLearned}
                  onChange={(e) => setWhatLearned(e.target.value)}
                  placeholder="Konsep baru, sintaks, teori, atau fitur yang dipelajari..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  2. Insight & Pelajaran Berharga
                </label>
                <textarea
                  rows={2}
                  value={insights}
                  onChange={(e) => setInsights(e.target.value)}
                  placeholder="Mengapa hal ini penting? Pola apa yang disadari?"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    3. Kesalahan (Mistakes)
                  </label>
                  <textarea
                    rows={2}
                    value={mistakes}
                    onChange={(e) => setMistakes(e.target.value)}
                    placeholder="Apa bug atau kesalahan asumsi awal yang sempat dibuat?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    4. Solusi (Solutions)
                  </label>
                  <textarea
                    rows={2}
                    value={solutions}
                    onChange={(e) => setSolutions(e.target.value)}
                    placeholder="Bagaimana cara memperbaikinya dengan benar?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  5. Next Step / Langkah Selanjutnya
                </label>
                <textarea
                  rows={2}
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  placeholder="Apa yang akan dicoba berikutnya untuk mendalami topik ini?"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tags (Pisahkan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="python, trading, polars, optimization"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
