"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { CourseList } from "@/components/features/courses/CourseList"; // Reuse CourseList
import { fetchCourses } from "@/lib/api"; // API function
import { QUERY_KEYS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For filtering
import { useDebounce } from "@/hooks/useDebounce"; // Debounce search input

export default function CourseCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // Example filter
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce search input

  // TODO: Add pagination state if needed
  // const [page, setPage] = useState(1);

  // Fetch published courses, applying filters
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.COURSES, // Base key
      {
        published: true,
        search: debouncedSearchTerm,
        category: categoryFilter /*, page: page */,
      }, // Dependent keys
    ],
    queryFn: () =>
      fetchCourses({
        status: "PUBLISHED",
        search: debouncedSearchTerm,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        // page: page,
        // limit: 12, // Example limit
      }),
    placeholderData: (prevData) => prevData, // Keep previous data while loading new filter results
    staleTime: 1000 * 30, // Cache catalog results for 30 seconds
  });

  // TODO: Fetch categories for filter dropdown
  const categories = ["Web Development", "Data Science", "Marketing", "Design"]; // Placeholder

  return (
    <PageWrapper title="Course Catalog">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course List */}
      <CourseList
        courses={coursesData?.results}
        isLoading={isLoading}
        error={error}
      />

      {/* TODO: Add Pagination controls linked to state and API calls */}
      {/* <PaginationControls data={coursesData} onPageChange={setPage} currentPage={page}/> */}
    </PageWrapper>
  );
}
