"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { 
  fetchLearningPathDetails, 
  fetchLearningPathProgress,
  createLearningPathProgress,
  startLearningPath,
  completeLearningPathStep,
  resetLearningPathStep 
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, CheckCircle, Circle, Play, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { LearningPath, LearningPathStep as GlobalLearningPathStep, LearningPathProgress, LearningPathStepProgress } from "@/lib/types";

// Alias for cleaner code
type StepProgress = LearningPathStepProgress;
type UserProgress = LearningPathProgress;

const LearningPathStepItem = ({ 
  step, 
  stepProgress, 
  isFirst,
  onCompleteStep, 
  onResetStep 
}: { 
  step: GlobalLearningPathStep; 
  stepProgress: StepProgress | undefined;
  isFirst: boolean;
  onCompleteStep: (stepId: string) => void;
  onResetStep: (stepId: string) => void;
}) => {
  const isCompleted = stepProgress?.status === 'COMPLETED';
  const canStart = isFirst || stepProgress?.status !== 'NOT_STARTED';
  const contentObject = step.content_object?.data;
  
  return (
    <Card className={`transition-colors ${stepProgress?.status === 'IN_PROGRESS' ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : canStart ? (
            <Play className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                Step {step.order}: {contentObject?.title || `Step ${step.order}`}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {step.content_type_name}
              </Badge>
              {step.is_required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            {contentObject?.description && (
              <CardDescription className="mt-1">{contentObject.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {step.content_type_name === 'course' ? 'Course' : 'Module'}
            </span>
            {'estimated_duration' in contentObject && contentObject.estimated_duration && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {contentObject.estimated_duration}h
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {isCompleted ? (
              <>
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                  className="cursor-pointer"
                >
                  <Link href={`/learner/courses/${'slug' in contentObject ? contentObject.slug : ''}`}>
                    Review
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => onResetStep(step.id)}
                >
                  Reset
                </Button>
              </>
            ) : canStart ? (
              <>
                <Button 
                  asChild 
                  size="sm" 
                  variant="default"
                  className="cursor-pointer"
                >
                  <Link href={`/learner/courses/${'slug' in contentObject ? contentObject.slug : ''}`}>
                    Start
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onCompleteStep(step.id)}
                >
                  Mark Complete
                </Button>
              </>
            ) : (
              <Badge variant="secondary">Locked</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function LearningPathDetailPage() {
  const params = useParams();
  const pathSlug = params.pathSlug as string;
  const queryClient = useQueryClient();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  const {
    data: learningPath,
    isLoading: isLoadingPath,
    error: pathError,
  } = useQuery<LearningPath>({
    queryKey: QUERY_KEYS.LEARNING_PATH_DETAILS(pathSlug),
    queryFn: () => fetchLearningPathDetails(pathSlug),
    enabled: !!pathSlug,
  });

  // First, try to fetch existing progress
  const {
    data: progressList,
    isLoading: isLoadingProgress,
  } = useQuery({
    queryKey: ['learningPathProgress', pathSlug],
    queryFn: () => fetchLearningPathProgress({ learning_path__slug: pathSlug }),
    enabled: !!pathSlug,
  });

  // Create progress if none exists
  const createProgressMutation = useMutation({
    mutationFn: (learningPathId: string) => createLearningPathProgress(learningPathId),
    onSuccess: (data) => {
      setUserProgress(data);
      queryClient.invalidateQueries({ queryKey: ['learningPathProgress'] });
    },
  });

  // Start learning path
  const startPathMutation = useMutation({
    mutationFn: (progressId: string) => startLearningPath(progressId),
    onSuccess: (data) => {
      setUserProgress(data);
      toast.success("Learning path started!");
    },
  });

  // Complete step
  const completeStepMutation = useMutation({
    mutationFn: ({ progressId, stepId }: { progressId: string; stepId: string }) => 
      completeLearningPathStep(progressId, stepId),
    onSuccess: (data) => {
      setUserProgress(data);
      toast.success("Step completed!");
    },
  });

  // Reset step
  const resetStepMutation = useMutation({
    mutationFn: ({ progressId, stepId }: { progressId: string; stepId: string }) => 
      resetLearningPathStep(progressId, stepId),
    onSuccess: (data) => {
      setUserProgress(data);
      toast.success("Step reset!");
    },
  });

  // Set user progress from the fetched data
  React.useEffect(() => {
    if (progressList && progressList.results && progressList.results.length > 0) {
      setUserProgress(progressList.results[0]);
    }
  }, [progressList]);

  const handleCreateProgress = () => {
    if (learningPath?.id) {
      createProgressMutation.mutate(learningPath.id);
    }
  };

  const handleStartPath = () => {
    if (userProgress?.id) {
      startPathMutation.mutate(userProgress.id);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    if (userProgress?.id) {
      completeStepMutation.mutate({ progressId: userProgress.id, stepId });
    }
  };

  const handleResetStep = (stepId: string) => {
    if (userProgress?.id) {
      resetStepMutation.mutate({ progressId: userProgress.id, stepId });
    }
  };

  const isLoading = isLoadingPath || isLoadingProgress;

  if (isLoading) {
    return (
      <PageWrapper title="Loading...">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (pathError || !learningPath) {
    return (
      <PageWrapper title="Learning Path Not Found">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Learning Path</AlertTitle>
          <AlertDescription>
            Failed to load learning path details. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={learningPath.title}>
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>{learningPath.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!userProgress ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Ready to start your learning journey?</p>
                  <Button onClick={handleCreateProgress} disabled={createProgressMutation.isPending} className="cursor-pointer">
                    {createProgressMutation.isPending ? "Creating..." : "Enroll in Learning Path"}
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(userProgress.progress_percentage)}% Complete</span>
                    </div>
                    <Progress value={userProgress.progress_percentage} />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{userProgress.step_progress?.filter((sp) => sp.status === 'COMPLETED').length || 0} of {userProgress.total_steps} steps completed</span>
                      <Badge variant={
                        userProgress.status === 'COMPLETED' ? 'default' : 
                        userProgress.status === 'IN_PROGRESS' ? 'secondary' : 
                        'outline'
                      }>
                        {userProgress.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {userProgress.status === 'NOT_STARTED' && (
                      <Button onClick={handleStartPath} disabled={startPathMutation.isPending} className="cursor-pointer">
                        {startPathMutation.isPending ? "Starting..." : "Start Learning Path"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Path Steps */}
        {userProgress && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Learning Path Steps</h3>
            {learningPath.steps?.map((step, index) => {
              const stepProgress = userProgress.step_progress?.find((sp) => sp.step === step.id);
              
              return (
                <LearningPathStepItem
                  key={step.id}
                  step={step}
                  stepProgress={stepProgress}
                  isFirst={index === 0}
                  onCompleteStep={handleCompleteStep}
                  onResetStep={handleResetStep}
                />
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
