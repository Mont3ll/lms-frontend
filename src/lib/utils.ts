import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  } catch (e) {
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
  } catch (e) {
    return "Invalid Date";
  }
}
