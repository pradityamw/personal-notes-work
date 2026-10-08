export type ProjectStatus = 'planning' | 'active' | 'pause' | 'completed';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type AIModelType = 'ChatGPT' | 'Claude' | 'Gemini' | 'DeepSeek' | 'OpenCode' | 'Other';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AttachmentItem {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  progress: number;
  deadline: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id?: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  due_date: string | null;
  reminder: string | null;
  color_label: string;
  completed: boolean;
  completed_at?: string | null;
  result_notes?: string | null;
  checklist: ChecklistItem[];
  ai_prompt?: string | null;
  notes?: string | null;
  attachments: AttachmentItem[];
  screenshots: AttachmentItem[];
  order_index?: number;
  created_at: string;
  updated_at: string;
  // Joined relation for UI display
  project?: Project;
}

export interface AIPrompt {
  id: string;
  user_id?: string;
  project_id: string | null;
  title: string;
  prompt: string;
  ai_output: string | null;
  model: AIModelType;
  tags: string[];
  rating: number; // 1 - 5
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface ScreenshotKB {
  id: string;
  user_id?: string;
  project_id: string | null;
  title: string;
  image_url: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface LearningJournal {
  id: string;
  user_id?: string;
  project_id: string | null;
  title: string;
  what_learned: string;
  insights: string | null;
  mistakes: string | null;
  solutions: string | null;
  next_steps: string | null;
  tags: string[];
  date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  project?: Project;
}
