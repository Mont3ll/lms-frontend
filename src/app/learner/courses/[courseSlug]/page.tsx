 "use client";

import React, { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCourseDetails,
  fetchEnrollmentStatus,
  fetchLearnerProgress,
  updateLearnerProgress,
  enrollInCourse,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Terminal, CheckCircle, Circle, Lock, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ContentItem, Course, LearnerProgress } from "@/lib/types";
import { ContentRenderer } from "@/components/features/courses/ContentRenderer";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type ProgressMap = Map<string, LearnerProgress>;

// --- Helper Components ---

const CourseOutline = ({
  course,
  progressMap,
  selectedItemId,
  onSelectItem,
  isEnrolled,
}: {
  course: Course;
  progressMap: ProgressMap;
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  isEnrolled: boolean;
}) => {
  const getIcon = (item: ContentItem) => {
    const status = progressMap.get(item.id)?.status;
    if (status === "COMPLETED") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (status === "IN_PROGRESS") {
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    }
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Accordion
      type="multiple"
      defaultValue={course.modules?.map((m) => m.id) ?? []}
      className="w-full"
    >
      {course.modules?.map((module) => (
        <AccordionItem key={module.id} value={module.id}>
          <AccordionTrigger className="font-semibold">
            {module.title}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {module.content_items?.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelectItem(item.id)}
                    disabled={!isEnrolled}
                    className={cn(
                      "w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors",
                      {
                        "bg-primary/10 text-primary": item.id === selectedItemId,
                        "hover:bg-muted": isEnrolled,
                        "cursor-not-allowed opacity-60": !isEnrolled,
                      }
                    )}
                  >
                    {isEnrolled ? getIcon(item) : <Lock className="h-5 w-5 text-muted-foreground" />}
                    <span className="flex-grow">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.content_type_display}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

const CoursePlayerSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-6">
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <Card className="p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-full mb-2" />
              <div className="pl-4 space-y-2">
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    <div className="flex-grow">
      <Card className="p-6">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-48 w-full" />
      </Card>
    </div>
  </div>
);


// --- Main Page Component ---

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const courseSlug = params.courseSlug as string;
  const selectedItemId = searchParams.get("item");

  const {
    data: course,
    isLoading: isLoadingCourse,
    isError: isErrorCourse,
    error: courseError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COURSES, courseSlug],
    queryFn: () => fetchCourseDetails(courseSlug),
  });

  // Check enrollment status
  const { data: enrollmentStatus } = useQuery({
    queryKey: [QUERY_KEYS.ENROLLMENTS, courseSlug],
    queryFn: () => fetchEnrollmentStatus(courseSlug),
    enabled: !!courseSlug,
  });

  const isEnrolled = enrollmentStatus?.is_enrolled || false;
  const enrollmentId = enrollmentStatus?.enrollment_id;

  const { data: progress } = useQuery({
    queryKey: [QUERY_KEYS.LEARNER_PROGRESS, enrollmentId],
    queryFn: () => fetchLearnerProgress(enrollmentId!),
    enabled: isEnrolled && !!enrollmentId,
  });

  const progressMap = useMemo(() => {
    if (!progress) return new Map<string, LearnerProgress>();
    return new Map(progress.map((p) => [p.content_item.id, p]));
  }, [progress]);

  const overallProgress = useMemo(() => {
    if (!course || !progress || !course.modules) return 0;
    const totalItems = course.modules.reduce((acc, m) => acc + (m.content_items?.length ?? 0), 0);
    if (totalItems === 0) return 0;
    const completedItems = Array.from(progressMap.values()).filter(p => p.status === 'COMPLETED').length;
    return Math.round((completedItems / totalItems) * 100);
  }, [course, progressMap]);

  const { mutate: updateProgress } = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED"; preventAutoNav?: boolean }) =>
      updateLearnerProgress(enrollmentId!, itemId, { status }),
    onSuccess: (updatedProgress, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEARNER_PROGRESS, enrollmentId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENROLLMENTS, { courseId: course?.id }] });
      
      // Auto-navigate to next item when completing a lesson (but not when toggling to incomplete)
      if (!variables.preventAutoNav && variables.status === "COMPLETED") {
        const nextItem = findNextItem(course, updatedProgress.content_item.id);
        if (nextItem) {
          handleSelectItem(nextItem.id, true);
        }
      }
    },
  });

  // Enrollment mutation
  const { mutate: enrollMutation, isPending: isEnrolling } = useMutation({
    mutationFn: (courseSlug: string) => enrollInCourse(courseSlug),
    onSuccess: () => {
      // Refetch enrollment status and other related data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENROLLMENTS, courseSlug] });
      toast.success("Successfully enrolled in course!");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      console.error("Enrollment error:", error);
      toast.error(error.response?.data?.error || "Failed to enroll in course");
    },
  });

  const handleEnroll = () => {
    if (courseSlug) {
      enrollMutation(courseSlug);
    }
  };

  const findNextItem = (course: Course | undefined, currentItemId: string): ContentItem | undefined => {
    if (!course || !course.modules) return undefined;
    const allItems = course.modules.flatMap(m => m.content_items ?? []);
    const currentIndex = allItems.findIndex(item => item.id === currentItemId);
    if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
      return allItems[currentIndex + 1];
    }
    return undefined;
  };

  const handleSelectItem = (itemId: string, skipProgressUpdate = false) => {
    if (!isEnrolled) return;
    router.push(`/learner/courses/${courseSlug}?item=${itemId}`, { scroll: false });
    if (!skipProgressUpdate && progressMap.get(itemId)?.status !== 'COMPLETED') {
        updateProgress({ itemId, status: "IN_PROGRESS" });
    }
  };

  const handleCompleteItem = (itemId: string) => {
    updateProgress({ itemId, status: "COMPLETED" });
  };

  const handleToggleCompletion = async (itemId: string) => {
    const currentProgress = progressMap.get(itemId);
    const isCurrentlyCompleted = currentProgress?.status === 'COMPLETED';
    const newStatus = isCurrentlyCompleted ? 'NOT_STARTED' : 'COMPLETED';
    
    // Only prevent auto-navigation when marking as incomplete
    const preventAutoNav = isCurrentlyCompleted;
    
    return new Promise<void>((resolve, reject) => {
      updateProgress(
        { itemId, status: newStatus, preventAutoNav },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        }
      );
    });
  };

  const selectedItem = useMemo(() => {
    if (!course) return null;
    const allItems = course.modules?.flatMap((m) => m.content_items ?? []) ?? [];
    if (!selectedItemId && isEnrolled) {
      // Find first uncompleted item
      const firstUncompleted = allItems.find(item => progressMap.get(item.id)?.status !== 'COMPLETED');
      return firstUncompleted || allItems[0] || null;
    }
    return allItems.find((i) => i.id === selectedItemId) || null;
  }, [course, selectedItemId, progressMap, isEnrolled]);


  if (isLoadingCourse) {
    return (
      <PageWrapper title="Loading Course...">
        <CoursePlayerSkeleton />
      </PageWrapper>
    );
  }

  if (isErrorCourse) {
    return (
      <PageWrapper title="Error">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Course</AlertTitle>
          <AlertDescription>
            {courseError?.message || "There was a problem fetching the course details."}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  if (!course) {
    return (
      <PageWrapper title="Course Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">The requested course could not be found.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={course.title}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Fixed width for consistency */}
        <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <Card className="p-4 sticky top-24">
            <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
            {isEnrolled && (
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Progress</h3>
                    <Progress value={overallProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">{overallProgress}% Complete</p>
                </div>
            )}
            <CourseOutline
              course={course}
              progressMap={progressMap}
              selectedItemId={selectedItem?.id || null}
              onSelectItem={(id) => handleSelectItem(id)}
              isEnrolled={isEnrolled}
            />
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <Card>
            {selectedItem ? (
              <ContentRenderer
                key={selectedItem.id}
                item={selectedItem}
                onComplete={() => handleCompleteItem(selectedItem.id)}
                enrollmentId={enrollmentId || undefined}
                isCompleted={progressMap.get(selectedItem.id)?.status === 'COMPLETED'}
                onToggleComplete={() => handleToggleCompletion(selectedItem.id)}
              />
            ) : (
              <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">
                  {isEnrolled ? "Select a lesson to begin" : "Enroll to access content"}
                </h2>
                <p className="text-muted-foreground mt-2">
                    {isEnrolled 
                        ? "Choose a content item from the outline to start your learning journey."
                        : "You can browse the course outline, but you must be enrolled to view the content."
                    }
                </p>
                {!isEnrolled && (
                    <Button 
                      className="mt-4" 
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                    </Button>
                )}
              </div>
            )}
          </Card>
        </main>
      </div>
    </PageWrapper>
  );
}
