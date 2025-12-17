"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchCourses } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { FilterBar, useFilterState, type FilterConfig } from "@/components/features/common/FilterBar";
import type { Course } from "@/lib/types";

const PAGE_SIZE = 12;

// Filter configurations for My Courses page
const PROGRESS_FILTER_OPTIONS = [
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

// Helper function to determine progress status from percentage
const getProgressStatus = (progressPercentage: number | null | undefined): string => {
  if (progressPercentage === null || progressPercentage === undefined || progressPercentage === 0) {
    return "not_started";
  }
  if (progressPercentage >= 100) {
    return "completed";
  }
  return "in_progress";
};

export default function MyCoursesPage() {
  const [page, setPage] = useState(1);
  
  // Use the filter state hook
  const {
    searchValue,
    setSearchValue,
    activeFilters,
    handleFilterChange,
    handleClearAll,
  } = useFilterState({ progress: "all", category: "all" });

  const {
    data: courseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COURSES, { is_enrolled: true, page }],
    queryFn: () => fetchCourses({ is_enrolled: true, page, page_size: PAGE_SIZE }),
    placeholderData: (prevData) => prevData,
  });

  // Extract unique categories from courses for the filter dropdown
  const categoryOptions = useMemo(() => {
    if (!courseData?.results) return [];
    const categories = new Set<string>();
    courseData.results.forEach((course) => {
      if (course.category) {
        categories.add(course.category);
      }
    });
    return Array.from(categories).map((cat) => ({ label: cat, value: cat }));
  }, [courseData?.results]);

  // Build filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        id: "progress",
        label: "Progress",
        options: PROGRESS_FILTER_OPTIONS,
        placeholder: "Filter by progress",
      },
    ];
    
    // Only add category filter if there are categories
    if (categoryOptions.length > 0) {
      configs.push({
        id: "category",
        label: "Category",
        options: categoryOptions,
        placeholder: "Filter by category",
      });
    }
    
    return configs;
  }, [categoryOptions]);

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    if (!courseData?.results) return [];
    
    return courseData.results.filter((course: Course) => {
      // Search filter
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(searchLower);
        const matchesDescription = course.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }
      
      // Progress filter
      if (activeFilters.progress && activeFilters.progress !== "all") {
        const courseProgress = getProgressStatus(course.progress_percentage);
        if (courseProgress !== activeFilters.progress) {
          return false;
        }
      }
      
      // Category filter
      if (activeFilters.category && activeFilters.category !== "all") {
        if (course.category !== activeFilters.category) {
          return false;
        }
      }
      
      return true;
    });
  }, [courseData?.results, searchValue, activeFilters]);

  const totalPages = courseData ? Math.ceil(courseData.count / PAGE_SIZE) : 1;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    ));

  if (isLoading) {
    return (
      <PageWrapper title="My Learning" description="Continue your learning journey with your enrolled courses.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="My Learning" description="Continue your learning journey with your enrolled courses.">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Courses</AlertTitle>
          <AlertDescription>
            There was a problem fetching your courses. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  if (courseData?.results?.length === 0) {
    return (
      <PageWrapper title="My Learning" description="Continue your learning journey with your enrolled courses.">
        <div className="text-center py-10">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            You are not enrolled in any courses yet.
          </p>
          <Button asChild>
            <Link href="/learner/catalog">Browse Courses</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Learning" description="Continue your learning journey with your enrolled courses.">
      <div className="space-y-4">
        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search courses..."
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={filterConfigs}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAll}
          resultCount={filteredCourses.length}
          resultLabel="courses"
        />

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              No courses match your filters.
            </p>
            <Button
              variant="link"
              onClick={handleClearAll}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {courseData && courseData.count > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, courseData.count)} of {courseData.count} courses
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
          </>
        )}
      </div>
    </PageWrapper>
  );
}
