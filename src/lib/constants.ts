// Define API route constants, roles, etc.
export const API_ROUTES = {
  LOGIN: "/auth/login/",
  REFRESH: "/auth/login/refresh/",
  REGISTER: "/auth/register/",
  PROFILE: "/auth/profile/",
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
  COURSES: ["courses"],
  COURSE_DETAILS: (slug: string) => ["courseDetails", slug],
  // Add other query keys
};
