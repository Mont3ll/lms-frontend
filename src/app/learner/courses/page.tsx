"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/api"; // Assuming API function exists
import { QUERY_KEYS } from "@/lib/constants";
import { CourseCard } from "@/components/features/courses/CourseCard";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function MyCoursesPage() {
  // TODO: Add filters if needed (e.g., active, completed)
  const {
    data: courseData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COURSES, { enrolled: true }], // Fetch enrolled courses
    queryFn: () => fetchCourses({ enrolled: "true" }), // Adjust API call based on backend filter
    // Add placeholder data for better loading experience?
  });

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

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">My Learning</h1>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Courses</AlertTitle>
          <AlertDescription>
            There was a problem fetching your courses. Please try refreshing the
            page.
            {/* Error: {error?.message} */}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && courseData?.results?.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            You are not enrolled in any courses yet.
          </p>
          {/* TODO: Add link to course catalog */}
          {/* <Button asChild className="mt-4"><Link href="/catalog">Browse Courses</Link></Button> */}
        </div>
      )}

      {!isLoading &&
        !isError &&
        courseData?.results &&
        courseData.results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseData.results.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                // Assuming progress percentage comes from API list endpoint
                // progress_percentage={course.progress_percentage}
              />
            ))}
          </div>
        )}

      {/* TODO: Add Pagination controls if API response is paginated */}
      {/* <PaginationControls data={courseData} /> */}
    </div>
  );
}
