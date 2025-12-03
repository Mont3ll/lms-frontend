export interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  tenant: string; // Tenant ID
  tenant_name: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  original_filename: string;
  file_url: string; // URL provided by API (potentially signed)
  download_url?: string; // Explicit temporary download URL (if generated client-side/on request)
  file_size?: number | null; // In bytes
  mime_type?: string | null;
  status:
    | "PENDING"
    | "UPLOADING"
    | "PROCESSING"
    | "AVAILABLE"
    | "ERROR"
    | "DELETED";
  error_message?: string | null;
  folder_id?: string | null;
  tenant: string; // Tenant ID
  tenant_name: string;
  uploaded_by_email?: string | null;
  metadata?: Record<string, unknown> | null;
  scan_result?: "CLEAN" | "INFECTED" | string | null; // Allow for other results
  created_at: string;
  updated_at: string;
}

// FileVersion might not be exposed directly via API, handle if needed
