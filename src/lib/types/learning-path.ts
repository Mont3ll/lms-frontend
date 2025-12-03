import { Course, Module } from "./course"; // Assumes Course/Module types exist

// Minimal representation for content object within step
type StepContentObject = Partial<Course> | Partial<Module> | null;

export interface LearningPathStep {
  id: string;
  learning_path: string; // LearningPath ID
  order: number;
  is_required: boolean;
  content_type_id: number; // ContentType ID (number in Django)
  object_id: string; // UUID of Course or Module
  content_type_name: "course" | "module"; // From serializer
  content_object?: StepContentObject; // Nested Course/Module details (optional)
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  tenant: string; // Tenant ID
  tenant_name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  status_display: string;
  step_count: number;
  steps: LearningPathStep[]; // Nested steps for detail view
  // objectives?: string[];
  // thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Optional: Progress type
export interface LearningPathProgress {
  id: string;
  user: { id: string; email: string; full_name: string }; // Basic user info
  learning_path: { id: string; title: string }; // Basic path info
  status: "not_started" | "in_progress" | "completed";
  completed_step_ids: string[]; // List of completed LearningPathStep IDs
  started_at?: string | null;
  completed_at?: string | null;
  updated_at: string;
}
