export interface UserGrowthDataPoint {
  month: string; // e.g., "Jan", "Feb" or "YYYY-MM"
  users: number;
}

export interface RecentSystemEvent {
  id: string; // Event ID
  type: string; // e.g., "TENANT_CREATED", "USER_REGISTERED"
  description: string; // e.g., "Tenant 'New Corp' was created"
  user_email?: string; // Email of the user who triggered the event
  timestamp: string; // ISO datetime string
}

export interface AdminDashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalCourses: number;
  activeUsersToday: number; // Or some other period
  userGrowth: UserGrowthDataPoint[];
  recentSystemEvents: RecentSystemEvent[];
  // Add other stats as needed
}
