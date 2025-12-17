import { User } from "./user"; // Import related types

// Minimal type for links
interface MinimalContentItem {
  id: string;
  title: string;
  order: number;
  content_type: string; // Use backend choices e.g., 'TEXT', 'VIDEO', 'QUIZ'
  content_type_display: string;
  is_published: boolean;
  is_required?: boolean; // Whether this item is required for course completion
}

// Minimal type for links
interface MinimalModule {
  id: string;
  title: string;
  order: number;
  content_items: MinimalContentItem[];
}

export interface ContentItem extends MinimalContentItem {
  module: string; // Module ID
  text_content?: string | null;
  external_url?: string | null;
  file_id?: string | null; // Assuming file integration adds this
  assessment_id?: string | null; // Assuming assessment integration adds this
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Add progress status if fetched together?
  // progress_status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Module extends MinimalModule {
  description?: string | null;
  course: string; // Course ID
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  tenant: string; // Tenant ID
  tenant_name: string;
  instructor?: User | null; // Nested instructor details
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  status_display: string;
  tags?: string[];
  modules: Module[]; // Nested modules list for detail view
  thumbnail_url?: string | null; // Add when file model integrated
  created_at: string;
  updated_at: string;
  // Add enrollment status / progress percentage if relevant for list view
  // enrollment_status?: string;
  // progress_percentage?: number;
}
