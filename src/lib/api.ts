import axios, { AxiosError } from "axios";
// Import only the types that actually exist in the main types file
import {
  Course,
  PaginatedResponse,
  User,
  Assessment,
  AssessmentAttempt,
  Question,
  Enrollment,
  Certificate,
  LearningPath,
  LearningPathStep,
  LearningPathProgress,
  LearningPathStepProgress,
  Tenant,
  LearnerProgress,
  InstructorDashboardStats,
  LearnerGroup,
  Module,
  ContentItem,
  Folder,
  File as FileType,
  ModelConfig,
  PromptTemplate,
  GenerationJob,
  GeneratedContent,
  NotificationPreference,
  AdminDashboardStats,
  Report,
  Dashboard,
  ReportData,
  // Discussion types
  DiscussionThread,
  DiscussionThreadListItem,
  DiscussionThreadCreateData,
  DiscussionThreadStatus,
  DiscussionReply,
  DiscussionReplyCreateData,
  DiscussionBookmark,
  CoursePrerequisite,
  CoursePrerequisiteCreateData,
  PrerequisiteType,
  ModulePrerequisite,
  ModulePrerequisiteCreateData,
  SkillCategory,
  SkillListItem,
  SkillProficiencyLevel,
  Skill,
  SkillCreateUpdateData,
  ModuleSkill,
  ModuleSkillCreateData,
  ModuleSkillBulkCreateData,
  LearnerSkillProgress,
  LearnerSkillProgressDetail,
  LearnerSkillSummary,
  SkillGap,
  AssessmentSkillMapping,
  PersonalizedPathGenerationType,
  PersonalizedPathStatus,
  PersonalizedPathStep,
  PersonalizedPathProgress,
  PersonalizedLearningPath,
  PersonalizedLearningPathListItem,
  GenerateSkillGapPathRequest,
  GenerateRemedialPathRequest,
  GeneratePathPreviewRequest,
  PathPreviewResponse,
  LearningPathProgressStatus,
} from "./types";
import { Notification } from "./types/notification";

// ============================================
// API-Specific Types
// ============================================

/** Standard API error response structure */
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

/** Query parameters for paginated list endpoints */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined | null;
}

/** User registration data */
export interface UserRegistrationData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role?: "LEARNER" | "INSTRUCTOR" | "ADMIN";
}

/** User create data (admin) */
export interface UserCreateData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: "LEARNER" | "INSTRUCTOR" | "ADMIN";
  is_active?: boolean;
}

/** User update data */
export interface UserUpdateData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: "LEARNER" | "INSTRUCTOR" | "ADMIN";
  status?: "ACTIVE" | "INVITED" | "SUSPENDED" | "DELETED";
  is_active?: boolean;
  profile?: {
    bio?: string | null;
    language?: string | null;
    timezone?: string | null;
    preferences?: Record<string, unknown>;
  };
}

/** Module create/update data */
export interface ModuleData {
  title: string;
  description?: string | null;
  order?: number;
}

/** Content item create/update data */
export interface ContentItemData {
  title: string;
  order?: number;
  content_type: "TEXT" | "DOCUMENT" | "IMAGE" | "VIDEO" | "AUDIO" | "URL" | "H5P" | "SCORM" | "QUIZ";
  text_content?: string | null;
  external_url?: string | null;
  file_id?: string | null;
  metadata?: Record<string, unknown>;
  is_published?: boolean;
}

/** Content version data */
export interface ContentVersion {
  id: string;
  version_number: number;
  content_snapshot: Record<string, unknown>;
  comment?: string | null;
  created_by_email?: string;
  created_at: string;
}

/** Assessment create/update data */
export interface AssessmentData {
  course: string;
  title: string;
  description?: string | null;
  assessment_type: "QUIZ" | "EXAM" | "ASSIGNMENT";
  grading_type?: "AUTO" | "MANUAL" | "HYBRID";
  due_date?: string | null;
  time_limit_minutes?: number | null;
  max_attempts?: number;
  pass_mark_percentage?: number;
  show_results_immediately?: boolean;
  shuffle_questions?: boolean;
  is_published?: boolean;
}

/** Question create/update data */
export interface QuestionData {
  order?: number;
  question_type: "MC" | "TF" | "SA" | "ES" | "CODE" | "MT" | "FB";
  question_text: string;
  points?: number;
  type_specific_data?: Record<string, unknown>;
  feedback?: string | null;
}

/** Learning path create/update data */
export interface LearningPathData {
  title: string;
  slug?: string;
  description?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

/** Learning path step create/update data */
export interface LearningPathStepData {
  order?: number;
  is_required?: boolean;
  content_type_id: number | string;
  object_id: string;
}

/** AI generation job start data */
export interface AIGenerationJobData {
  prompt_template_id?: string;
  model_config_id?: string;
  input_context?: Record<string, unknown>;
  generation_params?: Record<string, unknown>;
  prompt_text?: string;
}

/** Tenant create/update data */
export interface TenantData {
  name: string;
  slug?: string;
  is_active?: boolean;
  theme_config?: Record<string, unknown>;
  feature_flags?: Record<string, unknown>;
}

/** Learner dashboard stats */
export interface LearnerDashboardStats {
  activeCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  learningStreak: number;
  overallProgress: number;
  totalStudyHours: number;
  lessonsCompleted: number;
  averageAssessmentScore: number;
  learningPaths: Array<{
    title: string;
    progressPercentage: number;
    completedSteps: number;
    totalSteps: number;
  }>;
  weeklyLessonsCompleted: number;
  weeklyAssessmentsTaken: number;
  weeklyStudyHours: number;
  recentActivity: Array<{
    description: string;
    timestamp: string;
  }>;
  upcomingDeadlines: Array<{
    title: string;
    course: string;
    dueDate: string;
  }>;
  recentAchievements: Array<{
    title: string;
    earnedDate: string;
  }>;
  continueLearning: {
    courseId: number;
    courseTitle: string;
    courseSlug: string;
    courseThumbnail: string | null;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    nextLesson: {
      id: number;
      title: string;
      moduleTitle: string;
      contentType: string;
    } | null;
  } | null;
  coursesInProgress: Array<{
    courseId: number;
    courseTitle: string;
    courseSlug: string;
    courseThumbnail: string | null;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: string;
  }>;
}

/** AI-powered content recommendation */
export interface ContentRecommendation {
  type: 'course' | 'learning_path';
  id: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  enrollment_count?: number;
  reason: string;
  score: number;
}

/** Learner recommendations response */
export interface LearnerRecommendationsResponse {
  recommendations: ContentRecommendation[];
  total: number;
}

/** Daily activity data for learner insights */
export interface LearnerDailyActivity {
  date: string;
  minutes_spent: number;
  activities_count: number;
}

/** Activity breakdown by type */
export interface LearnerActivityBreakdown {
  content_views: number;
  video_watches: number;
  quiz_attempts: number;
  assessments_completed: number;
}

/** Course progress item in learner insights */
export interface LearnerCourseProgress {
  course_id: string;
  course_slug: string;
  course_title: string;
  instructor_name: string | null;
  status: string;
  progress_percentage: number;
  items_completed: number;
  total_items: number;
  enrolled_at: string | null;
  completed_at: string | null;
  last_activity: string | null;
}

/** Assessment performance by type */
export interface AssessmentTypePerformance {
  average_score: number;
  total_attempts: number;
  passed: number;
  pass_rate: number;
}

/** Recent assessment result */
export interface RecentAssessmentResult {
  assessment_title: string;
  course_title: string;
  score: number;
  is_passed: boolean;
  completed_at: string | null;
}

/** Score trend data point */
export interface ScoreTrendPoint {
  date: string | null;
  score: number;
}

/** Optimal study hour */
export interface OptimalStudyHour {
  hour: number;
  engagement_score: number;
}

/** Learner insight recommendation */
export interface LearnerInsightRecommendation {
  type: "engagement" | "completion" | "reminder" | "improvement" | "achievement";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  course_slug?: string;
}

/** Complete learner insights response */
export interface LearnerInsights {
  user_id: string;
  generated_at: string;
  overview: {
    total_courses_enrolled: number;
    courses_completed: number;
    courses_in_progress: number;
    overall_progress_percentage: number;
    total_learning_hours: number;
    current_streak_days: number;
    certificates_earned: number;
  };
  learning_activity: {
    daily_activity: LearnerDailyActivity[];
    activity_breakdown: LearnerActivityBreakdown;
    this_week_total_minutes: number;
  };
  course_progress: LearnerCourseProgress[];
  assessment_performance: {
    total_assessments_taken: number;
    assessments_passed: number;
    average_score: number;
    pass_rate: number;
    performance_by_type: Record<string, AssessmentTypePerformance>;
    recent_results: RecentAssessmentResult[];
    score_trend: ScoreTrendPoint[];
  };
  learning_patterns: {
    optimal_study_hours: OptimalStudyHour[];
    preferred_study_days: string[];
    average_session_duration_minutes: number;
    total_sessions_last_30_days: number;
    device_usage: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  recommendations: {
    items: LearnerInsightRecommendation[];
    total_count: number;
  };
}

/** Assessment answer value types */
export type AnswerValue = string | string[] | number | boolean | Record<string, string>;

/** Remedial recommendation item from PersonalizationService */
export interface RemedialRecommendation {
  type: 'content_item' | 'course_review';
  id: string;
  title: string;
  content_type: string;
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  related_assessment: string;
}

/** Remedial recommendations response */
export interface RemedialRecommendationsResponse {
  count: number;
  recommendations: RemedialRecommendation[];
}

/** Student performance record */
export interface StudentPerformance {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  course_id: string;
  course_title: string;
  overall_score: number;
  completion_percentage: number;
  time_spent_minutes: number;
  assessment_scores: Array<{
    assessment_id: string;
    assessment_title: string;
    score: number;
    max_score: number;
  }>;
  last_activity_at: string;
}

/** Engagement metrics record */
export interface EngagementMetrics {
  id: string;
  course_id: string;
  course_title: string;
  total_views: number;
  unique_users: number;
  avg_session_duration_minutes: number;
  completion_rate: number;
  bounce_rate: number;
  engagement_score: number;
  period_start: string;
  period_end: string;
}

/** Assessment analytics record */
export interface AssessmentAnalytics {
  id: string;
  assessment_id: string;
  assessment_title: string;
  course_id: string;
  course_title: string;
  total_attempts: number;
  avg_score: number;
  pass_rate: number;
  avg_time_taken_minutes: number;
  question_analytics: Array<{
    question_id: string;
    question_text: string;
    correct_rate: number;
    avg_time_seconds: number;
  }>;
}

/** Instructor analytics response - comprehensive dashboard data */
export interface InstructorAnalytics {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    avgRating: number;
    completionRate: number;
    engagementRate: number;
  };
  coursePerformance: Array<{
    id: string;
    title: string;
    students: number;
    completionRate: number;
    rating: number;
    revenue: number;
    engagement: number;
  }>;
  studentEngagement: {
    daily: Array<{
      date: string;
      activeStudents: number;
      timeSpent: number;
    }>;
    weekly: Array<{
      date: string;
      activeStudents: number;
      timeSpent: number;
    }>;
    monthly: Array<{
      date: string;
      activeStudents: number;
      timeSpent: number;
    }>;
  };
  revenueData: {
    monthly: Array<{
      month: string;
      revenue: number;
      students: number;
    }>;
    byCourse: Array<{
      courseTitle: string;
      revenue: number;
      students: number;
    }>;
  };
  topPerformers: {
    courses: Array<{
      title: string;
      metric: string;
      value: number;
    }>;
    students: Array<{
      name: string;
      course: string;
      progress: number;
      timeSpent: number;
    }>;
  };
  studentDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  cumulativeProgress: Array<{
    date: string;
    completed: number;
    inProgress: number;
    notStarted: number;
  }>;
  activityHeatmap: Array<{
    day: string;
    hour: number;
    intensity: number;
    count: number;
  }>;
  deviceUsage: Array<{
    device: string;
    percentage: number;
    users: number;
  }>;
  geographicData: Array<{
    region: string;
    students: number;
    revenue: number;
  }>;
  learningPaths: Array<{
    path: string;
    completionRate: number;
    avgTime: number;
  }>;
  predictiveAnalytics: {
    studentAtRisk: Array<{
      id: string;
      name: string;
      riskScore: number;
      reasons: string[];
    }>;
    courseRecommendations: Array<{
      action: string;
      impact: string;
      confidence: number;
    }>;
    revenueForecasting: {
      next_month: number;
      next_quarter: number;
      confidence: number;
    };
    trendsAnalysis: {
      enrollment_trend: string;
      engagement_trend: string;
      completion_trend: string;
    };
  };
  aiInsights: {
    keyInsights: Array<{
      type: 'positive' | 'warning' | 'neutral';
      message: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    recommendations: Array<{
      action: string;
      expected_impact: string;
    }>;
    anomalies: Array<{
      type: string;
      metric: string;
      description: string;
    }>;
  };
  realTimeData: {
    activeUsers: number;
    currentSessions: number;
    liveEngagement: number;
    serverHealth: number;
  };
  socialLearning: {
    discussions: Array<{
      courseId: string;
      messages: number;
      participants: number;
    }>;
    peerReviews: Array<{
      courseId: string;
      reviews: number;
      avgRating: number;
    }>;
    collaborativeProjects: Array<{
      projectId: string;
      title: string;
      participants: number;
      completionRate: number;
    }>;
  };
  learningEfficiency: {
    optimalStudyTimes: Array<{
      hour: number;
      efficiency: number;
    }>;
    contentEffectiveness: Array<{
      contentType: string;
      avgTimeSpent: number;
      completionRate: number;
    }>;
    difficultyProgression: Array<{
      lesson: string;
      difficultyScore: number;
      successRate: number;
    }>;
  };
}

/** Model config create/update data */
export interface ModelConfigData {
  name: string;
  provider: "OPENAI" | "ANTHROPIC" | "HUGGINGFACE" | "CUSTOM" | string;
  model_id: string;
  base_url?: string | null;
  api_key?: string;
  is_active?: boolean;
  default_params?: Record<string, unknown> | null;
}

/** Prompt template create/update data */
export interface PromptTemplateData {
  name: string;
  description?: string | null;
  template_text: string;
  variables?: string[] | null;
  default_model_config?: string | null;
}

/** Module bulk update item */
/** Tenant create/update data */
export interface TenantData {
  name: string;
  slug?: string;
  is_active?: boolean;
  theme_config?: Record<string, unknown>;
  feature_flags?: Record<string, unknown>;
}

/** Domain management response */
export interface DomainManagementResponse {
  message: string;
  domains: Array<{
    id: string;
    domain: string;
    is_primary: boolean;
    created_at: string;
  }>;
}

/** Manual grading data */
export interface ManualGradeData {
  score: number;
  feedback?: string;
  question_scores?: Record<string, { score: number; feedback?: string }>;
}

/** Instructor report */
export interface InstructorReport {
  id: string;
  title: string;
  type: string;
  generated_at: string;
  download_url?: string;
  data?: Record<string, unknown>;
}

/** Learning path user progress */
export interface LearningPathUserProgress {
  learning_path_id: string;
  learning_path_title: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";
  current_step_order: number;
  progress_percentage: number;
  total_steps: number;
  completed_steps: number;
  started_at?: string | null;
  completed_at?: string | null;
  step_progress: Array<{
    step_id: string;
    step_order: number;
    step_title: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
    content_type: string;
    completed_at?: string | null;
  }>;
}

export interface ModuleBulkUpdateItem {
  id: string;
  title?: string;
  description?: string | null;
  order?: number;
  content_items?: Array<{
    id?: string;
    title: string;
    order: number;
    content_type: string;
    text_content?: string | null;
    external_url?: string | null;
    file_id?: string | null;
    is_published?: boolean;
  }>;
}

import { getTenantSlugFromSubdomain } from "./utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor to add auth token, tenant slug, and CSRF token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage on each request
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add tenant slug from subdomain for multi-tenant support
      const tenantSlug = getTenantSlugFromSubdomain();
      if (tenantSlug) {
        config.headers["X-Tenant-Slug"] = tenantSlug;
      }

      // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
      // This is needed if Django SessionAuthentication is enabled
      const method = config.method?.toLowerCase();
      if (method && ["post", "put", "patch", "delete"].includes(method)) {
        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrftoken="))
          ?.split("=")[1];
        if (csrfToken) {
          config.headers["X-CSRFToken"] = csrfToken;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/login/refresh/`,
              {
                refresh: refreshToken,
              },
            );

            const newToken = response.data.access;
            localStorage.setItem("authToken", newToken);
            // Sync to cookie for middleware authentication
            const expires = new Date();
            expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
            const secure = window.location.protocol === "https:" ? "; Secure" : "";
            document.cookie = `authToken=${newToken}; expires=${expires.toUTCString()}; path=/${secure}; SameSite=Lax`;

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            // Clear cookie
            document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, redirect to login
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

// Error Handling Helper
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.detail)
      return axiosError.response.data.detail;
    if (
      axiosError.response?.data &&
      typeof axiosError.response.data === "object"
    ) {
      const firstErrorKey = Object.keys(axiosError.response.data)[0];
      const errorValue = axiosError.response.data[firstErrorKey];
      if (firstErrorKey && Array.isArray(errorValue))
        return errorValue[0];
      if (firstErrorKey && errorValue) return String(errorValue);
    }
    return axiosError.message || "An unknown API error occurred.";
  } else if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
};

// Helper function for query parameters
const buildUrl = (baseUrl: string, params?: Record<string, string | number | boolean | undefined | null>): string => {
  if (!params) return baseUrl;
  const queryParams = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, String(params[key]));
    }
  }
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// === Auth ===
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{ access: string; refresh: string; user?: Partial<User> }> => {
  // user might not be returned by default JWT
  const response = await apiClient.post("/auth/login/", credentials);
  return response.data;
};
export const refreshToken = async (refreshToken: string): Promise<string> => {
  const response = await apiClient.post<{ access: string }>(
    "/auth/login/refresh/",
    { refresh: refreshToken },
  );
  return response.data.access;
};
export const registerUser = async (userData: UserRegistrationData): Promise<User> => {
  const response = await apiClient.post<User>("/auth/register/", userData);
  return response.data;
};
export const fetchUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/profile/");
  return response.data;
};
export const updateUserProfile = async (
  userId: string,
  data: {
    first_name?: string;
    last_name?: string;
    profile?: {
      bio?: string | null;
      language?: string | null;
      timezone?: string | null;
    };
  },
): Promise<User> => {
  const response = await apiClient.patch<User>(`/auth/profile/`, data); // Assuming profile endpoint updates current user
  return response.data;
};
export const changePassword = async (data: {
  old_password: string;
  new_password: string;
  new_password2: string;
}): Promise<{ detail: string }> => {
  const response = await apiClient.post<{ detail: string }>("/auth/profile/change-password/", data);
  return response.data;
};

// === Password Reset ===
export const requestPasswordReset = async (data: {
  email: string;
}): Promise<{ detail: string }> => {
  const response = await apiClient.post<{ detail: string }>(
    "/auth/password/reset/",
    data
  );
  return response.data;
};

export const confirmPasswordReset = async (data: {
  uid: string;
  token: string;
  new_password: string;
  new_password2: string;
}): Promise<{ detail: string }> => {
  const response = await apiClient.post<{ detail: string }>(
    "/auth/password/reset/confirm/",
    data
  );
  return response.data;
};

// === SSO Authentication ===
import type { SSOProvidersResponse } from "./types";

export const fetchSSOProviders = async (): Promise<SSOProvidersResponse> => {
  const response = await apiClient.get<SSOProvidersResponse>("/core/sso/providers/");
  return response.data;
};

export const getSSOLoginUrl = (
  providerId?: string,
  providerType?: string,
  returnUrl?: string
): string => {
  const params = new URLSearchParams();
  if (providerId) params.set("provider_id", providerId);
  if (providerType) params.set("provider_type", providerType);
  // Include relay_state for the callback to know where to redirect after SSO
  const relayState = returnUrl || "/dashboard";
  params.set("relay_state", relayState);
  return `${API_BASE_URL}/core/sso/login/?${params.toString()}`;
};

// === Users (Admin) ===
export const fetchUsers = async (
  params: PaginationParams & { role?: string; status?: string; tenant?: string } = {},
): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>(
    "/users/manage/",
    { params },
  );
  return response.data;
};
export const fetchUserDetails = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/manage/${userId}/`);
  return response.data;
};
export const createUser = async (userData: UserCreateData): Promise<User> => {
  const response = await apiClient.post<User>("/users/manage/", userData);
  return response.data;
};
export const updateUser = async (
  userId: string,
  userData: UserUpdateData,
): Promise<User> => {
  const response = await apiClient.patch<User>(
    `/users/manage/${userId}/`,
    userData,
  );
  return response.data;
};
export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/manage/${userId}/`);
};

// === Groups (Admin/Instructor) ===
export const fetchLearnerGroups = async (
  params: PaginationParams & { tenant?: string } = {},
): Promise<PaginatedResponse<LearnerGroup>> => {
  const response = await apiClient.get<PaginatedResponse<LearnerGroup>>(
    "/users/groups/",
    { params },
  );
  return response.data;
};
export const fetchLearnerGroupDetails = async (
  groupId: string,
): Promise<LearnerGroup> => {
  const response = await apiClient.get<LearnerGroup>(`/users/groups/${groupId}/`);
  return response.data;
};
export const createLearnerGroup = async (data: {
  name: string;
  description?: string;
  member_ids?: string[];
}): Promise<LearnerGroup> => {
  const response = await apiClient.post<LearnerGroup>("/users/groups/", data);
  return response.data;
};
export const updateLearnerGroup = async (
  groupId: string,
  data: { name?: string; description?: string; member_ids?: string[] },
): Promise<LearnerGroup> => {
  const response = await apiClient.patch<LearnerGroup>(
    `/users/groups/${groupId}/`,
    data,
  );
  return response.data;
};
export const deleteLearnerGroup = async (groupId: string): Promise<void> => {
  await apiClient.delete(`/users/groups/${groupId}/`);
};
export const addMembersToGroup = async (
  groupId: string,
  userIds: string[],
): Promise<{ added_count: number; members: string[] }> => {
  const response = await apiClient.post<{ added_count: number; members: string[] }>(
    `/users/groups/${groupId}/add_members/`,
    { user_ids: userIds },
  );
  return response.data;
};
export const removeMembersFromGroup = async (
  groupId: string,
  userIds: string[],
): Promise<{ removed_count: number; members: string[] }> => {
  const response = await apiClient.post<{ removed_count: number; members: string[] }>(
    `/users/groups/${groupId}/remove_members/`,
    { user_ids: userIds },
  );
  return response.data;
};

// === Courses ===
export const fetchCourses = async (
  params: PaginationParams & { 
    status?: string; 
    category?: string; 
    instructor?: string; 
    is_enrolled?: boolean;
    difficulty_level?: string;
    max_duration?: number;
  } = {},
): Promise<PaginatedResponse<Course>> => {
  const response = await apiClient.get<PaginatedResponse<Course>>(
    "/courses/courses/",
    { params },
  );
  return response.data;
};
export const fetchCourseDetails = async (slug: string): Promise<Course> => {
  const response = await apiClient.get<Course>(`/courses/courses/${slug}/`);
  return response.data;
};
export const createCourse = async (
  data: Partial<Course> & { instructor_id?: string },
): Promise<Course> => {
  const response = await apiClient.post<Course>("/courses/courses/", data);
  return response.data;
};
export const updateCourse = async (
  slug: string,
  data: Partial<Course>,
): Promise<Course> => {
  const response = await apiClient.patch<Course>(
    `/courses/courses/${slug}/`,
    data,
  );
  return response.data;
};
export const deleteCourse = async (slug: string): Promise<void> => {
  await apiClient.delete(`/courses/courses/${slug}/`);
};
export const publishCourse = async (slug: string): Promise<Course> => {
  const response = await apiClient.post<Course>(
    `/courses/courses/${slug}/publish/`,
  );
  return response.data;
};
// Add: Archive Course API

// === Modules ===
export const fetchModules = async (courseSlug: string): Promise<Module[]> => {
  const response = await apiClient.get<PaginatedResponse<Module> | Module[]>(
    `/courses/courses/${courseSlug}/modules/`,
  );
  return Array.isArray(response.data) ? response.data : response.data.results;
};
export const createModule = async (
  courseSlug: string,
  data: ModuleData,
): Promise<Module> => {
  const response = await apiClient.post<Module>(
    `/courses/courses/${courseSlug}/modules/`,
    data,
  );
  return response.data;
};
export const updateModule = async (
  courseSlug: string,
  moduleId: string,
  data: Partial<ModuleData>,
): Promise<Module> => {
  const response = await apiClient.patch<Module>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/`,
    data,
  );
  return response.data;
};
export const deleteModule = async (
  courseSlug: string,
  moduleId: string,
): Promise<void> => {
  await apiClient.delete(`/courses/courses/${courseSlug}/modules/${moduleId}/`);
};
// Add: Reorder Modules API

// === Content Items ===
export const fetchContentItems = async (
  courseSlug: string,
  moduleId: string,
): Promise<ContentItem[]> => {
  const response = await apiClient.get<PaginatedResponse<ContentItem> | ContentItem[]>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/`,
  );
  return Array.isArray(response.data) ? response.data : response.data.results;
};
export const createContentItem = async (
  courseSlug: string,
  moduleId: string,
  data: ContentItemData,
): Promise<ContentItem> => {
  const response = await apiClient.post<ContentItem>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/`,
    data,
  );
  return response.data;
};
export const updateContentItem = async (
  courseSlug: string,
  moduleId: string,
  itemId: string,
  data: Partial<ContentItemData>,
): Promise<ContentItem> => {
  const response = await apiClient.patch<ContentItem>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${itemId}/`,
    data,
  );
  return response.data;
};
export const deleteContentItem = async (
  courseSlug: string,
  moduleId: string,
  itemId: string,
): Promise<void> => {
  await apiClient.delete(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${itemId}/`,
  );
};
export const createContentItemVersion = async (
  courseSlug: string,
  moduleId: string,
  itemId: string,
  data: { comment?: string },
): Promise<ContentVersion> => {
  const response = await apiClient.post<ContentVersion>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${itemId}/create-version/`,
    data,
  );
  return response.data;
};
export const listContentItemVersions = async (
  courseSlug: string,
  moduleId: string,
  itemId: string,
): Promise<ContentVersion[]> => {
  const response = await apiClient.get<ContentVersion[]>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${itemId}/versions/`,
  );
  return response.data;
};
// Add: Reorder Content Items API

// === Assessments ===
export const fetchAssessments = async (
  params: PaginationParams & { course?: string; assessment_type?: string; is_published?: boolean; enrolled?: string } = {},
): Promise<PaginatedResponse<Assessment>> => {
  const response = await apiClient.get<PaginatedResponse<Assessment>>(
    "/assessments/",
    { params },
  );
  return response.data;
};
export const fetchAssessmentDetails = async (
  assessmentId: string,
): Promise<Assessment> => {
  const response = await apiClient.get<Assessment>(
    `/assessments/${assessmentId}/`,
  );
  return response.data;
};
export const createAssessment = async (data: AssessmentData): Promise<Assessment> => {
  const response = await apiClient.post<Assessment>(
    "/assessments/",
    data,
  );
  return response.data;
};
export const updateAssessment = async (
  assessmentId: string,
  data: Partial<AssessmentData>,
): Promise<Assessment> => {
  const response = await apiClient.patch<Assessment>(
    `/assessments/${assessmentId}/`,
    data,
  );
  return response.data;
};
export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  await apiClient.delete(`/assessments/${assessmentId}/`);
};

// === Questions ===
export const fetchQuestions = async (
  assessmentId: string,
): Promise<Question[]> => {
  // Backend endpoint might be paginated, adjust if necessary
  const response = await apiClient.get<PaginatedResponse<Question> | Question[]>(
    `/assessments/${assessmentId}/questions/`,
  );
  return Array.isArray(response.data) ? response.data : response.data.results;
};
export const createQuestion = async (
  assessmentId: string,
  data: QuestionData,
): Promise<Question> => {
  const response = await apiClient.post<Question>(
    `/assessments/${assessmentId}/questions/`,
    data,
  );
  return response.data;
};
export const updateQuestion = async (
  assessmentId: string,
  questionId: string,
  data: Partial<QuestionData>,
): Promise<Question> => {
  const response = await apiClient.patch<Question>(
    `/assessments/${assessmentId}/questions/${questionId}/`,
    data,
  );
  return response.data;
};
export const deleteQuestion = async (
  assessmentId: string,
  questionId: string,
): Promise<void> => {
  await apiClient.delete(
    `/assessments/${assessmentId}/questions/${questionId}/`,
  );
};

// === Assessment Attempts ===
export const startAssessmentAttempt = async (
  assessmentId: string,
): Promise<{
  attempt_id: string;
  start_time: string;
  time_limit_minutes: number | null;
  assessment: Assessment;
}> => {
  const response = await apiClient.post(
    `/assessments/${assessmentId}/start/`,
  );
  return response.data;
};
export const submitAssessmentAttempt = async (
  attemptId: string,
  data: { answers: Record<string, AnswerValue> },
): Promise<AssessmentAttempt> => {
  const response = await apiClient.post<AssessmentAttempt>(
    `/assessments/attempts/${attemptId}/submit/`,
    data,
  );
  return response.data;
};
export const fetchAssessmentAttemptResult = async (
  attemptId: string,
): Promise<AssessmentAttempt> => {
  const response = await apiClient.get<AssessmentAttempt>(
    `/assessments/attempts/${attemptId}/result/`,
  );
  return response.data;
};
export const fetchAssessmentAttemptsForAssessment = async (
  assessmentId: string,
): Promise<AssessmentAttempt[]> => {
  // Returns all attempts for the assessment (filtered by user on backend for learners)
  const response = await apiClient.get<AssessmentAttempt[]>(
    `/assessments/${assessmentId}/attempts/`,
  );
  return response.data;
};

/** Fetch details of a specific assessment attempt by ID */
export const getAttemptDetails = async (
  attemptId: string,
): Promise<AssessmentAttempt> => {
  const response = await apiClient.get<AssessmentAttempt>(
    `/assessments/attempts/${attemptId}/`,
  );
  return response.data;
};

/** Resume an in-progress assessment attempt, returns full assessment details */
export const resumeAssessmentAttempt = async (
  attemptId: string,
): Promise<{
  attempt_id: string;
  start_time: string;
  time_limit_minutes: number | null;
  assessment: Assessment;
}> => {
  const response = await apiClient.get(
    `/assessments/attempts/${attemptId}/resume/`,
  );
  return response.data;
};

/** Fetch remedial content recommendations based on assessment performance */
export const fetchRemedialRecommendations = async (params?: {
  attemptId?: string;
  limit?: number;
}): Promise<RemedialRecommendationsResponse> => {
  const response = await apiClient.get<RemedialRecommendationsResponse>(
    buildUrl("/assessments/recommendations/remedial/", {
      attempt_id: params?.attemptId,
      limit: params?.limit,
    })
  );
  return response.data;
};

/** Response type for remedial path availability check */
export interface RemedialPathAvailabilityResponse {
  attempt_id: string;
  assessment_info: {
    id: string;
    title: string;
    course_title: string | null;
    pass_mark_percentage: number;
  };
  attempt_info: {
    status: string;
    score: number | null;
    max_score: number | null;
    is_passed: boolean | null;
  };
  is_eligible: boolean;
  reason: string | null;
  generate_url: string | null;
  generate_payload?: {
    assessment_attempt_id: string;
  };
}

/** Check if a remedial learning path can be generated for an assessment attempt */
export const checkRemedialPathAvailability = async (
  attemptId: string,
): Promise<RemedialPathAvailabilityResponse> => {
  const response = await apiClient.get<RemedialPathAvailabilityResponse>(
    `/assessments/attempts/${attemptId}/remedial-path-availability/`,
  );
  return response.data;
};

/** Response type for fetching user's assessment attempts */
export interface MyAssessmentAttemptsResponse {
  count: number;
  results: AssessmentAttempt[];
}

/** Fetch all assessment attempts for the current user */
export const fetchMyAssessmentAttempts = async (params?: {
  status?: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  limit?: number;
}): Promise<MyAssessmentAttemptsResponse> => {
  const response = await apiClient.get<MyAssessmentAttemptsResponse>(
    buildUrl("/assessments/my-attempts/", {
      status: params?.status,
      limit: params?.limit,
    })
  );
  return response.data;
};

// Add: API for manual grading submission

// === Enrollments ===
export const fetchEnrollments = async (
  params: PaginationParams & { course?: string; user?: string; status?: string } = {},
): Promise<PaginatedResponse<Enrollment>> => {
  const response = await apiClient.get<PaginatedResponse<Enrollment>>(
    "/enrollments/enrollments/",
    { params },
  );
  return response.data;
};

export const fetchEnrollmentStatus = async (courseSlug: string): Promise<{
  is_enrolled: boolean;
  enrollment_id: string | null;
  status: string | null;
}> => {
  const response = await apiClient.get(`/enrollments/enrollment-status/${courseSlug}/`);
  return response.data;
};

// Learner Progress API functions
export const fetchLearnerProgress = async (enrollmentId: string): Promise<LearnerProgress[]> => {
  const response = await apiClient.get<PaginatedResponse<LearnerProgress>>(
    `/enrollments/enrollments/${enrollmentId}/progress/`
  );
  return response.data.results;
};

export const updateLearnerProgress = async (
  enrollmentId: string,
  contentItemId: string,
  data: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progress_details?: Record<string, unknown>;
  }
): Promise<LearnerProgress> => {
  const response = await apiClient.post(`/enrollments/enrollments/${enrollmentId}/progress/${contentItemId}/`, data);
  return response.data;
};

// === Certificates ===
export const fetchCertificates = async (
  params: PaginationParams & { course?: string; user?: string; status?: string } = {},
): Promise<PaginatedResponse<Certificate>> => {
  const response = await apiClient.get<PaginatedResponse<Certificate>>(
    "/enrollments/certificates/",
    { params },
  );
  return response.data;
};
export const verifyCertificate = async (
  verificationCode: string,
): Promise<{
  valid: boolean;
  learner_name?: string;
  course_title?: string;
  issued_at?: string;
  detail?: string;
}> => {
  const response = await apiClient.get(
    `/enrollments/certificates/verify/${verificationCode}/`,
  );
  return response.data;
};

export const downloadCertificate = async (certificateId: string): Promise<Blob> => {
  const response = await apiClient.get(
    `/enrollments/certificates/${certificateId}/download/`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

// === Files / Folders ===
export const fetchFolders = async (
  params: { parent?: string } = {},
): Promise<Folder[]> => {
  const response = await apiClient.get<PaginatedResponse<Folder> | Folder[]>(
    "/files/folders/",
    { params }
  );
  return Array.isArray(response.data) ? response.data : response.data.results;
};
export const createFolder = async (data: {
  name: string;
  parent_id?: string | null;
}): Promise<Folder> => {
  const response = await apiClient.post<Folder>("/files/folders/", data);
  return response.data;
};
export const fetchFiles = async (
  params: { folder_id?: string } = {},
): Promise<PaginatedResponse<FileType>> => {
  const response = await apiClient.get<PaginatedResponse<FileType>>(
    "/files/files/",
    { params },
  );
  return response.data;
};
export const fetchFileDetails = async (fileId: string): Promise<FileType> => {
  const response = await apiClient.get<FileType>(`/files/files/${fileId}/`);
  return response.data;
};
export const uploadFile = async (
  file: File,
  folderId?: string,
): Promise<FileType> => {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) {
    formData.append("folder_id", folderId);
  }
  const response = await apiClient.post<FileType>("/files/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const deleteFile = async (fileId: string): Promise<void> => {
  await apiClient.delete(`/files/files/${fileId}/`);
};
// Add: Rename folder/file, Move folder/file APIs

// === Learning Paths ===
export const fetchLearningPaths = async (
  params: PaginationParams & { status?: string } = {},
): Promise<PaginatedResponse<LearningPath>> => {
  const response = await apiClient.get<PaginatedResponse<LearningPath>>(
    "/learning-paths/learning-paths/",
    { params },
  );
  return response.data;
};
export const fetchLearningPathDetails = async (
  slug: string,
): Promise<LearningPath> => {
  const response = await apiClient.get<LearningPath>(
    `/learning-paths/learning-paths/${slug}/`,
  );
  return response.data;
};
export const createLearningPath = async (data: LearningPathData): Promise<LearningPath> => {
  const response = await apiClient.post<LearningPath>(
    "/learning-paths/learning-paths/",
    data,
  );
  return response.data;
};
export const updateLearningPath = async (
  slug: string,
  data: Partial<LearningPathData>,
): Promise<LearningPath> => {
  const response = await apiClient.patch<LearningPath>(
    `/learning-paths/learning-paths/${slug}/`,
    data,
  );
  return response.data;
};
export const deleteLearningPath = async (slug: string): Promise<void> => {
  await apiClient.delete(`/learning-paths/learning-paths/${slug}/`);
};
export const addLearningPathStep = async (
  pathSlug: string,
  data: LearningPathStepData,
): Promise<LearningPathStep> => {
  const response = await apiClient.post<LearningPathStep>(
    `/learning-paths/learning-paths/${pathSlug}/steps/`,
    data,
  );
  return response.data;
};
export const updateLearningPathStep = async (
  pathSlug: string,
  stepId: string,
  data: Partial<LearningPathStepData>,
): Promise<LearningPathStep> => {
  const response = await apiClient.patch<LearningPathStep>(
    `/learning-paths/learning-paths/${pathSlug}/steps/${stepId}/`,
    data,
  );
  return response.data;
};
export const deleteLearningPathStep = async (
  pathSlug: string,
  stepId: string,
): Promise<void> => {
  await apiClient.delete(
    `/learning-paths/learning-paths/${pathSlug}/steps/${stepId}/`,
  );
};
export const reorderLearningPathSteps = async (
  pathSlug: string,
  stepIds: string[],
): Promise<{ success: boolean }> => {
  const response = await apiClient.post<{ success: boolean }>(
    `/learning-paths/learning-paths/${pathSlug}/reorder-steps/`,
    { steps: stepIds },
  );
  return response.data;
};
// Add: API for fetching/updating LP progress

// === AI Engine ===
export const startAIGenerationJob = async (
  data: AIGenerationJobData,
): Promise<GenerationJob> => {
  const response = await apiClient.post<GenerationJob>("/ai/generate/", data);
  return response.data;
};
export const fetchAIGenerationJobs = async (
  params: PaginationParams & { status?: string } = {},
): Promise<PaginatedResponse<GenerationJob>> => {
  const response = await apiClient.get<PaginatedResponse<GenerationJob>>(
    "/ai/jobs/",
    { params },
  );
  return response.data;
};
export const fetchAIGenerationJobDetails = async (
  jobId: string,
): Promise<GenerationJob> => {
  const response = await apiClient.get<GenerationJob>(`/ai/jobs/${jobId}/`);
  return response.data;
};
export const fetchAIGeneratedContent = async (
  params: PaginationParams & { job?: string; is_accepted?: boolean } = {},
): Promise<PaginatedResponse<GeneratedContent>> => {
  const response = await apiClient.get<PaginatedResponse<GeneratedContent>>(
    "/ai/generated-content/",
    { params },
  );
  return response.data;
};
export const updateAIGeneratedContentEvaluation = async (
  contentId: string,
  data: {
    is_accepted?: boolean | null;
    rating?: number | null;
    evaluation_feedback?: string;
  },
): Promise<GeneratedContent> => {
  const response = await apiClient.patch<GeneratedContent>(
    `/ai/generated-content/${contentId}/`,
    data,
  );
  return response.data;
};
// Add: CRUD APIs for ModelConfig and PromptTemplate (if needed beyond ViewSets already defined)

// === Notifications ===
export const fetchNotifications = async (
  params: PaginationParams & { is_read?: boolean } = {},
): Promise<PaginatedResponse<Notification>> => {
  const response = await apiClient.get<PaginatedResponse<Notification>>(
    "/notifications/notifications/",
    { params },
  );
  return response.data;
};
export const markNotificationRead = async (
  notificationId: string,
): Promise<Notification> => {
  const response = await apiClient.post<Notification>(
    `/notifications/notifications/${notificationId}/mark-read/`,
  );
  return response.data;
};
export const markAllNotificationsRead = async (): Promise<{
  updated_count: number;
}> => {
  const response = await apiClient.post(
    "/notifications/notifications/mark-all-read/",
  );
  return response.data;
};
export const dismissNotification = async (
  notificationId: string,
): Promise<Notification> => {
  const response = await apiClient.post<Notification>(
    `/notifications/notifications/${notificationId}/dismiss/`,
  );
  return response.data;
};
export const fetchNotificationPreferences =
  async (): Promise<NotificationPreference> => {
    const response = await apiClient.get<NotificationPreference>(
      "/notifications/preferences/",
    );
    return response.data;
  };
export const updateNotificationPreferences = async (
  data: Partial<NotificationPreference>,
): Promise<NotificationPreference> => {
  const response = await apiClient.patch<NotificationPreference>(
    "/notifications/preferences/",
    data,
  );
  return response.data;
};

// === Analytics ===
export const fetchReportData = async (
  reportSlug: string,
  filters: Record<string, string | number | boolean | undefined> = {},
): Promise<ReportData> => {
  const response = await apiClient.get<ReportData>(
    `/analytics/reports/${reportSlug}/data/`,
    { params: filters },
  );
  return response.data;
};

export const trackEvent = async (eventData: {
  event_type: string;
  context_data?: Record<string, unknown>;
}): Promise<void> => {
  await apiClient.post("/analytics/track/", eventData);
};

// === Event Log (Admin) ===
export interface EventLog {
  id: string;
  event_type: string;
  event_type_display: string;
  user: string | null;
  user_email: string | null;
  user_name: string | null;
  tenant: string | null;
  context_data: Record<string, unknown> | null;
  session_id: string | null;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  created_at: string;
}

export interface EventLogFilters {
  event_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  device_type?: string;
  country?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface EventType {
  value: string;
  label: string;
}

export interface EventLogStats {
  total_events: number;
  events_by_type: Array<{ event_type: string; count: number }>;
  events_by_day: Array<{ date: string; count: number }>;
  events_by_device: Array<{ device_type: string; count: number }>;
}

export const fetchEventLogs = async (
  params: EventLogFilters = {}
): Promise<PaginatedResponse<EventLog>> => {
  const response = await apiClient.get<PaginatedResponse<EventLog>>(
    "/analytics/api/event-logs/",
    { params }
  );
  return response.data;
};

export const fetchEventLogDetails = async (eventId: string): Promise<EventLog> => {
  const response = await apiClient.get<EventLog>(
    `/analytics/api/event-logs/${eventId}/`
  );
  return response.data;
};

export const fetchEventTypes = async (): Promise<EventType[]> => {
  const response = await apiClient.get<EventType[]>(
    "/analytics/api/event-logs/event_types/"
  );
  return response.data;
};

export const fetchEventLogStats = async (
  params: Omit<EventLogFilters, 'page' | 'page_size'> = {}
): Promise<EventLogStats> => {
  const response = await apiClient.get<EventLogStats>(
    "/analytics/api/event-logs/stats/",
    { params }
  );
  return response.data;
};

// === Analytics - Student Performance ===
export interface StudentPerformanceFilters {
  course_id?: string;
  student_id?: string;
  page?: number;
  page_size?: number;
}

export const fetchStudentPerformance = async (
  params: StudentPerformanceFilters = {}
): Promise<PaginatedResponse<StudentPerformance>> => {
  const response = await apiClient.get<PaginatedResponse<StudentPerformance>>(
    "/analytics/api/student-performance/",
    { params }
  );
  return response.data;
};

export const fetchStudentPerformanceDetails = async (id: string): Promise<StudentPerformance> => {
  const response = await apiClient.get<StudentPerformance>(`/analytics/api/student-performance/${id}/`);
  return response.data;
};

// === Analytics - Engagement Metrics ===
export interface EngagementMetricsFilters {
  course_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export const fetchEngagementMetrics = async (
  params: EngagementMetricsFilters = {}
): Promise<PaginatedResponse<EngagementMetrics>> => {
  const response = await apiClient.get<PaginatedResponse<EngagementMetrics>>(
    "/analytics/api/engagement-metrics/",
    { params }
  );
  return response.data;
};

export const fetchEngagementMetricsDetails = async (id: string): Promise<EngagementMetrics> => {
  const response = await apiClient.get<EngagementMetrics>(`/analytics/api/engagement-metrics/${id}/`);
  return response.data;
};

// === Analytics - Assessment Analytics ===
export interface AssessmentAnalyticsFilters {
  assessment_id?: string;
  course_id?: string;
  page?: number;
  page_size?: number;
}

export const fetchAssessmentAnalytics = async (
  params: AssessmentAnalyticsFilters = {}
): Promise<PaginatedResponse<AssessmentAnalytics>> => {
  const response = await apiClient.get<PaginatedResponse<AssessmentAnalytics>>(
    "/analytics/api/assessment-analytics/",
    { params }
  );
  return response.data;
};

export const fetchAssessmentAnalyticsDetails = async (id: string): Promise<AssessmentAnalytics> => {
  const response = await apiClient.get<AssessmentAnalytics>(`/analytics/api/assessment-analytics/${id}/`);
  return response.data;
};

// === Tenants (Admin) ===
export const fetchTenants = async (
  params: PaginationParams & { is_active?: boolean } = {},
): Promise<PaginatedResponse<Tenant>> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const token = localStorage.getItem('authToken'); // Fixed: changed from 'accessToken' to 'authToken'
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await apiClient.get(`/admin/tenants/?${queryParams.toString()}`, { headers });
    if (response.data && response.data.results) {
      return {
        results: response.data.results,
        count: response.data.count || 0,
        next: response.data.next || null,
        previous: response.data.previous || null,
      }; // Adjusted to match expected structure
    } else {
      throw new Error("Unexpected API response structure");
    }
  } catch (error) {
    throw error;
  }
};

export const fetchTenantDetails = async (tenantId: string): Promise<Tenant> => {
  const response = await apiClient.get(`/admin/tenants/${tenantId}/`);
  return response.data;
};

export const createTenant = async (data: TenantData): Promise<Tenant> => {
  const response = await apiClient.post('/admin/tenants/', data);
  return response.data;
};

export const updateTenant = async (
  tenantId: string,
  data: Partial<TenantData>,
): Promise<Tenant> => {
  const response = await apiClient.patch(`/admin/tenants/${tenantId}/`, data);
  return response.data;
};

export const deleteTenant = async (tenantId: string): Promise<void> => {
  await apiClient.delete(`/admin/tenants/${tenantId}/`);
};

export const toggleTenantStatus = async (tenantId: string): Promise<Tenant> => {
  const response = await apiClient.post(`/admin/tenants/${tenantId}/toggle-status/`);
  return response.data;
};

export const manageTenantDomains = async (
  tenantId: string,
  domains: string[],
  action: 'add' | 'remove'
): Promise<DomainManagementResponse> => {
  const response = await apiClient.post<DomainManagementResponse>(`/admin/tenants/${tenantId}/manage-domains/`, {
    domains,
    action
  });
  return response.data;
};

// === Admin Specific APIs ===
export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard-stats/');
  return response.data;
};

export const fetchAllPlatformCourses = async (
  params: PaginationParams & { status?: string; category?: string; instructor?: string } = {},
): Promise<PaginatedResponse<Course>> => {
  // Use the regular courses endpoint, the backend should handle admin-level access via permissions
  const response = await apiClient.get<PaginatedResponse<Course>>(
    buildUrl('/courses/courses/', params)
  );
  return response.data;
};

export const fetchAIModelConfigs = async (
  params: PaginationParams & { is_active?: boolean; provider?: string } = {},
): Promise<PaginatedResponse<ModelConfig>> => {
  const response = await apiClient.get<PaginatedResponse<ModelConfig>>(
    buildUrl('/ai/model-configs/', params)
  );
  return response.data;
};

export const createAIModelConfig = async (data: ModelConfigData): Promise<ModelConfig> => {
  const response = await apiClient.post<ModelConfig>('/ai/model-configs/', data);
  return response.data;
};

export const updateAIModelConfig = async (id: string, data: Partial<ModelConfigData>): Promise<ModelConfig> => {
  const response = await apiClient.put<ModelConfig>(`/ai/model-configs/${id}/`, data);
  return response.data;
};

export const deleteAIModelConfig = async (id: string): Promise<void> => {
  await apiClient.delete(`/ai/model-configs/${id}/`);
};

export const fetchAIPromptTemplates = async (
  params: PaginationParams & { is_active?: boolean } = {},
): Promise<PaginatedResponse<PromptTemplate>> => {
  const response = await apiClient.get<PaginatedResponse<PromptTemplate>>(
    buildUrl('/ai/prompt-templates/', params)
  );
  return response.data;
};

export const createAIPromptTemplate = async (data: PromptTemplateData): Promise<PromptTemplate> => {
  const response = await apiClient.post<PromptTemplate>('/ai/prompt-templates/', data);
  return response.data;
};

export const updateAIPromptTemplate = async (id: string, data: Partial<PromptTemplateData>): Promise<PromptTemplate> => {
  const response = await apiClient.put<PromptTemplate>(`/ai/prompt-templates/${id}/`, data);
  return response.data;
};

export const deleteAIPromptTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/ai/prompt-templates/${id}/`);
};

export const fetchReportDefinitions = async (): Promise<Report[]> => {
  const response = await apiClient.get('/analytics/api/report-definitions/');
  return response.data.results || response.data;
};

export const fetchDashboardDefinitions = async (): Promise<Dashboard[]> => {
  const response = await apiClient.get('/analytics/api/dashboard-definitions/');
  return response.data.results || response.data;
};

export const fetchInstructorDashboardStats = async (): Promise<InstructorDashboardStats> => {
  const response = await apiClient.get<InstructorDashboardStats>('/instructor/dashboard-stats/');
  return response.data;
};

export const fetchInstructorAssessments = async (
  params: PaginationParams & { course?: string; status?: string } = {},
): Promise<PaginatedResponse<Assessment>> => {
  const response = await apiClient.get<PaginatedResponse<Assessment>>(
    buildUrl('/instructor/assessments/', params)
  );
  return response.data;
};

export const fetchInstructorCourses = async (
  params: PaginationParams & { status?: string; category?: string } = {},
): Promise<PaginatedResponse<Course>> => {
  // Always try the real endpoint first
  const response = await apiClient.get<PaginatedResponse<Course>>(
    buildUrl('/courses/courses/', { ...params, instructor: 'me' })
  );
  return response.data;
};

export const fetchInstructorReports = async (): Promise<InstructorReport[]> => {
  const response = await apiClient.get<InstructorReport[]>('/instructor/reports/');
  return response.data;
};

export const fetchCourseEnrollments = async (
  courseSlug: string,
  params: PaginationParams & { status?: string } = {},
): Promise<PaginatedResponse<Enrollment>> => {
  // Use the enrollments endpoint with course filter - backend expects course UUID/slug as filter
  const response = await apiClient.get<PaginatedResponse<Enrollment>>(
    buildUrl(`/enrollments/enrollments/`, { ...params, course: courseSlug })
  );
  return response.data;
};

export interface CreateEnrollmentData {
  user_id: string;
  course_id: string;
  status?: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
}

export const createEnrollment = async (data: CreateEnrollmentData): Promise<Enrollment> => {
  const response = await apiClient.post<Enrollment>(
    "/enrollments/enrollments/create/",
    data
  );
  return response.data;
};

export const gradeManualAttempt = async (
  assessmentId: string,
  attemptId: string,
  data: ManualGradeData
): Promise<AssessmentAttempt> => {
  const response = await apiClient.post<AssessmentAttempt>(
    `/instructor/assessments/${assessmentId}/attempts/${attemptId}/grade/`,
    data
  );
  return response.data;
};

export const fetchLearnerDashboardStats = async (): Promise<LearnerDashboardStats> => {
  const response = await apiClient.get<LearnerDashboardStats>('/learner/dashboard-stats/');
  return response.data;
};

export const fetchLearnerRecommendations = async (params?: {
  limit?: number;
  exclude_enrolled?: boolean;
}): Promise<LearnerRecommendationsResponse> => {
  const response = await apiClient.get<LearnerRecommendationsResponse>(
    '/learner/recommendations/',
    { params }
  );
  return response.data;
};

/** Fetch comprehensive learner insights and analytics */
export const fetchLearnerInsights = async (): Promise<LearnerInsights> => {
  const response = await apiClient.get<LearnerInsights>(
    '/analytics/learner/insights/'
  );
  return response.data;
};

export const fetchContentItemDetails = async (
  courseSlug: string,
  moduleId: string,
  contentId: string
): Promise<ContentItem> => {
  // Content items are nested under courses/modules in the backend
  const response = await apiClient.get<ContentItem>(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${contentId}/`
  );
  return response.data;
};

export const fetchContentItemProgress = async (
  enrollmentId: string,
  contentItemId: string,
): Promise<LearnerProgress> => {
  const response = await apiClient.get<LearnerProgress>(
    `/enrollments/enrollments/${enrollmentId}/progress/${contentItemId}/`
  );
  return response.data;
};

export const fetchLearningPathUserProgress = async (pathSlug: string): Promise<LearningPathUserProgress> => {
  const response = await apiClient.get<LearningPathUserProgress>(`/learning-paths/learning-paths/${pathSlug}/my-progress/`);
  return response.data;
};

// New Progress Tracking API functions
export const fetchLearningPathProgress = async (
  params: PaginationParams & { learning_path?: string; status?: string } = {}
): Promise<PaginatedResponse<LearningPathProgress>> => {
  const response = await apiClient.get<PaginatedResponse<LearningPathProgress>>(
    "/learning-paths/progress/",
    { params }
  );
  return response.data;
};

export const fetchLearningPathProgressDetails = async (
  progressId: string
): Promise<LearningPathProgress> => {
  const response = await apiClient.get<LearningPathProgress>(
    `/learning-paths/progress/${progressId}/`
  );
  return response.data;
};

export const startLearningPath = async (progressId: string): Promise<LearningPathProgress> => {
  const response = await apiClient.post<LearningPathProgress>(
    `/learning-paths/progress/${progressId}/start/`
  );
  return response.data;
};

export const completeLearningPathStep = async (
  progressId: string,
  stepId: string
): Promise<LearningPathProgress> => {
  const response = await apiClient.post<LearningPathProgress>(
    `/learning-paths/progress/${progressId}/steps/${stepId}/complete/`
  );
  return response.data;
};

export const resetLearningPathStep = async (
  progressId: string,
  stepId: string
): Promise<LearningPathProgress> => {
  const response = await apiClient.post<LearningPathProgress>(
    `/learning-paths/progress/${progressId}/steps/${stepId}/reset/`
  );
  return response.data;
};

export const fetchLearningPathStepProgress = async (
  params: PaginationParams & { learning_path_progress?: string; status?: string } = {}
): Promise<PaginatedResponse<LearningPathStepProgress>> => {
  const response = await apiClient.get<PaginatedResponse<LearningPathStepProgress>>(
    "/learning-paths/step-progress/",
    { params }
  );
  return response.data;
};

export const createLearningPathProgress = async (
  learningPathId: string
): Promise<LearningPathProgress> => {
  const response = await apiClient.post<LearningPathProgress>(
    "/learning-paths/progress/",
    { learning_path: learningPathId }
  );
  return response.data;
};

export const updateCourseModules = async (courseSlug: string, modules: ModuleBulkUpdateItem[]): Promise<Module[]> => {
  const response = await apiClient.put<Module[]>(`/courses/courses/${courseSlug}/modules/bulk-update/`, {
    modules
  });
  return response.data;
};

// === New Instructor Analytics API ===
export const fetchInstructorAnalytics = async (params: {
  timeRange: string;
  courseId?: string;
}): Promise<InstructorAnalytics> => {
  const searchParams = new URLSearchParams({
    time_range: params.timeRange,
    ...(params.courseId && params.courseId !== 'all' && { course_id: params.courseId }),
  });

  const response = await apiClient.get<InstructorAnalytics>(`/instructor/analytics/?${searchParams}`);
  return response.data;
};

// === Course Enrollment API ===
export const enrollInCourse = async (courseSlug: string): Promise<Enrollment> => {
  const response = await apiClient.post<Enrollment>(
    "/enrollments/enroll/",
    { course_slug: courseSlug }
  );
  return response.data;
};

// === Platform Settings (Admin) ===
import type {
  PlatformSettings,
  GeneralSettings,
  StorageSettings,
  EmailSettings,
  TestConnectionResponse,
  AdminAnalyticsData,
} from "./types";

// Fetch all platform settings
export const fetchPlatformSettings = async (): Promise<PlatformSettings> => {
  const response = await apiClient.get<PlatformSettings>("/admin/settings/");
  return response.data;
};

// Update all platform settings (partial update)
export const updatePlatformSettings = async (
  data: Partial<PlatformSettings>
): Promise<PlatformSettings> => {
  const response = await apiClient.patch<PlatformSettings>("/admin/settings/", data);
  return response.data;
};

// Fetch general settings only
export const fetchGeneralSettings = async (): Promise<GeneralSettings> => {
  const response = await apiClient.get<GeneralSettings>("/admin/settings/general/");
  return response.data;
};

// Update general settings
export const updateGeneralSettings = async (
  data: Partial<GeneralSettings>
): Promise<GeneralSettings> => {
  const response = await apiClient.patch<GeneralSettings>("/admin/settings/general/", data);
  return response.data;
};

// Fetch storage settings only
export const fetchStorageSettings = async (): Promise<StorageSettings> => {
  const response = await apiClient.get<StorageSettings>("/admin/settings/storage/");
  return response.data;
};

// Update storage settings
export const updateStorageSettings = async (
  data: Partial<StorageSettings>
): Promise<StorageSettings> => {
  const response = await apiClient.patch<StorageSettings>("/admin/settings/storage/", data);
  return response.data;
};

// Test storage connection
export const testStorageConnection = async (
  data?: { test_file_name?: string }
): Promise<TestConnectionResponse> => {
  const response = await apiClient.post<TestConnectionResponse>(
    "/admin/settings/storage/test/",
    data || {}
  );
  return response.data;
};

// Fetch email settings only
export const fetchEmailSettings = async (): Promise<EmailSettings> => {
  const response = await apiClient.get<EmailSettings>("/admin/settings/email/");
  return response.data;
};

// Update email settings
export const updateEmailSettings = async (
  data: Partial<EmailSettings>
): Promise<EmailSettings> => {
  const response = await apiClient.patch<EmailSettings>("/admin/settings/email/", data);
  return response.data;
};

// Send test email
export const sendTestEmail = async (
  data: { recipient_email: string }
): Promise<TestConnectionResponse> => {
  const response = await apiClient.post<TestConnectionResponse>(
    "/admin/settings/email/test/",
    data
  );
  return response.data;
};

// === LTI Platform Management (Admin) ===
import type {
  LTIPlatform,
  LTIPlatformListItem,
  LTIPlatformCreate,
  LTIPlatformUpdate,
  LTIJWKS,
  SSOConfiguration,
  SSOConfigurationListItem,
  SSOConfigurationCreate,
  SSOConfigurationUpdate,
  SSOProviderTypeOption,
} from "./types";

// Fetch all LTI platforms
export const fetchLTIPlatforms = async (
  params: {
    tenant?: string;
    search?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  } = {}
): Promise<PaginatedResponse<LTIPlatformListItem>> => {
  const response = await apiClient.get<PaginatedResponse<LTIPlatformListItem>>(
    buildUrl("/admin/settings/lti-platforms/", params)
  );
  return response.data;
};

// Fetch single LTI platform details
export const fetchLTIPlatformDetails = async (platformId: string): Promise<LTIPlatform> => {
  const response = await apiClient.get<LTIPlatform>(
    `/admin/settings/lti-platforms/${platformId}/`
  );
  return response.data;
};

// Create new LTI platform
export const createLTIPlatform = async (data: LTIPlatformCreate): Promise<LTIPlatform> => {
  const response = await apiClient.post<LTIPlatform>(
    "/admin/settings/lti-platforms/",
    data
  );
  return response.data;
};

// Update LTI platform
export const updateLTIPlatform = async (
  platformId: string,
  data: LTIPlatformUpdate
): Promise<LTIPlatform> => {
  const response = await apiClient.patch<LTIPlatform>(
    `/admin/settings/lti-platforms/${platformId}/`,
    data
  );
  return response.data;
};

// Delete LTI platform
export const deleteLTIPlatform = async (platformId: string): Promise<void> => {
  await apiClient.delete(`/admin/settings/lti-platforms/${platformId}/`);
};

// Toggle LTI platform active status
export const toggleLTIPlatformStatus = async (platformId: string): Promise<LTIPlatform> => {
  const response = await apiClient.post<LTIPlatform>(
    `/admin/settings/lti-platforms/${platformId}/toggle-status/`
  );
  return response.data;
};

// Regenerate RSA keys for LTI platform
export const regenerateLTIPlatformKeys = async (
  platformId: string
): Promise<{ message: string; public_key: string }> => {
  const response = await apiClient.post<{ message: string; public_key: string }>(
    `/admin/settings/lti-platforms/${platformId}/regenerate-keys/`
  );
  return response.data;
};

// Get LTI platform JWKS (public key in JWKS format)
export const fetchLTIPlatformJWKS = async (platformId: string): Promise<LTIJWKS> => {
  const response = await apiClient.get<LTIJWKS>(
    `/admin/settings/lti-platforms/${platformId}/jwks/`
  );
  return response.data;
};

// === SSO Configuration Management (Admin) ===

// Fetch all SSO configurations
export const fetchSSOConfigurations = async (
  params: {
    tenant?: string;
    search?: string;
    provider_type?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  } = {}
): Promise<PaginatedResponse<SSOConfigurationListItem>> => {
  const response = await apiClient.get<PaginatedResponse<SSOConfigurationListItem>>(
    buildUrl("/admin/settings/sso-configurations/", params)
  );
  return response.data;
};

// Fetch single SSO configuration details
export const fetchSSOConfigurationDetails = async (
  configId: string
): Promise<SSOConfiguration> => {
  const response = await apiClient.get<SSOConfiguration>(
    `/admin/settings/sso-configurations/${configId}/`
  );
  return response.data;
};

// Create new SSO configuration
export const createSSOConfiguration = async (
  data: SSOConfigurationCreate
): Promise<SSOConfiguration> => {
  const response = await apiClient.post<SSOConfiguration>(
    "/admin/settings/sso-configurations/",
    data
  );
  return response.data;
};

// Update SSO configuration
export const updateSSOConfiguration = async (
  configId: string,
  data: SSOConfigurationUpdate
): Promise<SSOConfiguration> => {
  const response = await apiClient.patch<SSOConfiguration>(
    `/admin/settings/sso-configurations/${configId}/`,
    data
  );
  return response.data;
};

// Delete SSO configuration
export const deleteSSOConfiguration = async (configId: string): Promise<void> => {
  await apiClient.delete(`/admin/settings/sso-configurations/${configId}/`);
};

// Toggle SSO configuration active status
export const toggleSSOConfigurationStatus = async (
  configId: string
): Promise<SSOConfiguration> => {
  const response = await apiClient.post<SSOConfiguration>(
    `/admin/settings/sso-configurations/${configId}/toggle-status/`
  );
  return response.data;
};

// Set SSO configuration as default
export const setSSOConfigurationDefault = async (
  configId: string
): Promise<SSOConfiguration> => {
  const response = await apiClient.post<SSOConfiguration>(
    `/admin/settings/sso-configurations/${configId}/set-default/`
  );
  return response.data;
};

// Test SSO configuration
export const testSSOConfiguration = async (
  configId: string
): Promise<TestConnectionResponse> => {
  const response = await apiClient.post<TestConnectionResponse>(
    `/admin/settings/sso-configurations/${configId}/test/`
  );
  return response.data;
};

// Fetch available SSO provider types
export const fetchSSOProviderTypes = async (): Promise<SSOProviderTypeOption[]> => {
  const response = await apiClient.get<SSOProviderTypeOption[]>(
    "/admin/settings/sso-configurations/provider-types/"
  );
  return response.data;
};

// === Admin Analytics API ===
export interface AdminAnalyticsParams {
  time_range: string;
  tenant_id?: string;
}

export const fetchAdminAnalytics = async (
  params: AdminAnalyticsParams
): Promise<AdminAnalyticsData> => {
  const searchParams = new URLSearchParams({
    time_range: params.time_range,
    ...(params.tenant_id && params.tenant_id !== 'all' && { tenant_id: params.tenant_id }),
  });

  const response = await apiClient.get<AdminAnalyticsData>(
    `/analytics/admin/analytics/?${searchParams}`
  );
  return response.data;
};

// ============================================
// Custom Dashboards API
// ============================================
import type {
  DashboardListItem,
  DashboardDetail,
  DashboardCreateData,
  DashboardUpdateData,
  DashboardWidget,
  WidgetCreateData,
  WidgetPositionUpdate,
  WidgetData,
  WidgetMetaResponse,
  DashboardTimeRange,
} from "./types";

// --- Dashboard CRUD ---

/** Fetch all custom dashboards for the current user/tenant */
export const fetchCustomDashboards = async (
  params: PaginationParams & { is_shared?: boolean; is_default?: boolean } = {}
): Promise<PaginatedResponse<DashboardListItem>> => {
  const response = await apiClient.get<PaginatedResponse<DashboardListItem>>(
    buildUrl("/analytics/api/dashboards/", params)
  );
  return response.data;
};

/** Fetch a single dashboard with all its widgets */
export const fetchCustomDashboardDetail = async (
  dashboardId: string
): Promise<DashboardDetail> => {
  const response = await apiClient.get<DashboardDetail>(
    `/analytics/api/dashboards/${dashboardId}/`
  );
  return response.data;
};

/** Create a new custom dashboard */
export const createCustomDashboard = async (
  data: DashboardCreateData
): Promise<DashboardDetail> => {
  const response = await apiClient.post<DashboardDetail>(
    "/analytics/api/dashboards/",
    data
  );
  return response.data;
};

/** Update an existing dashboard */
export const updateCustomDashboard = async (
  dashboardId: string,
  data: DashboardUpdateData
): Promise<DashboardDetail> => {
  const response = await apiClient.patch<DashboardDetail>(
    `/analytics/api/dashboards/${dashboardId}/`,
    data
  );
  return response.data;
};

/** Delete a dashboard */
export const deleteCustomDashboard = async (dashboardId: string): Promise<void> => {
  await apiClient.delete(`/analytics/api/dashboards/${dashboardId}/`);
};

/** Clone an existing dashboard */
export const cloneCustomDashboard = async (
  dashboardId: string,
  data?: { name?: string }
): Promise<DashboardDetail> => {
  const response = await apiClient.post<DashboardDetail>(
    `/analytics/api/dashboards/${dashboardId}/clone/`,
    data || {}
  );
  return response.data;
};

/** Set a dashboard as the default for the current user */
export const setCustomDashboardDefault = async (
  dashboardId: string
): Promise<DashboardDetail> => {
  const response = await apiClient.post<DashboardDetail>(
    `/analytics/api/dashboards/${dashboardId}/set_default/`
  );
  return response.data;
};

/** Toggle sharing status for a dashboard */
export const shareCustomDashboard = async (
  dashboardId: string,
  data?: { is_shared?: boolean; allowed_roles?: string[] }
): Promise<DashboardDetail> => {
  const response = await apiClient.post<DashboardDetail>(
    `/analytics/api/dashboards/${dashboardId}/share/`,
    data || {}
  );
  return response.data;
};

// --- Widget CRUD ---

/** Create a new widget within a dashboard */
export const createDashboardWidget = async (
  dashboardId: string,
  data: WidgetCreateData
): Promise<DashboardWidget> => {
  const response = await apiClient.post<DashboardWidget>(
    `/analytics/api/dashboards/${dashboardId}/widgets/`,
    data
  );
  return response.data;
};

/** Update an existing widget */
export const updateDashboardWidget = async (
  dashboardId: string,
  widgetId: string,
  data: Partial<WidgetCreateData>
): Promise<DashboardWidget> => {
  const response = await apiClient.patch<DashboardWidget>(
    `/analytics/api/dashboards/${dashboardId}/widgets/${widgetId}/`,
    data
  );
  return response.data;
};

/** Delete a widget from a dashboard */
export const deleteDashboardWidget = async (
  dashboardId: string,
  widgetId: string
): Promise<void> => {
  await apiClient.delete(
    `/analytics/api/dashboards/${dashboardId}/widgets/${widgetId}/`
  );
};

/** Bulk update widget positions (for drag-and-drop reordering) */
export const bulkUpdateWidgetPositions = async (
  dashboardId: string,
  positions: WidgetPositionUpdate[]
): Promise<{ updated: number }> => {
  const response = await apiClient.post<{ updated: number }>(
    `/analytics/api/dashboards/${dashboardId}/widgets/bulk_update_positions/`,
    { positions }
  );
  return response.data;
};

// --- Widget Data ---

/** Fetch computed data for a specific widget */
export const fetchWidgetData = async (
  widgetId: string,
  params: {
    time_range?: DashboardTimeRange;
    start_date?: string;
    end_date?: string;
    tenant_id?: string;
    [key: string]: string | undefined;
  } = {}
): Promise<WidgetData> => {
  const response = await apiClient.get<WidgetData>(
    buildUrl(`/analytics/api/widgets/${widgetId}/data/`, params)
  );
  return response.data;
};

/** Fetch available widget types and data sources metadata */
export const fetchWidgetMeta = async (): Promise<WidgetMetaResponse> => {
  const response = await apiClient.get<WidgetMetaResponse>(
    "/analytics/api/widgets/meta/"
  );
  return response.data;
};

// ============================================
// Discussion API Functions
// ============================================

// --- Discussion Threads ---

/** Fetch discussion threads for a course */
export const fetchDiscussionThreads = async (params: {
  course_id?: string;
  content_item_id?: string;
  include_archived?: boolean;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<DiscussionThreadListItem>> => {
  const response = await apiClient.get<PaginatedResponse<DiscussionThreadListItem>>(
    buildUrl("/api/v1/discussions/threads/", {
      course_id: params.course_id,
      content_item_id: params.content_item_id,
      include_archived: params.include_archived?.toString(),
      page: params.page,
      page_size: params.page_size,
    })
  );
  return response.data;
};

/** Fetch a single discussion thread by ID */
export const fetchDiscussionThread = async (
  threadId: string
): Promise<DiscussionThread> => {
  const response = await apiClient.get<DiscussionThread>(
    `/api/v1/discussions/threads/${threadId}/`
  );
  return response.data;
};

/** Create a new discussion thread */
export const createDiscussionThread = async (
  data: DiscussionThreadCreateData
): Promise<DiscussionThread> => {
  const response = await apiClient.post<DiscussionThread>(
    "/api/v1/discussions/threads/",
    data
  );
  return response.data;
};

/** Update an existing discussion thread */
export const updateDiscussionThread = async (
  threadId: string,
  data: Partial<DiscussionThreadCreateData> & {
    status?: DiscussionThreadStatus;
    is_pinned?: boolean;
    is_announcement?: boolean;
  }
): Promise<DiscussionThread> => {
  const response = await apiClient.patch<DiscussionThread>(
    `/api/v1/discussions/threads/${threadId}/`,
    data
  );
  return response.data;
};

/** Delete a discussion thread */
export const deleteDiscussionThread = async (
  threadId: string
): Promise<void> => {
  await apiClient.delete(`/api/v1/discussions/threads/${threadId}/`);
};

/** Toggle like on a discussion thread */
export const toggleDiscussionThreadLike = async (
  threadId: string
): Promise<{ liked: boolean; like_count: number }> => {
  const response = await apiClient.post<{ liked: boolean; like_count: number }>(
    `/api/v1/discussions/threads/${threadId}/like/`
  );
  return response.data;
};

/** Toggle bookmark on a discussion thread */
export const toggleDiscussionThreadBookmark = async (
  threadId: string
): Promise<{ bookmarked: boolean }> => {
  const response = await apiClient.post<{ bookmarked: boolean }>(
    `/api/v1/discussions/threads/${threadId}/bookmark/`
  );
  return response.data;
};

/** Mark a discussion thread as viewed */
export const markDiscussionThreadViewed = async (
  threadId: string
): Promise<{ viewed: boolean; view_count: number; last_viewed_at: string }> => {
  const response = await apiClient.post<{
    viewed: boolean;
    view_count: number;
    last_viewed_at: string;
  }>(`/api/v1/discussions/threads/${threadId}/view/`);
  return response.data;
};

/** Toggle pin status on a discussion thread (instructors/admins only) */
export const toggleDiscussionThreadPin = async (
  threadId: string
): Promise<{ is_pinned: boolean }> => {
  const response = await apiClient.post<{ is_pinned: boolean }>(
    `/api/v1/discussions/threads/${threadId}/pin/`
  );
  return response.data;
};

/** Toggle lock status on a discussion thread (instructors/admins only) */
export const toggleDiscussionThreadLock = async (
  threadId: string
): Promise<{ status: DiscussionThreadStatus }> => {
  const response = await apiClient.post<{ status: DiscussionThreadStatus }>(
    `/api/v1/discussions/threads/${threadId}/lock/`
  );
  return response.data;
};

// --- Discussion Replies ---

/** Fetch replies for a discussion thread */
export const fetchDiscussionReplies = async (params: {
  thread_id: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<DiscussionReply>> => {
  const response = await apiClient.get<PaginatedResponse<DiscussionReply>>(
    buildUrl("/api/v1/discussions/replies/", {
      thread_id: params.thread_id,
      page: params.page,
      page_size: params.page_size,
    })
  );
  return response.data;
};

/** Create a new reply to a discussion thread */
export const createDiscussionReply = async (
  data: DiscussionReplyCreateData
): Promise<DiscussionReply> => {
  const response = await apiClient.post<DiscussionReply>(
    "/api/v1/discussions/replies/",
    data
  );
  return response.data;
};

/** Update an existing discussion reply */
export const updateDiscussionReply = async (
  replyId: string,
  data: { content: string }
): Promise<DiscussionReply> => {
  const response = await apiClient.patch<DiscussionReply>(
    `/api/v1/discussions/replies/${replyId}/`,
    data
  );
  return response.data;
};

/** Delete a discussion reply */
export const deleteDiscussionReply = async (replyId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/discussions/replies/${replyId}/`);
};

/** Toggle like on a discussion reply */
export const toggleDiscussionReplyLike = async (
  replyId: string
): Promise<{ liked: boolean; like_count: number }> => {
  const response = await apiClient.post<{ liked: boolean; like_count: number }>(
    `/api/v1/discussions/replies/${replyId}/like/`
  );
  return response.data;
};

/** Toggle hide status on a discussion reply (instructors/admins only) */
export const toggleDiscussionReplyHide = async (
  replyId: string,
  reason?: string
): Promise<{ is_hidden: boolean; hidden_reason: string }> => {
  const response = await apiClient.post<{
    is_hidden: boolean;
    hidden_reason: string;
  }>(`/api/v1/discussions/replies/${replyId}/hide/`, { reason });
  return response.data;
};

// --- Discussion Bookmarks ---

/** Fetch user's bookmarked discussion threads */
export const fetchDiscussionBookmarks =
  async (): Promise<PaginatedResponse<DiscussionBookmark>> => {
    const response = await apiClient.get<PaginatedResponse<DiscussionBookmark>>(
      "/api/v1/discussions/bookmarks/"
    );
    return response.data;
  };

// =============================================================================
// Course Prerequisites API
// =============================================================================

/** Fetch prerequisites for a course */
export const fetchCoursePrerequisites = async (
  courseSlug: string
): Promise<CoursePrerequisite[]> => {
  const response = await apiClient.get<CoursePrerequisite[]>(
    `/api/v1/courses/courses/${courseSlug}/prerequisites/`
  );
  return response.data;
};

/** Create a course prerequisite */
export const createCoursePrerequisite = async (
  courseSlug: string,
  data: CoursePrerequisiteCreateData
): Promise<CoursePrerequisite> => {
  const response = await apiClient.post<CoursePrerequisite>(
    `/api/v1/courses/courses/${courseSlug}/prerequisites/`,
    data
  );
  return response.data;
};

/** Update a course prerequisite */
export const updateCoursePrerequisite = async (
  courseSlug: string,
  prerequisiteId: string,
  data: Partial<CoursePrerequisiteCreateData>
): Promise<CoursePrerequisite> => {
  const response = await apiClient.patch<CoursePrerequisite>(
    `/api/v1/courses/courses/${courseSlug}/prerequisites/${prerequisiteId}/`,
    data
  );
  return response.data;
};

/** Delete a course prerequisite */
export const deleteCoursePrerequisite = async (
  courseSlug: string,
  prerequisiteId: string
): Promise<void> => {
  await apiClient.delete(
    `/api/v1/courses/courses/${courseSlug}/prerequisites/${prerequisiteId}/`
  );
};

/** Get prerequisite chain for a course */
export const fetchCoursePrerequisiteChain = async (
  courseSlug: string
): Promise<{ chain: CoursePrerequisite[] }> => {
  const response = await apiClient.get<{ chain: CoursePrerequisite[] }>(
    `/api/v1/courses/courses/${courseSlug}/prerequisites/chain/`
  );
  return response.data;
};

/** Check if user meets course prerequisites */
export const checkCoursePrerequisites = async (
  courseSlug: string
): Promise<{
  met: boolean;
  unmet_prerequisites: {
    prerequisite_course_slug: string;
    prerequisite_course_title: string;
    prerequisite_type: PrerequisiteType;
    completion_percentage: number;
    required_percentage: number;
  }[];
}> => {
  const response = await apiClient.get(
    `/api/v1/courses/courses/${courseSlug}/prerequisites/check/`
  );
  return response.data;
};

// =============================================================================
// Module Prerequisites API
// =============================================================================

/** Fetch prerequisites for a module */
export const fetchModulePrerequisites = async (
  courseSlug: string,
  modulePk: string
): Promise<ModulePrerequisite[]> => {
  const response = await apiClient.get<ModulePrerequisite[]>(
    `/api/v1/courses/courses/${courseSlug}/modules/${modulePk}/prerequisites/`
  );
  return response.data;
};

/** Create a module prerequisite */
export const createModulePrerequisite = async (
  courseSlug: string,
  modulePk: string,
  data: ModulePrerequisiteCreateData
): Promise<ModulePrerequisite> => {
  const response = await apiClient.post<ModulePrerequisite>(
    `/api/v1/courses/courses/${courseSlug}/modules/${modulePk}/prerequisites/`,
    data
  );
  return response.data;
};

/** Update a module prerequisite */
export const updateModulePrerequisite = async (
  courseSlug: string,
  modulePk: string,
  prerequisiteId: string,
  data: Partial<ModulePrerequisiteCreateData>
): Promise<ModulePrerequisite> => {
  const response = await apiClient.patch<ModulePrerequisite>(
    `/api/v1/courses/courses/${courseSlug}/modules/${modulePk}/prerequisites/${prerequisiteId}/`,
    data
  );
  return response.data;
};

/** Delete a module prerequisite */
export const deleteModulePrerequisite = async (
  courseSlug: string,
  modulePk: string,
  prerequisiteId: string
): Promise<void> => {
  await apiClient.delete(
    `/api/v1/courses/courses/${courseSlug}/modules/${modulePk}/prerequisites/${prerequisiteId}/`
  );
};

/** Check if user meets module prerequisites */
export const checkModulePrerequisites = async (
  courseSlug: string,
  modulePk: string
): Promise<{
  met: boolean;
  unmet_prerequisites: {
    prerequisite_module_title: string;
    prerequisite_type: PrerequisiteType;
    current_score: number | null;
    required_score: number | null;
  }[];
}> => {
  const response = await apiClient.get(
    `/api/v1/courses/courses/${courseSlug}/modules/${modulePk}/prerequisites/check/`
  );
  return response.data;
};

// =============================================================================
// Skills API
// =============================================================================

/** Fetch skills with optional filters */
export const fetchSkills = async (params?: {
  category?: SkillCategory;
  parent?: string | "root";
  is_active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<SkillListItem>> => {
  const response = await apiClient.get<PaginatedResponse<SkillListItem>>(
    buildUrl("/skills/skills/", params)
  );
  return response.data;
};

/** Fetch a single skill by slug */
export const fetchSkill = async (slug: string): Promise<Skill> => {
  const response = await apiClient.get<Skill>(`/skills/skills/${slug}/`);
  return response.data;
};

/** Create a new skill */
export const createSkill = async (data: SkillCreateUpdateData): Promise<Skill> => {
  const response = await apiClient.post<Skill>("/skills/skills/", data);
  return response.data;
};

/** Update a skill */
export const updateSkill = async (
  slug: string,
  data: Partial<SkillCreateUpdateData>
): Promise<Skill> => {
  const response = await apiClient.patch<Skill>(
    `/skills/skills/${slug}/`,
    data
  );
  return response.data;
};

/** Delete a skill */
export const deleteSkill = async (slug: string): Promise<void> => {
  await apiClient.delete(`/skills/skills/${slug}/`);
};

/** Fetch skill hierarchy (tree structure) */
export const fetchSkillHierarchy = async (): Promise<Skill[]> => {
  const response = await apiClient.get<Skill[]>(
    "/skills/skills/hierarchy/"
  );
  return response.data;
};

/** Fetch skill categories with counts */
export const fetchSkillCategories = async (): Promise<
  { value: SkillCategory; label: string; count: number }[]
> => {
  const response = await apiClient.get<
    { value: SkillCategory; label: string; count: number }[]
  >("/skills/skills/categories/");
  return response.data;
};

/** Fetch modules that teach a specific skill */
export const fetchSkillModules = async (
  slug: string
): Promise<ModuleSkill[]> => {
  const response = await apiClient.get<ModuleSkill[]>(
    `/skills/skills/${slug}/modules/`
  );
  return response.data;
};

/** Fetch progress statistics for a skill */
export const fetchSkillProgressStats = async (
  slug: string
): Promise<{
  skill_id: string;
  skill_name: string;
  total_learners: number;
  average_proficiency: number;
  learners_by_level: Record<SkillProficiencyLevel, number>;
}> => {
  const response = await apiClient.get(
    `/skills/skills/${slug}/progress-stats/`
  );
  return response.data;
};

// =============================================================================
// Module-Skill Mappings API
// =============================================================================

/** Fetch module-skill mappings */
export const fetchModuleSkills = async (params?: {
  module?: string;
  skill?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ModuleSkill>> => {
  const response = await apiClient.get<PaginatedResponse<ModuleSkill>>(
    buildUrl("/skills/module-skills/", params)
  );
  return response.data;
};

/** Create a module-skill mapping */
export const createModuleSkill = async (
  data: ModuleSkillCreateData
): Promise<ModuleSkill> => {
  const response = await apiClient.post<ModuleSkill>(
    "/skills/module-skills/",
    data
  );
  return response.data;
};

/** Update a module-skill mapping */
export const updateModuleSkill = async (
  id: string,
  data: Partial<ModuleSkillCreateData>
): Promise<ModuleSkill> => {
  const response = await apiClient.patch<ModuleSkill>(
    `/skills/module-skills/${id}/`,
    data
  );
  return response.data;
};

/** Delete a module-skill mapping */
export const deleteModuleSkill = async (id: string): Promise<void> => {
  await apiClient.delete(`/skills/module-skills/${id}/`);
};

/** Bulk create module-skill mappings */
export const bulkCreateModuleSkills = async (
  moduleId: string,
  data: ModuleSkillBulkCreateData
): Promise<ModuleSkill[]> => {
  const response = await apiClient.post<ModuleSkill[]>(
    "/skills/module-skills/bulk-create/",
    { module_id: moduleId, ...data }
  );
  return response.data;
};

// =============================================================================
// Learner Skill Progress API
// =============================================================================

/** Fetch learner skill progress records */
export const fetchLearnerSkillProgress = async (params?: {
  user?: string;
  skill?: string;
  min_proficiency?: number;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<LearnerSkillProgress>> => {
  const response = await apiClient.get<PaginatedResponse<LearnerSkillProgress>>(
    buildUrl("/skills/skill-progress/", params)
  );
  return response.data;
};

/** Fetch detailed learner skill progress */
export const fetchLearnerSkillProgressDetail = async (
  id: string
): Promise<LearnerSkillProgressDetail> => {
  const response = await apiClient.get<LearnerSkillProgressDetail>(
    `/skills/skill-progress/${id}/`
  );
  return response.data;
};

/** Fetch current user's skill progress summary */
export const fetchMySkillProgress = async (): Promise<LearnerSkillSummary> => {
  const response = await apiClient.get<LearnerSkillSummary>(
    "/skills/skill-progress/my-progress/"
  );
  return response.data;
};

/** Fetch skill gaps for current user */
export const fetchSkillGaps = async (): Promise<SkillGap[]> => {
  const response = await apiClient.get<SkillGap[]>(
    "/skills/skill-progress/skill-gaps/"
  );
  return response.data;
};

// =============================================================================
// Assessment-Skill Mappings API
// =============================================================================

/** Fetch assessment-skill mappings */
export const fetchAssessmentSkillMappings = async (params?: {
  question?: string;
  assessment?: string;
  skill?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AssessmentSkillMapping>> => {
  const response = await apiClient.get<PaginatedResponse<AssessmentSkillMapping>>(
    buildUrl("/skills/assessment-skill-mappings/", params)
  );
  return response.data;
};

/** Create an assessment-skill mapping */
export const createAssessmentSkillMapping = async (data: {
  question: string;
  skill: string;
  weight?: number;
  proficiency_required?: SkillProficiencyLevel;
  proficiency_demonstrated?: SkillProficiencyLevel;
}): Promise<AssessmentSkillMapping> => {
  const response = await apiClient.post<AssessmentSkillMapping>(
    "/skills/assessment-skill-mappings/",
    data
  );
  return response.data;
};

/** Delete an assessment-skill mapping */
export const deleteAssessmentSkillMapping = async (id: string): Promise<void> => {
  await apiClient.delete(`/skills/assessment-skill-mappings/${id}/`);
};

/** Get skill coverage for an assessment */
export const fetchAssessmentSkillCoverage = async (
  assessmentId: string
): Promise<{
  assessment_id: string;
  total_mappings: number;
  skills_covered: number;
  skills: {
    skill_id: string;
    skill_name: string;
    skill_category: SkillCategory;
    question_count: number;
    total_weight: number;
    proficiency_levels: SkillProficiencyLevel[];
  }[];
}> => {
  const response = await apiClient.get(
    `/skills/assessment-skill-mappings/coverage/?assessment_id=${assessmentId}`
  );
  return response.data;
};

// =============================================================================
// Personalized Learning Paths API
// =============================================================================

/** Fetch personalized learning paths for current user */
export const fetchPersonalizedPaths = async (params?: {
  status?: PersonalizedPathStatus;
  generation_type?: PersonalizedPathGenerationType;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<PersonalizedLearningPathListItem>> => {
  const response = await apiClient.get<
    PaginatedResponse<PersonalizedLearningPathListItem>
  >(buildUrl("/api/v1/learning-paths/personalized-paths/", params));
  return response.data;
};

/** Fetch a single personalized learning path */
export const fetchPersonalizedPath = async (
  id: string
): Promise<PersonalizedLearningPath> => {
  const response = await apiClient.get<PersonalizedLearningPath>(
    `/api/v1/learning-paths/personalized-paths/${id}/`
  );
  return response.data;
};

/** Fetch steps for a personalized path */
export const fetchPersonalizedPathSteps = async (
  pathId: string
): Promise<PersonalizedPathStep[]> => {
  const response = await apiClient.get<PersonalizedPathStep[]>(
    `/api/v1/learning-paths/personalized-paths/${pathId}/steps/`
  );
  return response.data;
};

/** Archive a personalized path */
export const archivePersonalizedPath = async (
  id: string
): Promise<PersonalizedLearningPath> => {
  const response = await apiClient.post<PersonalizedLearningPath>(
    `/api/v1/learning-paths/personalized-paths/${id}/archive/`
  );
  return response.data;
};

/** Check if a personalized path has expired */
export const checkPersonalizedPathExpiry = async (
  id: string
): Promise<PersonalizedLearningPath> => {
  const response = await apiClient.get<PersonalizedLearningPath>(
    `/api/v1/learning-paths/personalized-paths/${id}/check-expiry/`
  );
  return response.data;
};

// =============================================================================
// Path Generation API
// =============================================================================

/** Generate a skill-gap based personalized learning path */
export const generateSkillGapPath = async (
  data: GenerateSkillGapPathRequest
): Promise<PersonalizedLearningPath> => {
  const response = await apiClient.post<PersonalizedLearningPath>(
    "/api/v1/learning-paths/personalized-paths/generate/",
    data
  );
  return response.data;
};

/** Generate a remedial learning path based on a failed assessment */
export const generateRemedialPath = async (
  data: GenerateRemedialPathRequest
): Promise<PersonalizedLearningPath> => {
  const response = await apiClient.post<PersonalizedLearningPath>(
    "/api/v1/learning-paths/personalized-paths/generate/remedial/",
    data
  );
  return response.data;
};

/** Preview a path generation without saving */
export const previewPathGeneration = async (
  data: GeneratePathPreviewRequest
): Promise<PathPreviewResponse> => {
  const response = await apiClient.post<PathPreviewResponse>(
    "/api/v1/learning-paths/personalized-paths/generate/preview/",
    data
  );
  return response.data;
};

// =============================================================================
// Personalized Path Progress API
// =============================================================================

/** Fetch personalized path progress records */
export const fetchPersonalizedPathProgress = async (params?: {
  path?: string;
  status?: LearningPathProgressStatus;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<PersonalizedPathProgress>> => {
  const response = await apiClient.get<PaginatedResponse<PersonalizedPathProgress>>(
    buildUrl("/api/v1/learning-paths/personalized-progress/", params)
  );
  return response.data;
};

/** Fetch a single personalized path progress record */
export const fetchPersonalizedPathProgressDetail = async (
  id: string
): Promise<PersonalizedPathProgress> => {
  const response = await apiClient.get<PersonalizedPathProgress>(
    `/api/v1/learning-paths/personalized-progress/${id}/`
  );
  return response.data;
};

/** Start tracking progress on a personalized path */
export const startPersonalizedPath = async (
  progressId: string
): Promise<PersonalizedPathProgress> => {
  const response = await apiClient.post<PersonalizedPathProgress>(
    `/api/v1/learning-paths/personalized-progress/${progressId}/start/`
  );
  return response.data;
};

/** Update current step in personalized path progress */
export const updatePersonalizedPathStep = async (
  progressId: string,
  stepOrder: number
): Promise<PersonalizedPathProgress> => {
  const response = await apiClient.post<PersonalizedPathProgress>(
    `/api/v1/learning-paths/personalized-progress/${progressId}/update-step/`,
    { step_order: stepOrder }
  );
  return response.data;
};

/** Mark a personalized path as completed */
export const completePersonalizedPath = async (
  progressId: string
): Promise<PersonalizedPathProgress> => {
  const response = await apiClient.post<PersonalizedPathProgress>(
    `/api/v1/learning-paths/personalized-progress/${progressId}/complete/`
  );
  return response.data;
};

/** Pause progress on a personalized path */
export const pausePersonalizedPath = async (
  progressId: string
): Promise<PersonalizedPathProgress> => {
  const response = await apiClient.post<PersonalizedPathProgress>(
    `/api/v1/learning-paths/personalized-progress/${progressId}/pause/`
  );
  return response.data;
};

/** Resume a paused personalized path */
export const resumePersonalizedPath = async (
  progressId: string
): Promise<PersonalizedPathProgress> => {
  const response = await apiClient.post<PersonalizedPathProgress>(
    `/api/v1/learning-paths/personalized-progress/${progressId}/resume/`
  );
  return response.data;
};
