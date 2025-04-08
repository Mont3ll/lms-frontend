// Define base types shared across the application

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  current_page: number;
  total_pages: number;
  page_size: number;
  results: T[];
}

// Re-export types from specific files
export * from "./user";
export * from "./course";
// export * from './assessment';
// ... etc.
