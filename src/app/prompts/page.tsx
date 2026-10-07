'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Star,
  Copy,
  Check,
  Trash2,
  Edit,
  X,
  Bot,
  Filter,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AIPrompt, AIModelType } from '@/types';

const AI_MODELS: AIModelType[] = ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'OpenCode', 'Other'];

export default function PromptsPage() {
  const { prompts, projects, addPrompt, updatePrompt, deletePrompt } = useApp();
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [model, setModel] = useState<AIModelType>('ChatGPT');
  const [projectId, setProjectId] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [rating, setRating] = useState<number>(5);

  const projectsMap = projects.reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.name;
    return acc;
  }, {});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingPrompt(null);
    setTitle('');
    setPromptText('');
    setAiOutput('');
    setModel('ChatGPT');
    setProjectId(projects[0]?.id || '');
    setTagsInput('');
    setRating(5);
    setIsModalOpen(true);
  };

  const openEditModal = (p: AIPrompt) => {
    setEditingPrompt(p);
    setTitle(p.title);
    setPromptText(p.prompt);
    setAiOutput(p.ai_output || '');
    setModel(p.model);
    setProjectId(p.project_id || '');
    setTagsInput(p.tags.join(', '));
    setRating(p.rating);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, {
        title,
        prompt: promptText,
        ai_output: aiOutput,
        model,
        project_id: projectId || null,
        tags,
        rating,
      });
    } else {
      await addPrompt({
        title,
        prompt: promptText,
        ai_output: aiOutput,
        model,
        project_id: projectId || null,
        tags,
        rating,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered prompts
  const filteredPrompts = prompts.filter((p) => {
    const q = searchFilter.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.ai_output?.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    const matchesModel = selectedModel === 'all' || p.model === selectedModel;
    return matchesQuery && matchesModel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            AI Prompt Library
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Simpan prompt terbaik, output AI berharga, dan rating performa model (ChatGPT, Claude, Gemini, DeepSeek, OpenCode).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Simpan Prompt Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari prompt trading, coding, data science, bahasa inggris..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Model Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedModel('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedModel === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            Semua Model
          </button>
          {AI_MODELS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModel(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedModel === m
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPrompts.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md relative group"
          >
            <div>
              {/* Card Header: Model Tag & Rating */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/50">
                    {p.model}
                  </span>
                  {p.project_id && projectsMap[p.project_id] && (
                    <span className="text-[10px] text-zinc-400 font-medium">
                      • {projectsMap[p.project_id]}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Rating Stars */}
                  <div className="flex items-center text-amber-400 mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < p.rating ? 'fill-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Hapus prompt ini dari library?')) deletePrompt(p.id);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{p.title}</h3>

              {/* Prompt Box */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 mb-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Input Prompt
                  </span>
                  <button
                    onClick={() => handleCopy(p.prompt, p.id + '-prompt')}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-purple-600 transition-colors"
                  >
                    {copiedId === p.id + '-prompt' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {p.prompt}
                </p>
              </div>

              {/* AI Output Box */}
              {p.ai_output && (
                <div className="p-3 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 mb-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                      Output AI
                    </span>
                    <button
                      onClick={() => handleCopy(p.ai_output || '', p.id + '-output')}
                      className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      {copiedId === p.id + '-output' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed line-clamp-5">
                    {p.ai_output}
                  </div>
                </div>
              )}
            </div>

            {/* Tags & Date */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              <div className="flex flex-wrap gap-1">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span>{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ))}

        {filteredPrompts.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-zinc-400">
            Tidak ada prompt yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>

      {/* Modal Prompt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingPrompt ? 'Edit AI Prompt' : 'Simpan AI Prompt Baru'}
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
                  Judul Prompt *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Optimasi Python Vectorized EMA & ATR"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Model AI
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as AIModelType)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Hubungkan ke Project
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">(Tanpa Project Khusus)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Prompt Text *
                </label>
                <textarea
                  rows={4}
                  required
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Teks prompt instruksi lengkap yang diberikan kepada AI..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Hasil / Jawaban Output AI
                </label>
                <textarea
                  rows={5}
                  value={aiOutput}
                  onChange={(e) => setAiOutput(e.target.value)}
                  placeholder="Paste kode, penjelasan, atau solusi terbaik yang diberikan oleh AI di sini..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rating Kualitas (1 - 5 Bintang)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Sangat Akurat / Sempurna)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Bagus / Sedikit Tweak)</option>
                    <option value={3}>⭐⭐⭐ (3 - Cukup Membantu)</option>
                    <option value={2}>⭐⭐ (2 - Kurang Lengkap)</option>
                    <option value={1}>⭐ (1 - Buruk / Halusinasi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tags (Pisahkan koma)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="trading, python, docker, ielts"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                >
                  Simpan ke Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
