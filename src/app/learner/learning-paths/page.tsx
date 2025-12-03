"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { 
  fetchLearningPaths, 
  fetchLearningPathProgress,
  createLearningPathProgress 
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LearningPathProgressCard } from "@/components/features/learning-paths/LearningPathProgressCard";
import { toast } from "sonner";

interface LearningPathProgressItem {
  learning_path: string;
}

export default function LearningPathsPage() {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningPathProgress'] });
      toast.success("Successfully enrolled in learning path!");
    },
    onError: () => {
      toast.error("Failed to enroll in learning path. Please try again.");
    },
  });

  const handleEnroll = (pathId: string) => {
    createProgressMutation.mutate(pathId);
  };

  const isLoading = isLoadingPaths || isLoadingProgress;

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <Skeleton className="h-64 w-full" />
      </div>
    ));

  if (isLoading) {
    return (
      <PageWrapper title="Learning Paths">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {renderSkeletons()}
        </div>
      </PageWrapper>
    );
  }

  if (pathsError) {
    return (
      <PageWrapper title="Learning Paths">
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
  const progressMap = new Map();
  
  // Create a map of learning path progress by learning path ID
  progressData?.results?.forEach((progress: LearningPathProgressItem) => {
    progressMap.set(progress.learning_path, progress);
  });

  return (
    <PageWrapper title="Learning Paths">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <p className="text-muted-foreground">
            Discover curated sequences of courses designed to help you master specific skills and topics.
          </p>
        </div>

        {paths.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => (
              <LearningPathProgressCard 
                key={path.id}
                learningPath={path}
                progress={progressMap.get(path.id)}
                onEnroll={handleEnroll}
              />
            ))}
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
