'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Task, AIPrompt, ScreenshotKB, LearningJournal, TaskStatus } from '@/types';
import { INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_PROMPTS, INITIAL_SCREENSHOTS, INITIAL_LEARNING_NOTES } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  prompts: AIPrompt[];
  screenshots: ScreenshotKB[];
  learningNotes: LearningJournal[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  toggleTaskChecklist: (taskId: string, checklistId: string) => Promise<void>;
  toggleTaskCompleted: (taskId: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Prompt Actions
  addPrompt: (prompt: Omit<AIPrompt, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<AIPrompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  // Screenshot Actions
  addScreenshot: (screenshot: Omit<ScreenshotKB, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteScreenshot: (id: string) => Promise<void>;
  // Learning Journal Actions
  addLearningNote: (note: Omit<LearningJournal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLearningNote: (id: string, updates: Partial<LearningJournal>) => Promise<void>;
  deleteLearningNote: (id: string) => Promise<void>;
  // Stats
  refreshStats: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [prompts, setPrompts] = useState<AIPrompt[]>(INITIAL_PROMPTS);
  const [screenshots, setScreenshots] = useState<ScreenshotKB[]>(INITIAL_SCREENSHOTS);
  const [learningNotes, setLearningNotes] = useState<LearningJournal[]>(INITIAL_LEARNING_NOTES);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Load from Supabase (if configured) or fallback to local storage
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured()) {
        try {
          const [
            { data: pData },
            { data: tData },
            { data: prData },
            { data: scData },
            { data: nData },
          ] = await Promise.all([
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('tasks').select('*').order('order_index', { ascending: true }),
            supabase.from('prompts').select('*').order('created_at', { ascending: false }),
            supabase.from('screenshots').select('*').order('created_at', { ascending: false }),
            supabase.from('learning_notes').select('*').order('date', { ascending: false }),
          ]);

          if (pData && pData.length > 0) setProjects(pData);
          if (tData && tData.length > 0) setTasks(tData);
          if (prData && prData.length > 0) setPrompts(prData);
          if (scData && scData.length > 0) setScreenshots(scData);
          if (nData && nData.length > 0) setLearningNotes(nData);
        } catch (e) {
          console.warn('Error loading from Supabase, fallback to storage:', e);
        }
      }

      // Check localStorage for any cached or offline values
      try {
        const savedProjects = localStorage.getItem('pmtm_projects');
        const savedTasks = localStorage.getItem('pmtm_tasks');
        const savedPrompts = localStorage.getItem('pmtm_prompts');
        const savedScreenshots = localStorage.getItem('pmtm_screenshots');
        const savedNotes = localStorage.getItem('pmtm_notes');
        const savedDark = localStorage.getItem('pmtm_dark');

        if (!isSupabaseConfigured()) {
          if (savedProjects) setProjects(JSON.parse(savedProjects));
          if (savedTasks) setTasks(JSON.parse(savedTasks));
          if (savedPrompts) setPrompts(JSON.parse(savedPrompts));
          if (savedScreenshots) setScreenshots(JSON.parse(savedScreenshots));
          if (savedNotes) setLearningNotes(JSON.parse(savedNotes));
        }
        if (savedDark !== null) setDarkMode(savedDark === 'true');
      } catch {
        // Fallback gracefully
      }
    }

    loadData();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pmtm_projects', JSON.stringify(projects));
      localStorage.setItem('pmtm_tasks', JSON.stringify(tasks));
      localStorage.setItem('pmtm_prompts', JSON.stringify(prompts));
      localStorage.setItem('pmtm_screenshots', JSON.stringify(screenshots));
      localStorage.setItem('pmtm_notes', JSON.stringify(learningNotes));
      localStorage.setItem('pmtm_dark', darkMode ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [projects, tasks, prompts, screenshots, learningNotes, darkMode]);

  // Handle dark mode html class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Recalculate project progress whenever tasks update
  const recalcProgress = (updatedTasks: Task[], targetProjectId: string) => {
    const projTasks = updatedTasks.filter((t) => t.project_id === targetProjectId);
    if (projTasks.length === 0) return 0;
    const completedCount = projTasks.filter((t) => t.completed || t.status === 'done').length;
    return Math.round((completedCount / projTasks.length) * 100);
  };

  // --- Project Actions ---
  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress'>) => {
    let sessionUser: { id: string } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUser = session?.user ?? null;
    }

    const newProject: Project = {
      ...projectData,
      id: isSupabaseConfigured() ? crypto.randomUUID() : 'proj-' + Date.now(),
      user_id: sessionUser?.id,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
        if (!error && data) {
          setProjects((prev) => [data, ...prev]);
          return;
        } else if (error) {
          console.error('Supabase project insert error:', error.message);
        }
      } catch (err) {
        console.error('Project insert exception:', err);
      }
    }
    setProjects((prev) => [newProject, ...prev]);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('projects').update(updates).eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.project_id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  // --- Task Actions ---
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    let sessionUser: { id: string } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUser = session?.user ?? null;
    }

    const newTask: Task = {
      ...taskData,
      id: isSupabaseConfigured() ? crypto.randomUUID() : 'task-' + Date.now(),
      user_id: sessionUser?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newTasks = [newTask, ...tasks];
    setTasks(newTasks);

    // Update progress on project
    const newProgress = recalcProgress(newTasks, newTask.project_id);
    updateProject(newTask.project_id, { progress: newProgress });

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('tasks').insert([newTask]);
        if (error) console.error('Supabase task insert error:', error.message);
      } catch (err) {
        console.error('Task insert exception:', err);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const newTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setTasks(newTasks);

    const changedTask = newTasks.find((t) => t.id === id);
    if (changedTask) {
      const newProgress = recalcProgress(newTasks, changedTask.project_id);
      updateProject(changedTask.project_id, { progress: newProgress });
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('tasks').update(updates).eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  const moveTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const isNowDone = newStatus === 'done';
    const nowIso = new Date().toISOString();
    const newTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completed: isNowDone ? true : t.completed,
          completed_at: isNowDone ? (t.completed_at || nowIso) : null,
          updated_at: nowIso,
        };
      }
      return t;
    });

    if (isNowDone) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // no-op
      }
    }

    setTasks(newTasks);
    const moved = newTasks.find((t) => t.id === taskId);
    if (moved) {
      const newProgress = recalcProgress(newTasks, moved.project_id);
      updateProject(moved.project_id, { progress: newProgress });
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('tasks')
          .update({
            status: newStatus,
            completed: isNowDone,
            completed_at: isNowDone ? nowIso : null,
          })
          .eq('id', taskId);
      } catch {
        // fallback
      }
    }
  };

  const toggleTaskChecklist = async (taskId: string, checklistId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newChecklist = task.checklist.map((item) =>
      item.id === checklistId ? { ...item, completed: !item.completed } : item
    );

    const allChecklistDone = newChecklist.length > 0 && newChecklist.every((item) => item.completed);
    const nowIso = new Date().toISOString();

    await updateTask(taskId, {
      checklist: newChecklist,
      ...(allChecklistDone && { status: 'done', completed: true, completed_at: nowIso }),
    });

    if (allChecklistDone) {
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {
        // no-op
      }
    }
  };

  const toggleTaskCompleted = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    const newStatus: TaskStatus = newCompleted ? 'done' : 'in_progress';
    const nowIso = new Date().toISOString();

    if (newCompleted) {
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {
        // no-op
      }
    }

    await updateTask(taskId, {
      completed: newCompleted,
      status: newStatus,
      completed_at: newCompleted ? nowIso : null,
    });
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);

    if (task) {
      const newProgress = recalcProgress(newTasks, task.project_id);
      updateProject(task.project_id, { progress: newProgress });
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  // --- AIPrompt Actions ---
  const addPrompt = async (promptData: Omit<AIPrompt, 'id' | 'created_at' | 'updated_at'>) => {
    let sessionUser: { id: string } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUser = session?.user ?? null;
    }

    const newPrompt: AIPrompt = {
      ...promptData,
      id: isSupabaseConfigured() ? crypto.randomUUID() : 'prompt-' + Date.now(),
      user_id: sessionUser?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPrompts((prev) => [newPrompt, ...prev]);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('prompts').insert([newPrompt]);
        if (error) console.error('Supabase prompt insert error:', error.message);
      } catch (err) {
        console.error('Prompt insert exception:', err);
      }
    }
  };

  const updatePrompt = async (id: string, updates: Partial<AIPrompt>) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('prompts').update(updates).eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  const deletePrompt = async (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('prompts').delete().eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  // --- Screenshot Actions ---
  const addScreenshot = async (ssData: Omit<ScreenshotKB, 'id' | 'created_at' | 'updated_at'>) => {
    let sessionUser: { id: string } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUser = session?.user ?? null;
    }

    const newSS: ScreenshotKB = {
      ...ssData,
      id: isSupabaseConfigured() ? crypto.randomUUID() : 'ss-' + Date.now(),
      user_id: sessionUser?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setScreenshots((prev) => [newSS, ...prev]);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('screenshots').insert([newSS]);
        if (error) console.error('Supabase screenshot insert error:', error.message);
      } catch (err) {
        console.error('Screenshot insert exception:', err);
      }
    }
  };

  const deleteScreenshot = async (id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('screenshots').delete().eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  // --- Learning Notes Actions ---
  const addLearningNote = async (noteData: Omit<LearningJournal, 'id' | 'created_at' | 'updated_at'>) => {
    let sessionUser: { id: string } | null = null;
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUser = session?.user ?? null;
    }

    const newNote: LearningJournal = {
      ...noteData,
      id: isSupabaseConfigured() ? crypto.randomUUID() : 'note-' + Date.now(),
      user_id: sessionUser?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLearningNotes((prev) => [newNote, ...prev]);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('learning_notes').insert([newNote]);
        if (error) console.error('Supabase note insert error:', error.message);
      } catch (err) {
        console.error('Note insert exception:', err);
      }
    }
  };

  const updateLearningNote = async (id: string, updates: Partial<LearningJournal>) => {
    setLearningNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('learning_notes').update(updates).eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  const deleteLearningNote = async (id: string) => {
    setLearningNotes((prev) => prev.filter((n) => n.id !== id));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('learning_notes').delete().eq('id', id);
      } catch {
        // fallback
      }
    }
  };

  const refreshStats = () => {
    // re-eval
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        prompts,
        screenshots,
        learningNotes,
        selectedProjectId,
        setSelectedProjectId,
        searchQuery,
        setSearchQuery,
        darkMode,
        setDarkMode,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        moveTaskStatus,
        toggleTaskChecklist,
        toggleTaskCompleted,
        deleteTask,
        addPrompt,
        updatePrompt,
        deletePrompt,
        addScreenshot,
        deleteScreenshot,
        addLearningNote,
        updateLearningNote,
        deleteLearningNote,
        refreshStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
