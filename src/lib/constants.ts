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
} as const;

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
  LEARNER_RECOMMENDATIONS: ["learnerRecommendations"],
  LEARNER_INSIGHTS: ["learnerInsights"],
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
  ADMIN_ANALYTICS: (timeRange: string, tenantId?: string) => ["adminAnalytics", timeRange, tenantId],
  
  // Custom Dashboards
  CUSTOM_DASHBOARDS: ["customDashboards"],
  CUSTOM_DASHBOARD_DETAIL: (dashboardId: string) => ["customDashboard", dashboardId],
  WIDGET_DATA: (widgetId: string, timeRange?: string) => ["widgetData", widgetId, timeRange],
  WIDGET_META: ["widgetMeta"],
  
  // Skills
  SKILLS: ["skills"],
  SKILL_DETAILS: (skillId: string) => ["skillDetails", skillId],
  
  // Personalized Paths
  PERSONALIZED_PATHS: ["personalizedPaths"],
  
  // My Assessment Attempts (for current user)
  MY_ASSESSMENT_ATTEMPTS: ["myAssessmentAttempts"],
  // Add other query keys as needed
} as const;
