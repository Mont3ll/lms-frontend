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
  | string; // Allow others

export interface Event {
  id: string;
  event_type: EventType;
  user?: { id: string; email: string } | null; // Basic user info
  user_id?: string | null;
  tenant?: { id: string; name: string } | null; // Basic tenant info
  tenant_id?: string | null;
  context_data?: Record<string, unknown> | null;
  session_id?: string | null;
  ip_address?: string | null;
  created_at: string; // Timestamp of the event
}

export interface Report {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
config?: Record<string, unknown> | null;
  tenant?: string | null; // Tenant ID (null for system reports)
  tenant_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  layout_config?: Record<string, unknown> | null; // Defines widgets and layout
  tenant: string; // Tenant ID
  tenant_name: string;
  created_at: string;
  updated_at: string;
}

// Type for the data returned by the report generation endpoint
export interface ReportData {
  report_slug: string;
  report_name: string;
  generated_at: string;
  filters_applied: Record<string, unknown>;
  data: unknown[]; // Array of data points, structure varies by report
  summary?: Record<string, unknown> | null; // Optional summary stats
}
