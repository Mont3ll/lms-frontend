import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts the tenant slug from the current hostname's subdomain,
 * or falls back to localStorage if no subdomain is detected.
 * 
 * Examples:
 * - "acme.lms.example.com" → "acme"
 * - "company.localhost" → "company"
 * - "localhost" → checks localStorage for "tenantSlug"
 * - "lms.example.com" → checks localStorage for "tenantSlug"
 * 
 * @returns The tenant slug or null if not available
 */
export function getTenantSlugFromSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;

  // Handle localhost specially - check for subdomain like "acme.localhost"
  if (hostname.endsWith(".localhost") || hostname.includes(".localhost:")) {
    const parts = hostname.split(".");
    if (parts.length >= 2 && parts[0] !== "www") {
      return parts[0];
    }
    // No subdomain found, fall back to localStorage
    return localStorage.getItem("tenantSlug");
  }

  // Handle IP addresses - no subdomain detection, use localStorage fallback
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return localStorage.getItem("tenantSlug");
  }

  // For regular domains, extract subdomain
  // e.g., "acme.lms.example.com" → "acme"
  // We assume the base domain has at least 2 parts (example.com or lms.example.com)
  const parts = hostname.split(".");
  
  // Need at least 3 parts for a subdomain (subdomain.domain.tld)
  // Or 4 parts for subdomain.subdomain.domain.tld
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Skip www as it's not a tenant subdomain
    if (subdomain !== "www") {
      return subdomain;
    }
  }

  // No subdomain found, fall back to localStorage
  return localStorage.getItem("tenantSlug");
}

/**
 * Sets the tenant slug in localStorage for fallback when subdomain is not available.
 * @param slug The tenant slug to store, or null to clear it
 */
export function setTenantSlug(slug: string | null): void {
  if (typeof window === "undefined") return;
  if (slug) {
    localStorage.setItem("tenantSlug", slug);
  } else {
    localStorage.removeItem("tenantSlug");
  }
}

/**
 * Clears the tenant slug from localStorage.
 */
export function clearTenantSlug(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tenantSlug");
}

// Add other general utility functions here
export function formatDate(
  dateString: string | Date | undefined | null,
): string {
  if (!dateString) return "N/A";
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "Invalid Date";
  }
}

export function formatDateTime(
  dateString: string | Date | undefined | null,
): string {
  if (!dateString) return "N/A";
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "Invalid Date";
  }
}
