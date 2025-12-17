import { Course, Module } from "./course"; // Assumes Course/Module types exist

// Content object structure returned by backend serializer
type StepContentObject = {
  type: "course" | "module";
  data: Partial<Course> | Partial<Module>;
} | null;

export interface LearningPathStep {
  id: string;
  learning_path: string; // LearningPath ID
  order: number;
  is_required: boolean;
  content_type_id: number | string; // ContentType ID (number) or model name ("course", "module")
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

// Step progress for detailed tracking
export interface LearningPathStepProgress {
  id: string;
  user: string;
  learning_path_progress: string;
  step: string;
  step_order: number;
  step_title: string;
  learning_path_title: string;
  content_type_name: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Progress type matching backend serializer
export interface LearningPathProgress {
  id: string;
  user: string;
  user_email: string;
  learning_path: string;
  learning_path_title: string;
  learning_path_slug: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";
  started_at?: string | null;
  completed_at?: string | null;
  current_step_order: number;
  progress_percentage: number;
  current_step_info?: {
    id: string;
    order: number;
    title: string;
    content_type: string;
    is_required: boolean;
  } | null;
  next_step_info?: {
    id: string;
    order: number;
    title: string;
    content_type: string;
    is_required: boolean;
  } | null;
  total_steps: number;
  step_progress: LearningPathStepProgress[];
  completed_step_ids: string[];
  created_at: string;
  updated_at: string;
}
