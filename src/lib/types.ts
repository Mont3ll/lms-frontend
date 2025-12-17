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
  tenant_slug?: string | null; // Tenant slug for API calls
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
  is_required?: boolean; // Whether this item is required for course completion
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
  course_slug: string;
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
  // User-specific attempt summary (only populated for authenticated users)
  user_attempts_count?: number;
  user_best_score?: number | null;
  user_best_percentage?: number | null;
  user_has_passed?: boolean;
  user_latest_attempt_status?: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | null;
  user_attempts_remaining?: number;
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
  content_type_id: number | string; // Backend accepts both integer PK or string model name ("course", "module")
  content_type_name: string;
  content_object?: {
    type: "course" | "module";
    data: Course | Module;
  } | null;
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

export interface CourseIssue {
  type: string;
  message: string;
  suggestion?: string;
}

export interface CourseNeedingAttention {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  enrollments: number;
  activeEnrollments: number;
  issues: CourseIssue[];
  severity: 'low' | 'medium' | 'high';
}

export interface RiskFactor {
  type: string;
  message: string;
}

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  progress: number;
  lastActivity: string;
  daysInactive: number;
  riskFactors: RiskFactor[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface UrgentAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionUrl: string;
  actionLabel: string;
}

export interface InstructorDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  activeStudents: number;
  pendingGrading: number;
  avgCompletionRate: number;
  recentActivity: {
    description: string;
    timestamp: string;
  }[];
  recentAssessments: {
    title: string;
    course: string;
    dueDate: string | null;
    createdAt: string;
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
  // Proactive dashboard metrics
  coursesNeedingAttention: CourseNeedingAttention[];
  atRiskStudents: AtRiskStudent[];
  urgentAlerts: UrgentAlert[];
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

export type AIModelProvider = "OPENAI" | "ANTHROPIC" | "HUGGINGFACE" | "CUSTOM";

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
  data: Record<string, unknown>[] | Record<string, unknown>;
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
  user_email?: string;
  timestamp: string;
}

export interface TenantIssue {
  type: "no_courses" | "low_engagement" | "no_enrollments" | "inactive_tenant";
  message: string;
  suggestion: string;
}

export interface TenantNeedingAttention {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  issues: TenantIssue[];
  severity: "low" | "medium" | "high";
}

export interface PlatformAlert {
  type: "pending_approvals" | "overdue_grading" | "inactive_tenants" | "system_errors";
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
  actionUrl: string;
  actionLabel: string;
}

export interface AdminQuickStats {
  newUsersThisWeek: number;
  newEnrollmentsThisWeek: number;
  coursesPublishedThisWeek: number;
  activeTenantsThisWeek: number;
  coursesCompletedThisWeek: number;
}

export interface AdminDashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalCourses: number;
  activeUsersToday: number;
  userGrowth: UserGrowthDataPoint[];
  recentSystemEvents: RecentSystemEvent[];
  // Proactive dashboard metrics
  tenantsNeedingAttention: TenantNeedingAttention[];
  platformAlerts: PlatformAlert[];
  quickStats: AdminQuickStats;
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

// ============================================
// Platform Settings Types
// Based on backend: apps/core/models.py PlatformSettings
// ============================================

export type StorageBackend = "local" | "s3" | "gcs" | "azure";

export interface GeneralSettings {
  site_name: string;
  site_description: string;
  default_language: string;
  timezone: string;
  support_email: string;
  terms_url: string;
  privacy_url: string;
  logo_url: string;
  favicon_url: string;
}

export interface StorageSettings {
  storage_backend: StorageBackend;
  // S3 settings
  s3_bucket_name: string;
  s3_region: string;
  s3_access_key_id: string;
  s3_secret_access_key?: string; // Write-only, not returned in GET
  s3_endpoint_url: string;
  s3_custom_domain: string;
  // GCS settings
  gcs_bucket_name: string;
  gcs_project_id: string;
  // Azure settings
  azure_container_name: string;
  azure_account_name: string;
  azure_account_key?: string; // Write-only, not returned in GET
  // General file settings
  max_file_size_mb: number;
  allowed_extensions: string;
}

export interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password?: string; // Write-only, not returned in GET
  smtp_use_tls: boolean;
  smtp_use_ssl: boolean;
  default_from_email: string;
  default_from_name: string;
  email_timeout: number;
}

export interface PlatformSettings {
  id: string;
  // General settings
  site_name: string;
  site_description: string;
  default_language: string;
  timezone: string;
  support_email: string;
  terms_url: string;
  privacy_url: string;
  logo_url: string;
  favicon_url: string;
  // Storage settings
  storage_backend: StorageBackend;
  s3_bucket_name: string;
  s3_region: string;
  s3_access_key_id: string;
  s3_endpoint_url: string;
  s3_custom_domain: string;
  gcs_bucket_name: string;
  gcs_project_id: string;
  azure_container_name: string;
  azure_account_name: string;
  max_file_size_mb: number;
  allowed_extensions: string;
  // Email settings
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_use_tls: boolean;
  smtp_use_ssl: boolean;
  default_from_email: string;
  default_from_name: string;
  email_timeout: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface TestEmailRequest {
  recipient_email: string;
}

export interface TestStorageRequest {
  test_file_name?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================
// LTI Platform Types
// Based on backend: apps/core/models.py LTIPlatform
// ============================================

export interface LTIPlatform {
  id: string;
  tenant: string;
  tenant_name?: string;
  name: string;
  issuer: string;
  client_id: string;
  deployment_id?: string;
  auth_login_url?: string;
  auth_token_url?: string;
  keyset_url?: string;
  tool_private_key?: string;
  tool_public_key?: string;
  tool_private_key_set?: boolean; // Indicates if private key is set (for security)
  is_active: boolean;
  deployments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LTIPlatformListItem {
  id: string;
  name: string;
  issuer: string;
  client_id: string;
  is_active: boolean;
  tenant: string;
  tenant_name?: string;
  deployments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface LTIPlatformCreate {
  tenant: string;
  name: string;
  issuer: string;
  client_id: string;
  deployment_id?: string;
  auth_login_url?: string;
  auth_token_url?: string;
  keyset_url?: string;
  tool_private_key?: string;
  tool_public_key?: string;
  is_active?: boolean;
  generate_keys?: boolean; // Auto-generate RSA key pair
}

export interface LTIPlatformUpdate {
  name?: string;
  issuer?: string;
  client_id?: string;
  deployment_id?: string;
  auth_login_url?: string;
  auth_token_url?: string;
  keyset_url?: string;
  tool_private_key?: string;
  tool_public_key?: string;
  is_active?: boolean;
}

export interface LTIJWKS {
  keys: Array<{
    kty: string;
    alg: string;
    use: string;
    kid: string;
    n: string;
    e: string;
  }>;
}

// ============================================
// SSO Configuration Types (Extended)
// Based on backend: apps/core/models.py SSOConfiguration
// ============================================

export interface SSOConfiguration {
  id: string;
  tenant: string;
  tenant_name?: string;
  name: string;
  provider_type: SSOProviderType;
  provider_type_display?: string;
  is_active: boolean;
  is_default: boolean;
  // SAML fields
  idp_entity_id?: string;
  idp_sso_url?: string;
  idp_slo_url?: string;
  idp_x509_cert?: string;
  idp_x509_cert_set?: boolean; // Indicates if cert is set (for security)
  // OAuth fields
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_client_secret_set?: boolean; // Indicates if secret is set (for security)
  oauth_authorization_url?: string;
  oauth_token_url?: string;
  oauth_userinfo_url?: string;
  oauth_scopes?: string;
  // Mappings
  attribute_mapping?: Record<string, string>;
  role_mapping?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface SSOConfigurationListItem {
  id: string;
  name: string;
  provider_type: SSOProviderType;
  provider_type_display?: string;
  is_active: boolean;
  is_default: boolean;
  tenant: string;
  tenant_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SSOConfigurationCreate {
  tenant: string;
  name: string;
  provider_type: SSOProviderType;
  is_active?: boolean;
  is_default?: boolean;
  // SAML fields
  idp_entity_id?: string;
  idp_sso_url?: string;
  idp_slo_url?: string;
  idp_x509_cert?: string;
  // OAuth fields
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_authorization_url?: string;
  oauth_token_url?: string;
  oauth_userinfo_url?: string;
  oauth_scopes?: string;
  // Mappings
  attribute_mapping?: Record<string, string>;
  role_mapping?: Record<string, string>;
}

export interface SSOConfigurationUpdate {
  name?: string;
  provider_type?: SSOProviderType;
  is_active?: boolean;
  is_default?: boolean;
  // SAML fields
  idp_entity_id?: string;
  idp_sso_url?: string;
  idp_slo_url?: string;
  idp_x509_cert?: string;
  // OAuth fields
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_authorization_url?: string;
  oauth_token_url?: string;
  oauth_userinfo_url?: string;
  oauth_scopes?: string;
  // Mappings
  attribute_mapping?: Record<string, string>;
  role_mapping?: Record<string, string>;
}

export interface SSOProviderTypeOption {
  value: SSOProviderType;
  label: string;
}

// ============================================
// Admin Analytics Types (Platform-wide)
// Based on backend: apps/analytics/viewsets.py AdminAnalyticsView
// ============================================

export interface AdminAnalyticsOverview {
  totalUsers: number;
  activeUsers24h: number;
  totalTenants: number;
  totalCourses: number;
  totalEnrollments: number;
  newUsers: number;
  newEnrollments: number;
  avgCompletionRate: number;
}

export interface UserGrowthData {
  date: string;
  users: number;
}

export interface TenantComparisonData {
  id: string;
  name: string;
  slug: string;
  users: number;
  courses: number;
  enrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
}

export interface EventByType {
  type: string;
  count: number;
}

export interface LoginFrequencyData {
  date: string;
  logins: number;
}

export interface PeakUsageData {
  hour: number;
  events: number;
}

export interface SystemActivityData {
  eventsByType: EventByType[];
  loginFrequency: LoginFrequencyData[];
  peakUsageTimes: PeakUsageData[];
}

export interface PopularCourseData {
  id: string;
  title: string;
  instructor: string;
  tenant: string;
  enrollments: number;
}

export interface CourseCompletionRateData {
  id: string;
  title: string;
  completionRate: number;
  totalEnrollments: number;
}

export interface CourseStatusData {
  status: string;
  count: number;
}

export interface CourseMetricsData {
  popularCourses: PopularCourseData[];
  completionRates: CourseCompletionRateData[];
  coursesByStatus: CourseStatusData[];
}

export interface LatestEventData {
  id: string;
  type: string;
  user: string;
  tenant: string;
  timestamp: string;
}

export interface RealTimeStatsData {
  activeSessions: number;
  currentLogins: number;
  eventsLastHour: number;
  latestEvents: LatestEventData[];
}

export interface EventDistributionData {
  type: string;
  count: number;
  percentage: number;
}

export interface GeographicDistributionData {
  country: string;
  region: string;
  users: number;
  events: number;
}

export interface DeviceUsageData {
  device: string;
  users: number;
  events: number;
  percentage: number;
}

export interface AdminAnalyticsData {
  overview: AdminAnalyticsOverview;
  userGrowth: UserGrowthData[];
  tenantComparison: TenantComparisonData[];
  systemActivity: SystemActivityData;
  courseMetrics: CourseMetricsData;
  realTimeStats: RealTimeStatsData;
  eventDistribution: EventDistributionData[];
  geographicData: GeographicDistributionData[];
  deviceUsage: DeviceUsageData[];
}

// ============================================
// Custom Dashboard Types
// Based on backend: apps/analytics/models.py & serializers.py
// ============================================

/** Widget types available for custom dashboards */
export type WidgetType =
  | "stat_card"
  | "line_chart"
  | "bar_chart"
  | "pie_chart"
  | "area_chart"
  | "table"
  | "progress_ring"
  | "leaderboard";

/** Data sources available for widgets */
export type WidgetDataSource =
  | "user_growth"
  | "enrollment_stats"
  | "course_metrics"
  | "completion_rates"
  | "login_frequency"
  | "peak_usage"
  | "tenant_comparison"
  | "device_usage"
  | "geographic_data"
  | "events_by_type"
  | "popular_courses"
  | "active_users"
  | "recent_activity";

/** Dashboard time range options */
export type DashboardTimeRange = "7d" | "30d" | "90d" | "1y" | "all" | "custom";

/** Widget configuration options - varies by widget type */
export interface WidgetConfig {
  // Stat Card options
  metric?: string;
  showTrend?: boolean;
  format?: "number" | "currency" | "percentage";
  trendPeriod?: string;
  
  // Chart options
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  stacked?: boolean;
  orientation?: "horizontal" | "vertical";
  
  // Pie/Donut options
  donut?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
  
  // Area chart options
  gradient?: boolean;
  
  // Table options
  columns?: string[];
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  
  // Progress ring options
  target?: number;
  color?: string;
  
  // Leaderboard options
  limit?: number;
  showRank?: boolean;
  
  // General options
  [key: string]: unknown;
}

/** Dashboard widget as returned from the API */
export interface DashboardWidget {
  id: string;
  widget_type: WidgetType;
  widget_type_display?: string;
  title: string;
  data_source: WidgetDataSource;
  data_source_display?: string;
  config: WidgetConfig;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  order: number;
  created_at: string;
  updated_at: string;
}

/** Dashboard list item (minimal data for lists) */
export interface DashboardListItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_default: boolean;
  is_shared: boolean;
  default_time_range: DashboardTimeRange;
  tenant: string;
  tenant_name: string;
  owner: string | null;
  owner_name: string | null;
  widget_count: number;
  created_at: string;
  updated_at: string;
}

/** Dashboard detail with all widgets */
export interface DashboardDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  layout_config?: Record<string, unknown> | null;
  is_default: boolean;
  is_shared: boolean;
  allowed_roles: string[];
  refresh_interval: number;
  default_time_range: DashboardTimeRange;
  tenant: string;
  tenant_name: string;
  owner: string | null;
  owner_name: string | null;
  widgets: DashboardWidget[];
  created_at: string;
  updated_at: string;
}

/** Data for creating a new dashboard */
export interface DashboardCreateData {
  name: string;
  slug?: string;
  description?: string | null;
  layout_config?: Record<string, unknown> | null;
  is_default?: boolean;
  is_shared?: boolean;
  allowed_roles?: string[];
  refresh_interval?: number;
  default_time_range?: DashboardTimeRange;
  widgets?: WidgetCreateData[];
}

/** Data for updating an existing dashboard */
export interface DashboardUpdateData {
  name?: string;
  slug?: string;
  description?: string | null;
  layout_config?: Record<string, unknown> | null;
  is_default?: boolean;
  is_shared?: boolean;
  allowed_roles?: string[];
  refresh_interval?: number;
  default_time_range?: DashboardTimeRange;
  widgets?: WidgetCreateData[];
}

/** Data for creating/updating a widget */
export interface WidgetCreateData {
  widget_type: WidgetType;
  title: string;
  data_source: WidgetDataSource;
  config?: WidgetConfig;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  order?: number;
}

/** Data for bulk updating widget positions (drag-and-drop) */
export interface WidgetPositionUpdate {
  id: string;
  position_x: number;
  position_y: number;
  width?: number;
  height?: number;
}

/** Widget data response from the API */
export interface WidgetData {
  data: unknown;
  generated_at: string;
  data_source: WidgetDataSource;
  filters_applied?: Record<string, unknown>;
}

/** Widget type metadata */
export interface WidgetTypeMeta {
  key: WidgetType;
  label: string;
  description: string;
  icon?: string;
}

/** Data source metadata */
export interface DataSourceMeta {
  key: WidgetDataSource;
  label: string;
  description: string;
  compatible_widgets: WidgetType[];
}

/** Widget meta response (available types and data sources) */
export interface WidgetMetaResponse {
  widget_types: WidgetTypeMeta[];
  data_sources: DataSourceMeta[];
}

// ============================================
// Discussion Related Types
// Based on backend: apps/discussions/serializers.py
// ============================================

/** User info for discussions (matches UserBasicSerializer) */
export interface DiscussionUserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

/** Status options for discussion threads */
export type DiscussionThreadStatus = "OPEN" | "CLOSED" | "LOCKED";

/** Discussion reply */
export interface DiscussionReply {
  id: string;
  thread: string;
  author: DiscussionUserInfo;
  parent_reply?: string | null;
  content: string;
  is_hidden: boolean;
  like_count: number;
  is_edited: boolean;
  edited_at?: string | null;
  is_liked: boolean;
  child_replies: DiscussionReply[];
  created_at: string;
  updated_at: string;
}

/** Discussion thread (full detail) */
export interface DiscussionThread {
  id: string;
  course: string;
  content_item?: string | null;
  author: DiscussionUserInfo;
  title: string;
  content: string;
  status: DiscussionThreadStatus;
  is_pinned: boolean;
  is_announcement: boolean;
  reply_count: number;
  like_count: number;
  view_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  has_new_replies: boolean;
  recent_replies: DiscussionReply[];
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

/** Discussion thread list item (lightweight) */
export interface DiscussionThreadListItem {
  id: string;
  course: string;
  content_item?: string | null;
  author: DiscussionUserInfo;
  title: string;
  status: DiscussionThreadStatus;
  is_pinned: boolean;
  is_announcement: boolean;
  reply_count: number;
  like_count: number;
  view_count: number;
  is_bookmarked: boolean;
  has_new_replies: boolean;
  last_activity_at: string;
  created_at: string;
}

/** Data for creating a new thread */
export interface DiscussionThreadCreateData {
  course: string;
  content_item?: string | null;
  title: string;
  content: string;
}

/** Data for creating a new reply */
export interface DiscussionReplyCreateData {
  thread: string;
  parent_reply?: string | null;
  content: string;
}

/** Discussion bookmark */
export interface DiscussionBookmark {
  id: string;
  thread: DiscussionThreadListItem;
  created_at: string;
}

// =============================================================================
// Prerequisite Types
// =============================================================================

/** Prerequisite type enum */
export type PrerequisiteType = "REQUIRED" | "RECOMMENDED" | "COREQUISITE";

/** Course prerequisite relationship */
export interface CoursePrerequisite {
  id: string;
  course: string;
  prerequisite_course: string;
  prerequisite_course_title: string;
  prerequisite_course_slug: string;
  prerequisite_type: PrerequisiteType;
  prerequisite_type_display: string;
  minimum_completion_percentage: number;
  created_at: string;
  updated_at: string;
}

/** Data for creating/updating a course prerequisite */
export interface CoursePrerequisiteCreateData {
  prerequisite_course: string;
  prerequisite_type: PrerequisiteType;
  minimum_completion_percentage?: number;
}

/** Module prerequisite relationship */
export interface ModulePrerequisite {
  id: string;
  module: string;
  prerequisite_module: string;
  prerequisite_module_title: string;
  prerequisite_module_order: number;
  prerequisite_type: PrerequisiteType;
  prerequisite_type_display: string;
  minimum_score: number | null;
  created_at: string;
  updated_at: string;
}

/** Data for creating/updating a module prerequisite */
export interface ModulePrerequisiteCreateData {
  prerequisite_module: string;
  prerequisite_type: PrerequisiteType;
  minimum_score?: number | null;
}

// =============================================================================
// Skill Types
// =============================================================================

/** Skill category enum */
export type SkillCategory =
  | "TECHNICAL"
  | "SOFT"
  | "DOMAIN"
  | "LANGUAGE"
  | "METHODOLOGY"
  | "TOOL"
  | "OTHER";

/** Skill proficiency level enum */
export type SkillProficiencyLevel =
  | "NOVICE"
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "EXPERT";

/** Lightweight skill for lists */
export interface SkillListItem {
  id: string;
  name: string;
  slug: string;
  category: SkillCategory;
  category_display: string;
  is_active: boolean;
  parent: string | null;
  parent_name: string | null;
  children_count: number;
  created_at: string;
}

/** Skill ancestor info */
export interface SkillAncestor {
  id: string;
  name: string;
  slug: string;
}

/** Full skill details */
export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  category_display: string;
  parent: string | null;
  parent_name: string | null;
  is_active: boolean;
  external_id: string;
  tags: string[];
  children: SkillListItem[];
  ancestors: SkillAncestor[];
  module_count: number;
  learner_count: number;
  created_at: string;
  updated_at: string;
}

/** Data for creating/updating a skill */
export interface SkillCreateUpdateData {
  name: string;
  description?: string;
  category?: SkillCategory;
  parent?: string | null;
  is_active?: boolean;
  external_id?: string;
  tags?: string[];
}

/** Module skill contribution level */
export type ModuleSkillContributionLevel =
  | "INTRODUCES"
  | "DEVELOPS"
  | "REINFORCES"
  | "MASTERS";

/** Module-skill mapping */
export interface ModuleSkill {
  id: string;
  module: string;
  module_title: string;
  skill: string;
  skill_name: string;
  skill_slug: string;
  skill_category: SkillCategory;
  contribution_level: ModuleSkillContributionLevel;
  contribution_level_display: string;
  proficiency_gained: number;
  is_primary: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

/** Data for creating/updating a module-skill mapping */
export interface ModuleSkillCreateData {
  module: string;
  skill: string;
  contribution_level?: ModuleSkillContributionLevel;
  proficiency_gained?: number;
  is_primary?: boolean;
  order?: number;
}

/** Data for bulk creating module-skill mappings */
export interface ModuleSkillBulkCreateData {
  skill_ids: string[];
  contribution_level?: ModuleSkillContributionLevel;
  proficiency_gained?: number;
}

/** Progress history entry for learner skill progress */
export interface SkillProgressHistoryEntry {
  timestamp: string;
  score: number;
  source: string;
  module_id?: string;
  assessment_id?: string;
}

/** Learner skill progress */
export interface LearnerSkillProgress {
  id: string;
  user: string;
  user_email: string;
  skill: string;
  skill_name: string;
  skill_slug: string;
  skill_category: SkillCategory;
  proficiency_score: number;
  proficiency_level: SkillProficiencyLevel;
  proficiency_level_display: string;
  progress_trend: "improving" | "stable" | "declining";
  last_assessed_at: string | null;
  last_practiced_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Detailed learner skill progress with history */
export interface LearnerSkillProgressDetail extends LearnerSkillProgress {
  recent_history: SkillProgressHistoryEntry[];
  contributing_modules_count: number;
  contributing_assessments_count: number;
}

/** Learner skill summary/dashboard data */
export interface LearnerSkillSummary {
  total_skills: number;
  skills_in_progress: number;
  skills_mastered: number;
  average_proficiency: number;
  strongest_category: string | null;
  weakest_category: string | null;
  recent_improvements: {
    skill_name: string;
    old_level: SkillProficiencyLevel;
    new_level: SkillProficiencyLevel;
    date: string;
  }[];
  skills_by_category: Record<string, number>;
}

/** Skill gap representation */
export interface SkillGap {
  skill_id: string;
  skill_name: string;
  skill_slug: string;
  skill_category: SkillCategory;
  current_level: SkillProficiencyLevel;
  current_score: number;
  target_level: SkillProficiencyLevel;
  target_score: number;
  gap_size: number;
  recommended_modules: {
    module_id: string;
    module_title: string;
    course_title: string;
    contribution_level: ModuleSkillContributionLevel;
  }[];
}

/** Assessment-skill mapping */
export interface AssessmentSkillMapping {
  id: string;
  question: string;
  question_text_preview: string;
  assessment_title: string;
  skill: string;
  skill_name: string;
  skill_slug: string;
  weight: number;
  proficiency_required: SkillProficiencyLevel;
  proficiency_required_display: string;
  proficiency_demonstrated: SkillProficiencyLevel;
  proficiency_demonstrated_display: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Personalized Learning Path Types
// =============================================================================

/** Personalized path generation type */
export type PersonalizedPathGenerationType =
  | "SKILL_GAP"
  | "REMEDIAL"
  | "GOAL_BASED"
  | "ONBOARDING";

/** Personalized path status */
export type PersonalizedPathStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "ARCHIVED";

/** Basic skill info for path target skills */
export interface PathTargetSkillInfo {
  id: string;
  name: string;
  slug: string;
}

/** Personalized path step */
export interface PersonalizedPathStep {
  id: string;
  path: string;
  module: string;
  module_title: string;
  module_slug: string;
  course_title: string;
  order: number;
  is_required: boolean;
  reason: string;
  estimated_duration: number;
  target_skills_info: PathTargetSkillInfo[];
  created_at: string;
  updated_at: string;
}

/** Personalized learning path (full) */
export interface PersonalizedLearningPath {
  id: string;
  user: string;
  user_email: string;
  tenant: string;
  tenant_name: string;
  title: string;
  description: string;
  generation_type: PersonalizedPathGenerationType;
  generation_type_display: string;
  target_skills_info: PathTargetSkillInfo[];
  estimated_duration: number;
  status: PersonalizedPathStatus;
  status_display: string;
  generated_at: string;
  expires_at: string | null;
  generation_params: Record<string, unknown>;
  total_steps: number;
  required_steps_count: number;
  is_expired: boolean;
  steps: PersonalizedPathStep[];
  created_at: string;
  updated_at: string;
}

/** Personalized learning path (list view) */
export interface PersonalizedLearningPathListItem {
  id: string;
  title: string;
  description: string;
  generation_type: PersonalizedPathGenerationType;
  generation_type_display: string;
  estimated_duration: number;
  status: PersonalizedPathStatus;
  status_display: string;
  generated_at: string;
  expires_at: string | null;
  total_steps: number;
  is_expired: boolean;
}

/** Difficulty preference for path generation */
export type PathDifficultyPreference =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ANY";

/** Request data for generating skill-gap based path */
export interface GenerateSkillGapPathRequest {
  target_skills: string[];
  title?: string;
  description?: string;
  max_duration_hours?: number;
  max_modules?: number;
  difficulty_preference?: PathDifficultyPreference;
  include_completed?: boolean;
}

/** Request data for generating remedial path */
export interface GenerateRemedialPathRequest {
  assessment_attempt_id: string;
  title?: string;
  description?: string;
  focus_weak_areas?: boolean;
  max_modules?: number;
}

/** Request data for path preview */
export interface GeneratePathPreviewRequest {
  generation_type: "SKILL_GAP" | "REMEDIAL";
  // Skill gap params
  target_skills?: string[];
  max_duration_hours?: number;
  max_modules?: number;
  difficulty_preference?: PathDifficultyPreference;
  include_completed?: boolean;
  // Remedial params
  assessment_attempt_id?: string;
  focus_weak_areas?: boolean;
}

/** Preview step (not persisted) */
export interface PathPreviewStep {
  module_id: string;
  module_title: string;
  module_slug: string;
  course_title: string;
  order: number;
  is_required: boolean;
  reason: string;
  estimated_duration: number;
  skills_addressed: {
    id: string;
    name: string;
    slug: string;
  }[];
}

/** Path preview response */
export interface PathPreviewResponse {
  title: string;
  description: string;
  generation_type: PersonalizedPathGenerationType;
  estimated_duration: number;
  total_steps: number;
  steps: PathPreviewStep[];
  target_skills: {
    id: string;
    name: string;
    slug: string;
  }[];
  generation_params: Record<string, unknown>;
}

/** Status for learning path progress */
export type LearningPathProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAUSED";

/** Personalized path progress */
export interface PersonalizedPathProgress {
  id: string;
  user: string;
  user_email: string;
  path: string;
  path_title: string;
  path_generation_type: PersonalizedPathGenerationType;
  status: LearningPathProgressStatus;
  status_display: string;
  started_at: string | null;
  completed_at: string | null;
  current_step_order: number;
  last_activity_at: string | null;
  progress_percentage: number;
  current_step_info: {
    id: string;
    order: number;
    module_id: string;
    module_title: string;
    is_required: boolean;
    estimated_duration: number;
  } | null;
  next_step_info: {
    id: string;
    order: number;
    module_id: string;
    module_title: string;
    is_required: boolean;
    estimated_duration: number;
  } | null;
  total_steps: number;
  created_at: string;
  updated_at: string;
}
