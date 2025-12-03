// Corresponds to backend apps/core/models.py Tenant model

// Optional: Define structure for domain if needed separately
// export interface TenantDomain {
//     id: string;
//     domain: string;
//     is_primary: boolean;
//     created_at: string;
// }

export interface Tenant {
  id: string; // UUID
  name: string;
  slug: string; // Unique identifier used in URLs/subdomains
  is_active: boolean;
  theme_config?: Record<string, unknown> | null; // JSON field for theme settings
  feature_flags?: Record<string, boolean> | null; // JSON field for features { "ai_enabled": true }
  created_at: string;
  updated_at: string;
  // Optional: Include list of domains if serialized together (less common for lists)
  // domains?: TenantDomain[];
  // Optional: Include simple list of domain names if provided by API
  domain_list?: string; // Example from admin list display
}
