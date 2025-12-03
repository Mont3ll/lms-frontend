import { ContentItem, Course } from "./course";
import { User } from "./user";

export interface Enrollment {
  id: string;
  user: User;
  course: Course;
  enrolled_at: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  status_display: string;
  progress: number;
  completed_at: string | null;
  expires_at: string | null;
}

export interface LearnerProgress {
  id: string;
  enrollment: string; // ID
  content_item: ContentItem; // Nested object
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  started_at: string | null;
  completed_at: string | null;
  progress_details: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
