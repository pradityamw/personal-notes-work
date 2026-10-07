import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_PROMPTS, INITIAL_SCREENSHOTS, INITIAL_LEARNING_NOTES } from '@/lib/mockData';

// GET /api/search?q=keyword
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!q) {
    return NextResponse.json({
      projects: [],
      tasks: [],
      prompts: [],
      screenshots: [],
      learningNotes: [],
      total: 0,
    });
  }

  // If Supabase is configured with real credentials
  if (isSupabaseConfigured()) {
    try {
      const [
        { data: projects },
        { data: tasks },
        { data: prompts },
        { data: screenshots },
        { data: learningNotes },
      ] = await Promise.all([
        supabase.from('projects').select('*').or(`name.ilike.%${q}%,description.ilike.%${q}%`),
        supabase.from('tasks').select('*').or(`title.ilike.%${q}%,description.ilike.%${q}%,notes.ilike.%${q}%`),
        supabase.from('prompts').select('*').or(`title.ilike.%${q}%,prompt.ilike.%${q}%,ai_output.ilike.%${q}%`),
        supabase.from('screenshots').select('*').or(`title.ilike.%${q}%,description.ilike.%${q}%`),
        supabase.from('learning_notes').select('*').or(`title.ilike.%${q}%,what_learned.ilike.%${q}%,insights.ilike.%${q}%`),
      ]);

      const total =
        (projects?.length || 0) +
        (tasks?.length || 0) +
        (prompts?.length || 0) +
        (screenshots?.length || 0) +
        (learningNotes?.length || 0);

      return NextResponse.json({
        projects: projects || [],
        tasks: tasks || [],
        prompts: prompts || [],
        screenshots: screenshots || [],
        learningNotes: learningNotes || [],
        total,
      });
    } catch {
      // Fallback below
    }
  }

  // In-memory fallback
  const matchedProjects = INITIAL_PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );

  const matchedTasks = INITIAL_TASKS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q) ||
      t.ai_prompt?.toLowerCase().includes(q)
  );

  const matchedPrompts = INITIAL_PROMPTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.ai_output?.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );

  const matchedScreenshots = INITIAL_SCREENSHOTS.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
  );

  const matchedNotes = INITIAL_LEARNING_NOTES.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.what_learned.toLowerCase().includes(q) ||
      n.insights?.toLowerCase().includes(q) ||
      n.solutions?.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
  );

  return NextResponse.json({
    projects: matchedProjects,
    tasks: matchedTasks,
    prompts: matchedPrompts,
    screenshots: matchedScreenshots,
    learningNotes: matchedNotes,
    total:
      matchedProjects.length +
      matchedTasks.length +
      matchedPrompts.length +
      matchedScreenshots.length +
      matchedNotes.length,
  });
}
