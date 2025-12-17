"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseDetails, fetchEnrollmentStatus } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { DiscussionThreadView } from "@/components/features/discussions/DiscussionThreadView";
import { useAuth } from "@/hooks/useAuth";

export default function DiscussionThreadPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const threadId = params.threadId as string;
  const { user } = useAuth();

  const {
    data: course,
    isLoading: isLoadingCourse,
    isError: isErrorCourse,
    error: courseError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COURSES, courseSlug],
    queryFn: () => fetchCourseDetails(courseSlug),
  });

  const { data: enrollmentStatus, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: [QUERY_KEYS.ENROLLMENTS, courseSlug],
    queryFn: () => fetchEnrollmentStatus(courseSlug),
    enabled: !!courseSlug,
  });

  const isEnrolled = enrollmentStatus?.is_enrolled || false;
  const isInstructor = course?.instructor?.id === user?.id;

  if (isLoadingCourse || isLoadingEnrollment) {
    return (
      <PageWrapper
        title="Loading..."
        description="Loading discussion thread."
      >
        <Card>
          <CardContent className="py-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (isErrorCourse) {
    return (
      <PageWrapper
        title="Error"
        description="There was a problem loading the course."
      >
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Course</AlertTitle>
          <AlertDescription>
            {courseError?.message ||
              "There was a problem fetching the course details."}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  if (!course) {
    return (
      <PageWrapper
        title="Course Not Found"
        description="The requested course could not be located."
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            The requested course could not be found.
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (!isEnrolled) {
    return (
      <PageWrapper
        title={`${course.title} - Discussion`}
        description="You must be enrolled to view discussions."
      >
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Enrollment Required
              </h2>
              <p className="text-muted-foreground">
                You must be enrolled in this course to view and participate in
                discussions.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`${course.title} - Discussion`}
      description="View and participate in the discussion."
    >
      <Card>
        <CardContent className="py-6">
          <DiscussionThreadView
            threadId={threadId}
            courseSlug={courseSlug}
            currentUserId={user?.id}
            isInstructor={isInstructor}
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
