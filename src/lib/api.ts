import axios, { AxiosError } from "axios";
import { Course, PaginatedResponse, User } from "./types"; // Import necessary types

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Authorization header added dynamically by AuthProvider/interceptor
  },
  withCredentials: true, // Send cookies if backend uses HttpOnly session/CSRF cookies
});

// Interceptor setup moved to AuthProvider for better state management access

// --- Auth API Functions ---
export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await apiClient.post("/auth/login/", credentials);
  // Expect response like { access: string, refresh: string }
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const response = await apiClient.post<{ access: string }>(
    "/auth/login/refresh/",
    {
      refresh: refreshToken,
    },
  );
  return response.data.access;
};

export const registerUser = async (userData: any) => {
  // userData should match UserCreateSerializer expected fields
  const response = await apiClient.post("/auth/register/", userData);
  return response.data;
};

export const fetchUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/profile/");
  return response.data;
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<User> & { profile?: Partial<any> },
) => {
  // Use appropriate endpoint - profile endpoint or admin user manage endpoint
  const response = await apiClient.patch<User>(`/auth/profile/`, data); // Example endpoint
  return response.data;
};

export const changePassword = async (data: any) => {
  const response = await apiClient.post("/auth/profile/change-password/", data);
  return response.data;
};

// --- Course API Functions ---
export const fetchCourses = async (
  params: Record<string, any> = {},
): Promise<PaginatedResponse<Course>> => {
  // Example params: { enrolled: 'true', search: '...', status: 'PUBLISHED' }
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

// --- Module & ContentItem API Functions (Example using nested routes) ---
export const fetchModules = async (courseSlug: string): Promise<any[]> => {
  // Define Module type
  const response = await apiClient.get(
    `/courses/courses/${courseSlug}/modules/`,
  );
  return response.data.results; // Assuming pagination or adjust as needed
};

export const createModule = async (
  courseSlug: string,
  data: { title: string; description?: string; order?: number },
): Promise<any> => {
  const response = await apiClient.post(
    `/courses/courses/${courseSlug}/modules/`,
    data,
  );
  return response.data;
};

// Add more API functions for:
// - Assessments CRUD
// - Questions CRUD
// - Assessment Attempts (start, submit, view results)
// - Enrollments (manual create, group create, list)
// - Learner Progress (list, update)
// - Certificates (list, verify)
// - Files/Folders (upload, list, delete)
// - Learning Paths (CRUD, steps management)
// - AI Engine (start job, view results, manage configs/templates)
// - Notifications (list, mark read, update preferences)
// - Analytics (generate reports, track events)
// - User/Group Management (Admin APIs)

// --- Error Handling Helper ---
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>; // Type assertion
    // Try to extract specific detail message from backend response
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    // Check for validation errors (often a dictionary)
    if (
      axiosError.response?.data &&
      typeof axiosError.response.data === "object"
    ) {
      // Extract first validation error message
      const firstErrorKey = Object.keys(axiosError.response.data)[0];
      if (
        firstErrorKey &&
        Array.isArray(axiosError.response.data[firstErrorKey])
      ) {
        return axiosError.response.data[firstErrorKey][0];
      }
      if (firstErrorKey) {
        // Handle non-field errors possibly
        return String(axiosError.response.data[firstErrorKey]);
      }
    }
    // Fallback to generic message
    return axiosError.message || "An unknown API error occurred.";
  } else if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
};
