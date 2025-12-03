export type AIModelProvider =
  | "OPENAI"
  | "ANTHROPIC"
  | "HUGGINGFACE"
  | "CUSTOM"
  | string;

export interface ModelConfig {
  id: string;
  name: string;
  tenant: string; // Tenant ID
  provider: AIModelProvider;
  model_id: string;
  // api_key is write-only
  base_url?: string | null;
  is_active: boolean;
  default_params?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template_type: "custom" | "course_generation" | "assessment_creation" | "content_enhancement" | "feedback_generation";
  template_content: string;
  model_config: number;
  input_variables?: string[];
  is_active: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string | null;
  template_text: string;
  variables?: string[] | null; // List of expected variable names
  tenant: string; // Tenant ID
  tenant_name: string;
  default_model_config?: string | null; // ModelConfig ID
  default_model_config_name?: string | null;
  created_at: string;
  updated_at: string;
}

export type JobStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface GenerationJob {
  id: string;
  status: JobStatus;
  status_display: string;
  tenant: string; // Tenant ID
  user?: { id: string; email: string } | null; // Basic user info
  user_email?: string | null;
  prompt_template?: string | null; // PromptTemplate ID
  prompt_template_name?: string | null;
  model_config_used?: string | null; // ModelConfig ID
  model_name?: string | null;
  celery_task_id?: string | null;
  input_context?: Record<string, unknown> | null;
  generation_params?: Record<string, unknown> | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface GeneratedContent {
  id: string;
  job?: string | null; // GenerationJob ID
  tenant: string; // Tenant ID
  user?: { id: string; email: string } | null; // User who initiated/owns
  user_email?: string | null;
  generated_text: string;
  metadata?: Record<string, unknown> | null;
  is_accepted?: boolean | null;
  rating?: number | null; // 1-5
  evaluation_feedback?: string | null;
  created_at: string;
  // Add related object if needed
}
