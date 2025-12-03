// ============================================
// User Related Types
// Based on backend: apps/users/serializers.py
// ============================================

export interface UserProfile {
  id?: string;
  avatar?: string | null;
  bio?: string | null;
  language?: string | null;
  timezone?: string | null;
  preferences?: Record<string, unknown>;
  updated_at?: string;
}

export interface User {
  id: string; // UUID from backend
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string; // Computed field from backend
  role: "LEARNER" | "INSTRUCTOR" | "ADMIN";
  status: "ACTIVE" | "INVITED" | "SUSPENDED" | "DELETED";
  profile?: UserProfile | null;
  tenant?: string; // UUID
  is_active: boolean;
  is_staff: boolean;
  is_superuser?: boolean; // Django's superuser flag (not always exposed)
  last_login?: string | null;
  date_joined: string;
}

// Learner Group types
export interface GroupMembership {
  id: string;
  user: User;
  date_joined: string;
}

export interface LearnerGroup {
  id: string;
  name: string;
  description?: string | null;
  tenant: string;
  tenant_name: string;
  members: GroupMembership[];
  member_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Course Related Types
// Based on backend: apps/courses/serializers.py
// ============================================

export interface ContentItem {
  id: string;
  title: string;
  module?: string; // Module ID (read-only from backend)
  order: number;
  content_type: "TEXT" | "DOCUMENT" | "IMAGE" | "VIDEO" | "AUDIO" | "URL" | "H5P" | "SCORM" | "QUIZ";
  content_type_display?: string;
  text_content?: string | null;
  external_url?: string | null;
  metadata?: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // File reference (for DOCUMENT, IMAGE, VIDEO, AUDIO types)
  file?: {
    id: string;
    original_filename: string;
    file_url: string;
    file_size?: number | null;
    mime_type?: string;
    status?: "PENDING" | "UPLOADING" | "PROCESSING" | "AVAILABLE" | "ERROR" | "DELETED";
  } | null;
  // Progress tracking fields (added when fetching with progress)
  is_completed?: boolean;
  progress_status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progress_details?: unknown;
}

export interface Module {
  id: string;
  title: string;
  description?: string | null;
  course?: string; // Course ID (read-only from backend)
  order: number;
  content_items?: ContentItem[];
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string; // UUID from backend
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  difficulty_level_display?: string;
  estimated_duration?: number | null; // Hours
  price?: string; // Decimal as string
  is_free?: boolean;
  learning_objectives?: string[];
  thumbnail?: string | null;
  tenant?: string; // UUID
  tenant_name?: string;
  instructor?: User | null; // Nested instructor object
  instructor_id?: string; // Write-only for creating/updating
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  status_display?: string;
  tags?: string[];
  modules?: Module[];
  enrollment_count?: number;
  is_enrolled?: boolean;
  enrollment_id?: string | null;
  progress_percentage?: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Enrollment Related Types
// Based on backend: apps/enrollments/serializers.py
// ============================================

export interface Enrollment {
  id: string; // UUID from backend
  user: User;
  course: Course;
  enrolled_at: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  status_display?: string;
  completed_at?: string | null;
  expires_at?: string | null;
  progress_percentage: number; // 0-100
  created_at?: string;
}

export interface LearnerProgress {
  id: string;
  enrollment_id: string;
  user_id: string;
  content_item: ContentItem;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  status_display?: string;
  progress_details?: Record<string, unknown>;
  started_at?: string | null;
  completed_at?: string | null;
  updated_at: string;
}

export interface GroupEnrollment {
  id: string;
  group: LearnerGroup;
  course: Course;
  enrolled_at: string;
}

// ============================================
// Certificate Related Types
// Based on backend: apps/enrollments/serializers.py
// ============================================

export interface Certificate {
  id: string; // UUID from backend
  course_id: string;
  course_title: string;
  user_id: string;
  status: "PENDING" | "ISSUED" | "REVOKED";
  issued_date?: string | null;
  expiry_date?: string | null;
  file_url?: string | null;
  description?: string | null;
  verification_code: string; // UUID
}

// ============================================
// Assessment Related Types
// Based on backend: apps/assessments/serializers.py
// ============================================

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string; // UUID from backend
  assessment: string; // Assessment ID
  order: number;
  question_type: "MC" | "TF" | "SA" | "ES" | "CODE" | "MT" | "FB";
  question_type_display?: string;
  question_text: string;
  points: number;
  type_specific_data?: Record<string, unknown>;
  feedback?: string | null;
  created_at: string;
  updated_at: string;
  // Frontend-transformed field for MC/TF questions
  options?: QuestionOption[];
}

export interface Assessment {
  id: string; // UUID from backend
  course: string; // Course ID
  course_title: string;
  title: string;
  description?: string | null;
  assessment_type: "QUIZ" | "EXAM" | "ASSIGNMENT";
  assessment_type_display?: string;
  grading_type: "AUTO" | "MANUAL" | "HYBRID";
  grading_type_display?: string;
  due_date?: string | null;
  time_limit_minutes?: number | null;
  max_attempts: number;
  pass_mark_percentage: number;
  show_results_immediately: boolean;
  shuffle_questions: boolean;
  is_published: boolean;
  total_points: number;
  questions?: Question[];
  created_at: string;
  updated_at: string;
}

export interface AssessmentAttempt {
  id: string; // UUID from backend
  assessment: string; // Assessment ID
  assessment_title: string;
  user: Pick<User, "id" | "email" | "first_name" | "last_name">;
  start_time: string;
  end_time?: string | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  status_display?: string;
  answers: Record<string, unknown>;
  score?: number | null;
  max_score?: number | null;
  is_passed?: boolean | null;
  graded_by_email?: string | null;
  graded_at?: string | null;
  feedback?: string | null;
  created_at: string;
}

// ============================================
// Learning Path Related Types
// Based on backend: apps/learning_paths/serializers.py
// ============================================

export interface LearningPathStep {
  id: string;
  learning_path: string;
  order: number;
  is_required: boolean;
  content_type_id: string;
  content_type_name: string;
  content_object: {
    type: "course" | "module";
    data: Course | Module;
  };
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  tenant: string;
  tenant_name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  status_display?: string;
  step_count: number;
  steps: LearningPathStep[];
  created_at: string;
  updated_at: string;
}

export interface LearningPathStepProgress {
  id: string;
  user: string;
  learning_path_progress: string;
  step: string;
  step_order: number;
  step_title: string;
  learning_path_title: string;
  content_type_name: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

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
  };
  next_step_info?: {
    id: string;
    order: number;
    title: string;
    content_type: string;
    is_required: boolean;
  };
  total_steps: number;
  step_progress: LearningPathStepProgress[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Tenant Related Types
// Based on backend: apps/tenants/serializers.py
// ============================================

export interface TenantDomain {
  id: string;
  domain: string;
  is_primary: boolean;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  theme_config?: Record<string, unknown>;
  feature_flags?: Record<string, unknown>;
  domains?: TenantDomain[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Notification Related Types
// Based on backend: apps/notifications/serializers.py
// ============================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  action_url?: string | null;
  data?: unknown;
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface InstructorDashboardStats {
  totalCourses: number;
  activeStudents: number;
  pendingGrading: number;
  avgCompletionRate: number;
  recentActivity: {
    description: string;
    timestamp: string;
  }[];
  topCourses: {
    title: string;
    enrollments: number;
    completionRate: number;
  }[];
  upcomingDeadlines: {
    title: string;
    course: string;
    dueDate: string;
  }[];
  topStudents: {
    name: string;
    course: string;
    hoursSpent: number;
  }[];
  revenue: {
    thisMonth: number;
    total: number;
    avgPerCourse: number;
    growth: number;
  };
  contentProgress: {
    drafts: number;
    publishedThisMonth: number;
    modulesCreated: number;
    contentItems: number;
  };
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  details?: unknown;
}

// ============================================
// File/Folder Related Types
// Based on backend: apps/files/serializers.py
// ============================================

export interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  tenant: string;
  tenant_name: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  original_filename: string;
  file_url: string;
  download_url?: string;
  file_size?: number | null;
  mime_type?: string | null;
  status: "PENDING" | "UPLOADING" | "PROCESSING" | "AVAILABLE" | "ERROR" | "DELETED";
  error_message?: string | null;
  folder_id?: string | null;
  tenant: string;
  tenant_name: string;
  uploaded_by_email?: string | null;
  metadata?: Record<string, unknown> | null;
  scan_result?: "CLEAN" | "INFECTED" | string | null;
  created_at: string;
  updated_at: string;
}

// Alias for compatibility with types/index.ts BaseModel pattern
export interface FileType {
  id: string;
  name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  folder: string | null;
  uploaded_by: string;
  is_public: boolean;
  download_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// AI Engine Related Types
// Based on backend: apps/ai_engine/serializers.py
// ============================================

export type AIModelProvider = "OPENAI" | "ANTHROPIC" | "HUGGINGFACE" | "CUSTOM" | string;

export interface ModelConfig {
  id: string;
  name: string;
  tenant: string;
  provider: AIModelProvider;
  model_id: string;
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
  variables?: string[] | null;
  tenant: string;
  tenant_name: string;
  default_model_config?: string | null;
  default_model_config_name?: string | null;
  created_at: string;
  updated_at: string;
}

export type JobStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface GenerationJob {
  id: string;
  status: JobStatus;
  status_display: string;
  tenant: string;
  user?: { id: string; email: string } | null;
  user_email?: string | null;
  prompt_template?: string | null;
  prompt_template_name?: string | null;
  model_config_used?: string | null;
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
  job?: string | null;
  tenant: string;
  user?: { id: string; email: string } | null;
  user_email?: string | null;
  generated_text: string;
  metadata?: Record<string, unknown> | null;
  is_accepted?: boolean | null;
  rating?: number | null;
  evaluation_feedback?: string | null;
  created_at: string;
}

// ============================================
// Analytics Related Types
// Based on backend: apps/analytics/serializers.py
// ============================================

export type EventType =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_REGISTER"
  | "COURSE_VIEW"
  | "COURSE_ENROLL"
  | "COURSE_COMPLETE"
  | "MODULE_VIEW"
  | "CONTENT_VIEW"
  | "CONTENT_COMPLETE"
  | "ASSESSMENT_START"
  | "ASSESSMENT_SUBMIT"
  | "ASSESSMENT_PASS"
  | "ASSESSMENT_FAIL"
  | "FILE_DOWNLOAD"
  | "CERTIFICATE_VIEW"
  | string;

export interface Event {
  id: string;
  event_type: EventType;
  user?: { id: string; email: string } | null;
  user_id?: string | null;
  tenant?: { id: string; name: string } | null;
  tenant_id?: string | null;
  context_data?: Record<string, unknown> | null;
  session_id?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  config?: Record<string, unknown> | null;
  tenant?: string | null;
  tenant_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  layout_config?: Record<string, unknown> | null;
  tenant: string;
  tenant_name: string;
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  report_slug: string;
  report_name: string;
  generated_at: string;
  filters_applied: Record<string, unknown>;
  data: unknown[];
  summary?: Record<string, unknown> | null;
}

// ============================================
// Admin Dashboard Types
// ============================================

export interface UserGrowthDataPoint {
  month: string;
  users: number;
}

export interface RecentSystemEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalCourses: number;
  activeUsersToday: number;
  userGrowth: UserGrowthDataPoint[];
  recentSystemEvents: RecentSystemEvent[];
}

// ============================================
// Instructor Types
// ============================================

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export interface InstructorCourse {
  id: string;
  title: string;
  studentCount: number;
  revenue: number;
  rating: number;
  status: "draft" | "published" | "archived";
}

export interface InstructorDashboardData {
  stats: InstructorStats;
  recentCourses: InstructorCourse[];
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    courseName: string;
    enrolledAt: string;
  }>;
}

// ============================================
// Notification Extended Types
// ============================================

export type NotificationType =
  | "COURSE_ENROLLMENT"
  | "COURSE_COMPLETION"
  | "ASSESSMENT_SUBMISSION"
  | "ASSESSMENT_GRADED"
  | "CERTIFICATE_ISSUED"
  | "DEADLINE_REMINDER"
  | "NEW_CONTENT_AVAILABLE"
  | "ANNOUNCEMENT"
  | "SYSTEM_ALERT"
  | string;

export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ" | "DISMISSED";

export type DeliveryMethod = "EMAIL" | "IN_APP" | "PUSH" | "SMS";

export interface NotificationPreference {
  id: string;
  user: string;
  is_enabled: boolean;
  preferences: {
    [typeKey in NotificationType]?: {
      [methodKey in DeliveryMethod]?: boolean;
    };
  };
  updated_at: string;
}

// ============================================
// Base Model Interface
// ============================================

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// SSO Related Types
// Based on backend: apps/core/models.py
// ============================================

export type SSOProviderType =
  | "SAML"
  | "OAUTH_GOOGLE"
  | "OAUTH_MICROSOFT"
  | "OAUTH_GENERIC"
  | "OIDC";

export interface SSOProvider {
  id: string;
  name: string;
  type: SSOProviderType;
  is_default: boolean;
}

export interface SSOProvidersResponse {
  providers: SSOProvider[];
}
