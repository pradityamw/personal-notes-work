-- ==============================================================================
-- PROJECT MEMORY & TASK MANAGER: COMPLETE SUPABASE DATABASE SCHEMA
-- PostgreSQL schema for Supabase with RLS (Row Level Security), Enums, and Triggers
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE project_status AS ENUM ('planning', 'active', 'pause', 'completed');
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE ai_model_type AS ENUM ('ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'OpenCode', 'Other');

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(30) DEFAULT '#3b82f6', -- Hex or Tailwind color string
    status project_status DEFAULT 'active',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    reminder TIMESTAMPTZ,
    color_label VARCHAR(30) DEFAULT '#6366f1',
    completed BOOLEAN DEFAULT FALSE,
    checklist JSONB DEFAULT '[]'::jsonb, -- Array of { id: string, text: string, completed: boolean }
    ai_prompt TEXT,
    notes TEXT,
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of { name: string, url: string, type: string, size: number }
    screenshots JSONB DEFAULT '[]'::jsonb, -- Array of { name: string, url: string }
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROMPTS TABLE (AI Prompt Library)
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    ai_output TEXT,
    model ai_model_type DEFAULT 'ChatGPT',
    tags TEXT[] DEFAULT '{}',
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCREENSHOTS TABLE (Knowledge Base & Charts/Backtest Gallery)
CREATE TABLE IF NOT EXISTS public.screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEARNING NOTES TABLE (Learning Journal)
CREATE TABLE IF NOT EXISTS public.learning_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    what_learned TEXT NOT NULL,
    insights TEXT,
    mistakes TEXT,
    solutions TEXT,
    next_steps TEXT,
    tags TEXT[] DEFAULT '{}',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUTOMATIC PROJECT PROGRESS CALCULATION TRIGGER
-- Updates project progress percentage automatically when tasks are completed or moved
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    target_project_id UUID;
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_project_id := OLD.project_id;
    ELSE
        target_project_id := NEW.project_id;
    END IF;

    IF target_project_id IS NOT NULL THEN
        SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = TRUE OR status = 'done')
        INTO total_tasks, completed_tasks
        FROM public.tasks
        WHERE project_id = target_project_id;

        IF total_tasks > 0 THEN
            new_progress := ROUND((completed_tasks::FLOAT / total_tasks::FLOAT) * 100);
        ELSE
            new_progress := 0;
        END IF;

        UPDATE public.projects
        SET progress = new_progress, updated_at = NOW()
        WHERE id = target_project_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_task_progress_update ON public.tasks;
CREATE TRIGGER trigger_task_progress_update
AFTER INSERT OR UPDATE OF completed, status, project_id OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;

-- Policy for Projects
CREATE POLICY "Users can manage their own projects"
ON public.projects FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for Tasks
CREATE POLICY "Users can manage their own tasks"
ON public.tasks FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for Prompts
CREATE POLICY "Users can manage their own prompts"
ON public.prompts FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for Screenshots
CREATE POLICY "Users can manage their own screenshots"
ON public.screenshots FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for Learning Notes
CREATE POLICY "Users can manage their own learning notes"
ON public.learning_notes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. SUPABASE STORAGE BUCKET CONFIGURATION
-- Run in Supabase SQL editor to create storage bucket for screenshots and attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to uploaded files
CREATE POLICY "Public read for project files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Policy for authenticated users to upload files into their own folder
CREATE POLICY "Authenticated users can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-files');

-- Policy for users to delete their own uploaded files
CREATE POLICY "Authenticated users can delete their project files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
