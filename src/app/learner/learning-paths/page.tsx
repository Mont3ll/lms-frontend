"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { 
  fetchLearningPaths, 
  fetchLearningPathProgress,
  createLearningPathProgress 
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BookOpen, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LearningPathProgressCard } from "@/components/features/learning-paths/LearningPathProgressCard";
import { toast } from "sonner";
import { FilterBar, useFilterState, type FilterConfig } from "@/components/features/common/FilterBar";
import type { LearningPath, LearningPathProgress } from "@/lib/types";

// Filter configurations for learning paths
const ENROLLMENT_FILTER_OPTIONS = [
  { label: "Enrolled", value: "enrolled" },
  { label: "Not Enrolled", value: "not_enrolled" },
];

const PROGRESS_FILTER_OPTIONS = [
  { label: "Not Started", value: "NOT_STARTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Paused", value: "PAUSED" },
];

export default function LearningPathsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // Use the filter state hook
  const {
    searchValue,
    setSearchValue,
    activeFilters,
    handleFilterChange,
    handleClearAll,
  } = useFilterState({ enrollment: "all", progress: "all" });

  const {
    data: pathsData,
    isLoading: isLoadingPaths,
    error: pathsError,
  } = useQuery({
    queryKey: QUERY_KEYS.LEARNING_PATHS,
    queryFn: () => fetchLearningPaths({ status: "PUBLISHED" }),
  });

  const {
    data: progressData,
    isLoading: isLoadingProgress,
  } = useQuery({
    queryKey: ['learningPathProgress'],
    queryFn: () => fetchLearningPathProgress(),
  });

  // Create progress mutation
  const createProgressMutation = useMutation({
    mutationFn: (learningPathId: string) => createLearningPathProgress(learningPathId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learningPathProgress'] });
      toast.success("Successfully enrolled in learning path!");
      // Redirect to the learning path detail page
      router.push(`/learner/learning-paths/${data.learning_path_slug}`);
    },
    onError: () => {
      toast.error("Failed to enroll in learning path. Please try again.");
    },
  });

  const handleEnroll = (pathId: string) => {
    createProgressMutation.mutate(pathId);
  };

  const isLoading = isLoadingPaths || isLoadingProgress;

  // Create a map of learning path progress by learning path ID
  const progressMap = useMemo(() => {
    const map = new Map<string, LearningPathProgress>();
    progressData?.results?.forEach((progress: LearningPathProgress) => {
      map.set(progress.learning_path, progress);
    });
    return map;
  }, [progressData?.results]);

  // Build filter configurations
  const filterConfigs: FilterConfig[] = useMemo(() => {
    return [
      {
        id: "enrollment",
        label: "Enrollment",
        options: ENROLLMENT_FILTER_OPTIONS,
        placeholder: "Filter by enrollment",
      },
      {
        id: "progress",
        label: "Progress",
        options: PROGRESS_FILTER_OPTIONS,
        placeholder: "Filter by progress",
      },
    ];
  }, []);

  // Filter learning paths based on search and filters
  const filteredPaths = useMemo(() => {
    const paths = pathsData?.results || [];
    
    return paths.filter((path: LearningPath) => {
      const progress = progressMap.get(path.id);
      const isEnrolled = !!progress;
      
      // Search filter
      if (searchValue.trim()) {
        const searchLower = searchValue.toLowerCase();
        const matchesTitle = path.title.toLowerCase().includes(searchLower);
        const matchesDescription = path.description?.toLowerCase().includes(searchLower) || false;
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }
      
      // Enrollment filter
      if (activeFilters.enrollment && activeFilters.enrollment !== "all") {
        if (activeFilters.enrollment === "enrolled" && !isEnrolled) {
          return false;
        }
        if (activeFilters.enrollment === "not_enrolled" && isEnrolled) {
          return false;
        }
      }
      
      // Progress filter (only applies to enrolled paths)
      if (activeFilters.progress && activeFilters.progress !== "all") {
        // If not enrolled, they can't match progress filters
        if (!progress) {
          return false;
        }
        if (progress.status !== activeFilters.progress) {
          return false;
        }
      }
      
      return true;
    });
  }, [pathsData?.results, progressMap, searchValue, activeFilters]);

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="h-64 w-full" />
      </div>
    ));

  if (isLoading) {
    return (
      <PageWrapper title="Learning Paths" description="Explore curated sequences of courses to master specific skills.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {renderSkeletons()}
        </div>
      </PageWrapper>
    );
  }

  if (pathsError) {
    return (
      <PageWrapper title="Learning Paths" description="Explore curated sequences of courses to master specific skills.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Learning Paths</AlertTitle>
          <AlertDescription>
            Failed to load learning paths. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  const paths = pathsData?.results || [];

  return (
    <PageWrapper title="Learning Paths" description="Explore curated sequences of courses to master specific skills.">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <p className="text-muted-foreground">
              Discover curated sequences of courses designed to help you master specific skills and topics.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/learner/learning-paths/personalized">
                <Sparkles className="mr-2 h-4 w-4" />
                My Personalized Paths
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/learner/learning-paths/generate">
                <Target className="mr-2 h-4 w-4" />
                Generate Path
              </Link>
            </Button>
          </div>
        </div>

        {paths.length > 0 ? (
          <div className="space-y-4">
            {/* Filter Bar */}
            <FilterBar
              searchPlaceholder="Search learning paths..."
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              filters={filterConfigs}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              resultCount={filteredPaths.length}
              resultLabel="learning paths"
            />

            {filteredPaths.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                  No learning paths match your filters.
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPaths.map((path) => (
                  <LearningPathProgressCard 
                    key={path.id}
                    learningPath={path}
                    progress={progressMap.get(path.id)}
                    onEnroll={handleEnroll}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No learning paths are currently available.
            </p>
            <Button asChild variant="outline">
              <Link href="/learner/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
