"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssessments } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { AssessmentCard } from "@/components/features/assessments/AssessmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar, useFilterState, type FilterConfig } from "@/components/features/common/FilterBar";
import type { Assessment } from "@/lib/types";

// Filter configurations for assessments
const TYPE_FILTER_OPTIONS = [
  { label: "Quiz", value: "QUIZ" },
  { label: "Exam", value: "EXAM" },
  { label: "Assignment", value: "ASSIGNMENT" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Overdue", value: "overdue" },
  { label: "No Due Date", value: "no_due_date" },
];

// Helper function to determine assessment status from due date
const getAssessmentStatus = (dueDate: string | null | undefined): string => {
  if (!dueDate) return "no_due_date";
  const now = new Date();
  const due = new Date(dueDate);
  return due < now ? "overdue" : "upcoming";
};

export default function AssessmentsPage() {
  // Use the filter state hook
  const {
    searchValue,
    setSearchValue,
    activeFilters,
    handleFilterChange,
    handleClearAll,
  } = useFilterState({ type: "all", status: "all", course: "all" });
  
  const {
    data: assessmentData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, { enrolled: true }],
    queryFn: () => fetchAssessments({ enrolled: "true" }),
  });

  const assessments = useMemo(() => assessmentData?.results || [], [assessmentData?.results]);

  // Extract unique courses from assessments for the filter dropdown
  const courseOptions = useMemo(() => {
    const courses = new Map<string, string>();
    assessments.forEach((assessment) => {
      if (assessment.course_title && !courses.has(assessment.course)) {
        courses.set(assessment.course, assessment.course_title);
      }
    });
    return Array.from(courses.entries()).map(([id, title]) => ({ 
      label: title, 
      value: id 
    }));
  }, [assessments]);

  // Build filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        id: "type",
        label: "Type",
        options: TYPE_FILTER_OPTIONS,
        placeholder: "Filter by type",
      },
      {
        id: "status",
        label: "Status",
        options: STATUS_FILTER_OPTIONS,
        placeholder: "Filter by status",
      },
    ];
    
    // Only add course filter if there are multiple courses
    if (courseOptions.length > 1) {
      configs.push({
        id: "course",
        label: "Course",
        options: courseOptions,
        placeholder: "Filter by course",
      });
    }
    
    return configs;
  }, [courseOptions]);

  // Filter assessments based on search and filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment: Assessment) => {
      // Search filter
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        const matchesTitle = assessment.title.toLowerCase().includes(searchLower);
        const matchesCourse = assessment.course_title?.toLowerCase().includes(searchLower) || false;
        const matchesDescription = assessment.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesCourse && !matchesDescription) {
          return false;
        }
      }
      
      // Type filter
      if (activeFilters.type && activeFilters.type !== "all") {
        if (assessment.assessment_type !== activeFilters.type) {
          return false;
        }
      }
      
      // Status filter (based on due date)
      if (activeFilters.status && activeFilters.status !== "all") {
        const assessmentStatus = getAssessmentStatus(assessment.due_date);
        if (assessmentStatus !== activeFilters.status) {
          return false;
        }
      }
      
      // Course filter
      if (activeFilters.course && activeFilters.course !== "all") {
        if (assessment.course !== activeFilters.course) {
          return false;
        }
      }
      
      return true;
    });
  }, [assessments, searchValue, activeFilters]);

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
    ));

  if (isLoading) {
    return (
      <PageWrapper title="My Assessments" description="View and take assessments from your enrolled courses.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="My Assessments" description="View and take assessments from your enrolled courses.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            {error?.message || "Failed to load assessments. Please try again later."}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Assessments" description="View and take assessments from your enrolled courses.">
      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-2">
            No assessments found
          </p>
          <p className="text-sm text-muted-foreground">
            Start learning courses to access assessments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Bar */}
          <FilterBar
            searchPlaceholder="Search assessments..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
            resultCount={filteredAssessments.length}
            resultLabel="assessments"
          />

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">
                No assessments match your filters.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}