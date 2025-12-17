"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { CourseList } from "@/components/features/courses/CourseList";
import { fetchCourses } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterBar, useFilterState, type FilterConfig } from "@/components/features/common/FilterBar";

// Predefined categories for the catalog filter
const CATEGORY_OPTIONS = [
  { label: "Web Development", value: "Web Development" },
  { label: "Data Science", value: "Data Science" },
  { label: "Machine Learning", value: "Machine Learning" },
  { label: "Mobile Development", value: "Mobile Development" },
  { label: "Cloud Computing", value: "Cloud Computing" },
  { label: "DevOps", value: "DevOps" },
  { label: "Cybersecurity", value: "Cybersecurity" },
  { label: "Marketing", value: "Marketing" },
  { label: "Design", value: "Design" },
  { label: "Business", value: "Business" },
  { label: "Finance", value: "Finance" },
  { label: "Leadership", value: "Leadership" },
];

// Difficulty levels matching Course model
const DIFFICULTY_OPTIONS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

// Duration options (max hours)
const DURATION_OPTIONS = [
  { label: "Under 5 hours", value: "5" },
  { label: "Under 10 hours", value: "10" },
  { label: "Under 20 hours", value: "20" },
  { label: "Under 40 hours", value: "40" },
];

const PAGE_SIZE = 12;

// Filter configurations for Catalog page
const filterConfigs: FilterConfig[] = [
  {
    id: "category",
    label: "Category",
    options: CATEGORY_OPTIONS,
    placeholder: "Filter by category",
  },
  {
    id: "difficulty",
    label: "Difficulty",
    options: DIFFICULTY_OPTIONS,
    placeholder: "Filter by difficulty",
  },
  {
    id: "duration",
    label: "Duration",
    options: DURATION_OPTIONS,
    placeholder: "Filter by duration",
  },
];

export default function CourseCatalogPage() {
  const [page, setPage] = useState(1);
  
  // Use the filter state hook
  const {
    searchValue,
    setSearchValue,
    activeFilters,
    handleFilterChange,
    handleClearAll,
  } = useFilterState({ category: "all", difficulty: "all", duration: "all" });

  const debouncedSearchTerm = useDebounce(searchValue, 500);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleFilterChangeWithReset = (filterId: string, value: string) => {
    handleFilterChange(filterId, value);
    setPage(1);
  };

  const handleClearAllWithReset = () => {
    handleClearAll();
    setPage(1);
  };

  // Fetch published courses with filters and pagination
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.COURSES,
      {
        published: true,
        search: debouncedSearchTerm,
        category: activeFilters.category,
        difficulty_level: activeFilters.difficulty,
        max_duration: activeFilters.duration,
        page,
      },
    ],
    queryFn: () =>
      fetchCourses({
        status: "PUBLISHED",
        search: debouncedSearchTerm || undefined,
        category: activeFilters.category === "all" ? undefined : activeFilters.category || undefined,
        difficulty_level: activeFilters.difficulty === "all" ? undefined : activeFilters.difficulty || undefined,
        max_duration: activeFilters.duration === "all" ? undefined : activeFilters.duration ? parseInt(activeFilters.duration) : undefined,
        page,
        page_size: PAGE_SIZE,
      }),
    placeholderData: (prevData) => prevData,
    staleTime: 1000 * 30,
  });

  const totalPages = coursesData ? Math.ceil(coursesData.count / PAGE_SIZE) : 1;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return (
    <PageWrapper title="Course Catalog" description="Browse and discover courses available for enrollment.">
      <div className="space-y-4">
        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search courses..."
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filters={filterConfigs}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChangeWithReset}
          onClearAll={handleClearAllWithReset}
          resultCount={coursesData?.count}
          resultLabel="courses"
        />

        {/* Course List */}
        <CourseList
          courses={coursesData?.results}
          isLoading={isLoading}
          error={error}
        />

        {/* Pagination Controls */}
        {coursesData && coursesData.count > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, coursesData.count)} of {coursesData.count} courses
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPreviousPage || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
