// Mirror choices from backend model
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
  | string; // Allow others

export type NotificationStatus =
  | "PENDING"
  | "SENT"
  | "FAILED"
  | "READ"
  | "DISMISSED";

export type DeliveryMethod = "EMAIL" | "IN_APP" | "PUSH" | "SMS";

export interface Notification {
  id: string;
  recipient: string; // User ID
  recipient_email: string; // Denormalized email
  notification_type: NotificationType;
  notification_type_display: string;
  status: NotificationStatus;
  status_display: string;
  subject?: string | null;
  message: string;
  action_url?: string | null;
  sent_at?: string | null;
  read_at?: string | null;
  created_at: string;
  // Add related object info if included in API response
  // related_object?: { type: string; id: string; title?: string };
}

export interface NotificationPreference {
  id: string;
  user: string; // User ID
  is_enabled: boolean;
  preferences: {
    [typeKey in NotificationType]?: {
      // Use NotificationType as key index signature
      [methodKey in DeliveryMethod]?: boolean;
    };
  };
  updated_at: string;
}
