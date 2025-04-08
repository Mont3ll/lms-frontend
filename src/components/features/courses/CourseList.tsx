import React from "react";
import { CourseCard } from "./CourseCard";
import { Course } from "@/lib/types"; // Import Course type
import { Skeleton } from "@/components/ui/skeleton";

interface CourseListProps {
  courses: Course[] | undefined;
  isLoading: boolean;
  error?: Error | null;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  isLoading,
  error,
}) => {
  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    ));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error loading courses.</p>; // Use Alert component?
  }

  if (!courses || courses.length === 0) {
    return <p className="text-muted-foreground">No courses found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          // Pass progress if available from the API list response
          // progress_percentage={course.progress_percentage}
        />
      ))}
    </div>
  );
};
