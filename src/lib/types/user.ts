export interface UserProfile {
  id: string;
  avatar?: string | null; // URL to avatar image
  bio?: string | null;
  language?: string;
  timezone?: string;
  preferences?: Record<string, any>; // Or define more strictly
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: "ADMIN" | "INSTRUCTOR" | "LEARNER"; // Use roles defined in backend
  status: "ACTIVE" | "INVITED" | "SUSPENDED" | "DELETED";
  profile?: UserProfile | null; // Profile might be optional or fetched separately
  tenant?: string; // Tenant ID (UUID)
  is_active: boolean;
  is_staff: boolean; // Django staff status (often indicates admin privileges)
  last_login?: string | null;
  date_joined: string;
}
