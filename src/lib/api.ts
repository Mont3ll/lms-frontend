/* eslint-disable @typescript-eslint/no-explicit-any */
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
  LearningPathProgress,
  LearningPathStepProgress,
  Tenant,
  LearnerProgress,
  InstructorDashboardStats,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage on each request
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
              `${API_BASE_URL}/auth/token/refresh/`,
              {
                refresh: refreshToken,
              },
            );

            const newToken = response.data.access;
            localStorage.setItem("authToken", newToken);

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
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
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.detail)
      return axiosError.response.data.detail;
    if (
      axiosError.response?.data &&
      typeof axiosError.response.data === "object"
    ) {
      const firstErrorKey = Object.keys(axiosError.response.data)[0];
      if (
        firstErrorKey &&
        Array.isArray(axiosError.response.data[firstErrorKey])
      )
        return axiosError.response.data[firstErrorKey][0];
      if (firstErrorKey) return String(axiosError.response.data[firstErrorKey]);
    }
    return axiosError.message || "An unknown API error occurred.";
  } else if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
};

// Helper function for query parameters
const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
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
    "/auth/token/refresh/",
    { refresh: refreshToken },
  );
  return response.data.access;
};
export const registerUser = async (userData: any): Promise<User> => {
  // Define specific type for userData if possible
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
}): Promise<any> => {
  // Response might be empty on success
  const response = await apiClient.post("/auth/profile/change-password/", data);
  return response.data;
};
// Add: Password Reset Request, Password Reset Confirm API calls

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
  params: Record<string, any> = {},
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
export const createUser = async (userData: any): Promise<User> => {
  // Define specific type for userData
  const response = await apiClient.post<User>("/users/manage/", userData);
  return response.data;
};
export const updateUser = async (
  userId: string,
  userData: any,
): Promise<User> => {
  // Define specific type for userData
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
  params: Record<string, any> = {},
): Promise<PaginatedResponse<any>> => {
  // Define LearnerGroup type
  const response = await apiClient.get<PaginatedResponse<any>>(
    "/users/groups/",
    { params },
  );
  return response.data;
};
export const fetchLearnerGroupDetails = async (
  groupId: string,
): Promise<any> => {
  // Define LearnerGroup type
  const response = await apiClient.get<any>(`/users/groups/${groupId}/`);
  return response.data;
};
export const createLearnerGroup = async (data: {
  name: string;
  description?: string;
  member_ids?: string[];
}): Promise<any> => {
  const response = await apiClient.post<any>("/users/groups/", data);
  return response.data;
};
export const updateLearnerGroup = async (
  groupId: string,
  data: { name?: string; description?: string; member_ids?: string[] },
): Promise<any> => {
  const response = await apiClient.patch<any>(
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
): Promise<any> => {
  const response = await apiClient.post(
    `/users/groups/${groupId}/add_members/`,
    { user_ids: userIds },
  );
  return response.data;
};
export const removeMembersFromGroup = async (
  groupId: string,
  userIds: string[],
): Promise<any> => {
  const response = await apiClient.post(
    `/users/groups/${groupId}/remove_members/`,
    { user_ids: userIds },
  );
  return response.data;
};

// === Courses ===
export const fetchCourses = async (
  params: Record<string, any> = {},
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
export const fetchModules = async (courseSlug: string): Promise<any[]> => {
  // Define Module type
  const response = await apiClient.get(
    `/courses/courses/${courseSlug}/modules/`,
  );
  return response.data.results; // Assuming pagination or full list
};
export const createModule = async (
  courseSlug: string,
  data: { title: string; description?: string; order?: number },
): Promise<any> => {
  // Define Module type
  const response = await apiClient.post(
    `/courses/courses/${courseSlug}/modules/`,
    data,
  );
  return response.data;
};
export const updateModule = async (
  courseSlug: string,
  moduleId: string,
  data: any,
): Promise<any> => {
  // Define Module type
  const response = await apiClient.patch(
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
): Promise<any[]> => {
  // Define ContentItem type
  const response = await apiClient.get(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/`,
  );
  return response.data.results; // Assuming pagination or full list
};
export const createContentItem = async (
  courseSlug: string,
  moduleId: string,
  data: any,
): Promise<any> => {
  // Define ContentItem type
  const response = await apiClient.post(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/`,
    data,
  );
  return response.data;
};
export const updateContentItem = async (
  courseSlug: string,
  moduleId: string,
  itemId: string,
  data: any,
): Promise<any> => {
  // Define ContentItem type
  const response = await apiClient.patch(
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
): Promise<any> => {
  // Define ContentVersion type
  const response = await apiClient.post(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${itemId}/create-version/`,
    data,
  );
  return response.data;
};
export const listContentItemVersions = async (
  courseSlug: string,
  moduleId: string,
  itemId: string,
): Promise<any[]> => {
  // Define ContentVersion type
  const response = await apiClient.get(
    `/courses/courses/${courseSlug}/modules/${moduleId}/items/${itemId}/versions/`,
  );
  return response.data; // Assuming list response
};
// Add: Reorder Content Items API

// === Assessments ===
export const fetchAssessments = async (
  params: Record<string, any> = {},
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
export const createAssessment = async (data: any): Promise<Assessment> => {
  // Define Assessment create type
  const response = await apiClient.post<Assessment>(
    "/assessments/",
    data,
  );
  return response.data;
};
export const updateAssessment = async (
  assessmentId: string,
  data: any,
): Promise<Assessment> => {
  // Define Assessment update type
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
  const response = await apiClient.get(
    `/assessments/${assessmentId}/questions/`,
  );
  return response.data.results || response.data; // Handle paginated or simple list response
};
export const createQuestion = async (
  assessmentId: string,
  data: any,
): Promise<Question> => {
  // Define Question create type
  const response = await apiClient.post<Question>(
    `/assessments/${assessmentId}/questions/`,
    data,
  );
  return response.data;
};
export const updateQuestion = async (
  assessmentId: string,
  questionId: string,
  data: any,
): Promise<Question> => {
  // Define Question update type
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
  data: { answers: Record<string, any> },
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
  params: Record<string, any> = {},
): Promise<PaginatedResponse<AssessmentAttempt>> => {
  // Assumes an admin/instructor endpoint exists, e.g., /assessments/{id}/attempts/
  const response = await apiClient.get<PaginatedResponse<AssessmentAttempt>>(
    `/assessments/${assessmentId}/attempts/`,
    { params },
  );
  return response.data;
};
// Add: API for manual grading submission

// === Enrollments ===
export const fetchEnrollments = async (
  params: Record<string, any> = {},
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
  const response = await apiClient.get(`/enrollments/enrollments/${enrollmentId}/progress/`);
  return response.data.results; // Return the results array from paginated response
};

export const updateLearnerProgress = async (
  enrollmentId: string,
  contentItemId: string,
  data: {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progress_details?: any;
  }
): Promise<LearnerProgress> => {
  const response = await apiClient.post(`/enrollments/enrollments/${enrollmentId}/progress/${contentItemId}/`, data);
  return response.data;
};

// === Certificates ===
export const fetchCertificates = async (
  params: Record<string, any> = {},
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
): Promise<any[]> => {
  // Use any type until Folder type is defined
  const response = await apiClient.get("/files/folders/", { params });
  return response.data.results || response.data; // Assuming paginated or list
};
export const createFolder = async (data: {
  name: string;
  parent_id?: string | null;
}): Promise<any> => {
  const response = await apiClient.post<any>("/files/folders/", data);
  return response.data;
};
export const fetchFiles = async (
  params: { folder_id?: string } = {},
): Promise<PaginatedResponse<any>> => {
  // Assuming an endpoint exists to list files, potentially filtered by folder
  const response = await apiClient.get<PaginatedResponse<any>>(
    "/files/files/",
    { params },
  ); // Adjust endpoint if needed
  return response.data;
};
export const fetchFileDetails = async (fileId: string): Promise<any> => {
  const response = await apiClient.get<any>(`/files/files/${fileId}/`);
  return response.data; // Includes download_url added by view
};
export const uploadFile = async (
  file: File,
  folderId?: string,
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) {
    formData.append("folder_id", folderId);
  }
  const response = await apiClient.post<any>("/files/upload/", formData, {
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
  params: Record<string, any> = {},
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
export const createLearningPath = async (data: any): Promise<LearningPath> => {
  // Define LP Create type
  const response = await apiClient.post<LearningPath>(
    "/learning-paths/learning-paths/",
    data,
  );
  return response.data;
};
export const updateLearningPath = async (
  slug: string,
  data: any,
): Promise<LearningPath> => {
  // Define LP Update type
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
  data: any,
): Promise<any> => {
  // Define Step Create type
  const response = await apiClient.post<any>(
    `/learning-paths/learning-paths/${pathSlug}/steps/`,
    data,
  );
  return response.data;
};
export const updateLearningPathStep = async (
  pathSlug: string,
  stepId: string,
  data: any,
): Promise<any> => {
  // Define Step Update type
  const response = await apiClient.patch<any>(
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
): Promise<any> => {
  const response = await apiClient.post(
    `/learning-paths/learning-paths/${pathSlug}/reorder-steps/`,
    { steps: stepIds },
  );
  return response.data;
};
// Add: API for fetching/updating LP progress

// === AI Engine ===
export const startAIGenerationJob = async (
  data: any,
): Promise<any> => {
  // Define Job Start type
  const response = await apiClient.post<any>("/ai/generate/", data);
  return response.data;
};
export const fetchAIGenerationJobs = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<any>> => {
  const response = await apiClient.get<PaginatedResponse<any>>(
    "/ai/jobs/",
    { params },
  );
  return response.data;
};
export const fetchAIGenerationJobDetails = async (
  jobId: string,
): Promise<any> => {
  const response = await apiClient.get<any>(`/ai/jobs/${jobId}/`);
  return response.data;
};
export const fetchAIGeneratedContent = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<any>> => {
  const response = await apiClient.get<PaginatedResponse<any>>(
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
): Promise<any> => {
  const response = await apiClient.patch<any>(
    `/ai/generated-content/${contentId}/`,
    data,
  );
  return response.data;
};
// Add: CRUD APIs for ModelConfig and PromptTemplate (if needed beyond ViewSets already defined)

// === Notifications ===
export const fetchNotifications = async (
  params: Record<string, any> = {},
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
  async (): Promise<any> => {
    const response = await apiClient.get<any>(
      "/notifications/preferences/",
    );
    return response.data;
  };
export const updateNotificationPreferences = async (
  data: any,
): Promise<any> => {
  const response = await apiClient.patch<any>(
    "/notifications/preferences/",
    data,
  );
  return response.data;
};

// === Analytics ===
export const fetchReportData = async (
  reportSlug: string,
  filters: Record<string, any> = {},
): Promise<any> => {
  // Define specific ReportData types later
  const response = await apiClient.get(
    `/analytics/reports/${reportSlug}/data/`,
    { params: filters },
  );
  return response.data;
};

export const trackEvent = async (eventData: {
  event_type: string;
  context_data?: any;
}): Promise<void> => {
  await apiClient.post("/analytics/track/", eventData);
};

// === Tenants (Admin) ===
export const fetchTenants = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<Tenant>> => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key].toString());
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

export const createTenant = async (data: any): Promise<Tenant> => {
  const response = await apiClient.post('/admin/tenants/', data);
  return response.data;
};

export const updateTenant = async (
  tenantId: string,
  data: any,
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
): Promise<any> => {
  const response = await apiClient.post(`/admin/tenants/${tenantId}/manage-domains/`, {
    domains,
    action
  });
  return response.data;
};

// === Admin Specific APIs ===
export const fetchAdminDashboardStats = async (): Promise<any> => {
  const response = await apiClient.get<any>('/admin/dashboard-stats/');
  return response.data;
};

export const fetchAllPlatformCourses = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<Course>> => {
  // Use the regular courses endpoint, the backend should handle admin-level access via permissions
  const response = await apiClient.get<PaginatedResponse<Course>>(
    buildUrl('/courses/courses/', params)
  );
  return response.data;
};

export const fetchAIModelConfigs = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<any>> => {
  const response = await apiClient.get<PaginatedResponse<any>>(
    buildUrl('/ai/model-configs/', params)
  );
  return response.data;
};

export const createAIModelConfig = async (data: any): Promise<any> => {
  const response = await apiClient.post('/ai/model-configs/', data);
  return response.data;
};

export const updateAIModelConfig = async (id: string, data: any): Promise<any> => {
  const response = await apiClient.put(`/ai/model-configs/${id}/`, data);
  return response.data;
};

export const deleteAIModelConfig = async (id: string): Promise<void> => {
  await apiClient.delete(`/ai/model-configs/${id}/`);
};

export const fetchAIPromptTemplates = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<any>> => {
  const response = await apiClient.get<PaginatedResponse<any>>(
    buildUrl('/ai/prompt-templates/', params)
  );
  return response.data;
};

export const createAIPromptTemplate = async (data: any): Promise<any> => {
  const response = await apiClient.post('/ai/prompt-templates/', data);
  return response.data;
};

export const updateAIPromptTemplate = async (id: string, data: any): Promise<any> => {
  const response = await apiClient.put(`/ai/prompt-templates/${id}/`, data);
  return response.data;
};

export const deleteAIPromptTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/ai/prompt-templates/${id}/`);
};

export const fetchReportDefinitions = async (): Promise<any[]> => {
  // Analytics endpoints may not be fully implemented yet
  try {
    return apiClient.get('/analytics/report-definitions/').then(res => res.data);
  } catch {
    // Return empty array if endpoint doesn't exist
    return [];
  }
};

export const fetchDashboardDefinitions = async (): Promise<any[]> => {
  // Analytics endpoints may not be fully implemented yet
  try {
    return apiClient.get('/analytics/dashboard-definitions/').then(res => res.data);
  } catch {
    // Return empty array if endpoint doesn't exist
    return [];
  }
};

export const fetchInstructorDashboardStats = async (): Promise<InstructorDashboardStats> => {
  const response = await apiClient.get<InstructorDashboardStats>('/instructor/dashboard-stats/');
  return response.data;
};

export const fetchInstructorAssessments = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<Assessment>> => {
  const response = await apiClient.get<PaginatedResponse<Assessment>>(
    buildUrl('/instructor/assessments/', params)
  );
  return response.data;
};

export const fetchInstructorCourses = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<Course>> => {
  // Always try the real endpoint first
  const response = await apiClient.get<PaginatedResponse<Course>>(
    buildUrl('/courses/courses/', { ...params, instructor: 'me' })
  );
  return response.data;
};

export const fetchInstructorReports = async (): Promise<any[]> => {
  const response = await apiClient.get('/instructor/reports/');
  return response.data;
};

export const reorderModules = async (courseSlug: string, orderedIds: string[]): Promise<any> => {
  return apiClient.post(`/courses/${courseSlug}/modules/reorder/`, {
    ordered_ids: orderedIds
  }).then(res => res.data);
};

export const fetchCourseEnrollments = async (
  courseSlug: string,
  params: Record<string, any> = {},
): Promise<PaginatedResponse<Enrollment>> => {
  const response = await apiClient.get<PaginatedResponse<Enrollment>>(
    buildUrl(`/courses/${courseSlug}/enrollments/`, params)
  );
  return response.data;
};

export const gradeManualAttempt = async (attemptId: string, data: any): Promise<AssessmentAttempt> => {
  const response = await apiClient.post<AssessmentAttempt>(
    `/assessments/attempts/${attemptId}/grade/`,
    data
  );
  return response.data;
};

export const fetchLearnerDashboardStats = async (): Promise<any> => {
  const response = await apiClient.get('/learner/dashboard-stats/');
  return response.data;
};

export const fetchContentItemDetails = async (contentId: string): Promise<any> => {
  const response = await apiClient.get(`/content-items/${contentId}/`);
  return response.data;
};

export const fetchContentItemProgress = async (
  enrollmentId: string,
  contentItemId: string,
): Promise<any> => {
  const response = await apiClient.get(
    `/enrollments/${enrollmentId}/progress/${contentItemId}/`
  );
  return response.data;
};

export const fetchLearningPathUserProgress = async (pathSlug: string): Promise<any> => {
  const response = await apiClient.get(`/learning-paths/${pathSlug}/my-progress/`);
  return response.data;
};

// New Progress Tracking API functions
export const fetchLearningPathProgress = async (
  params: Record<string, any> = {}
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
  params: Record<string, any> = {}
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

export const updateCourseModules = async (courseSlug: string, modules: any[]): Promise<any> => {
  const response = await apiClient.put(`/courses/courses/${courseSlug}/modules/bulk-update/`, {
    modules
  });
  return response.data;
};

// === New Instructor Analytics API ===
export const fetchInstructorAnalytics = async (params: {
  timeRange: string;
  courseId?: string;
}) => {
  const searchParams = new URLSearchParams({
    time_range: params.timeRange,
    ...(params.courseId && params.courseId !== 'all' && { course_id: params.courseId }),
  });

  const response = await apiClient.get(`/instructor/analytics/?${searchParams}`);
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
