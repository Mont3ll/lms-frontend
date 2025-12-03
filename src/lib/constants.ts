// Define API route constants, roles, etc.
export const API_ROUTES = {
  LOGIN: "/login/",
  REFRESH: "/login/refresh/",
  REGISTER: "/register/",
  PROFILE: "/profile/",
  COURSES: "/courses/courses/",
  // Add other routes
};

export const USER_ROLES = {
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  LEARNER: "LEARNER",
};

export const QUERY_KEYS = {
  USER_PROFILE: ["userProfile"],
  USERS: ["users"],
  USER_DETAILS: (userId: string) => ["userDetails", userId],
  COURSES: ["courses"],
  COURSE_DETAILS: (slug: string) => ["courseDetails", slug],
  TENANTS: ["tenants"],
  TENANT_DETAILS: (tenantId: string) => ["tenantDetails", tenantId],
  ADMIN_DASHBOARD_STATS: ["adminDashboardStats"],
  INSTRUCTOR_DASHBOARD_STATS: ["instructorDashboardStats"],
  INSTRUCTOR_ANALYTICS: ["instructorAnalytics"],
  LEARNER_DASHBOARD_STATS: ["learnerDashboardStats"],
  CERTIFICATES: ["certificates"],
  NOTIFICATION_PREFERENCES: ["notificationPreferences"],
  NOTIFICATIONS: ["notifications"],
  ASSESSMENTS: ["assessments"],
  ASSESSMENT_DETAILS: (assessmentId: string) => [
    "assessmentDetails",
    assessmentId,
  ],
  ASSESSMENT_ATTEMPTS: (assessmentId: string) => [
    "assessmentAttempts",
    assessmentId,
  ],
  ENROLLMENTS: ["enrollments"],
  LEARNER_PROGRESS: (enrollmentId: string) => ["learnerProgress", enrollmentId],
  LEARNING_PATHS: ["learningPaths"],
  LEARNING_PATH_DETAILS: (pathSlug: string) => [
    "learningPaths",
    pathSlug,
  ],
  LEARNING_PATH_PROGRESS: (pathSlug: string) => [
    "learningPathProgress",
    pathSlug,
  ],
  ADMIN_COURSES: ["adminCourses"],
  AI_MODEL_CONFIGS: ["aiModelConfigs"],
  AI_PROMPT_TEMPLATES: ["aiPromptTemplates"],
  REPORT_DEFINITIONS: ["reportDefinitions"],
  DASHBOARD_DEFINITIONS: ["dashboardDefinitions"],
  REPORT_DATA: ["reportData"],
  CONTENT_ITEM_DETAILS: (contentId: string) => [
    "contentItemDetails",
    contentId,
  ],
  CONTENT_ITEM_PROGRESS: (enrollmentId: string, contentItemId: string) => [
    "contentItemProgress",
    enrollmentId,
    contentItemId,
  ],
  INSTRUCTOR_ASSESSMENTS: ["instructorAssessments"],
  INSTRUCTOR_COURSES: ["instructorCourses"],
  COURSE_ENROLLMENTS: (courseSlug: string) => ["courseEnrollments", courseSlug],
  // Add other query keys as needed
} as const;
