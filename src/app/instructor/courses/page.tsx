"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { fetchInstructorCourses } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { DataTable } from "@/components/features/common/DataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Course } from "@/lib/types";

// Define columns for instructor courses
const instructorCourseColumns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Course Title",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "enrollment_count",
    header: "Students",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/instructor/courses/${course.slug}/edit`}>Edit</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/instructor/courses/${course.slug}/modules`}>
              Modules
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export default function ManageCoursesPage() {
  const {
    data: coursesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COURSES, { instructor: "me" }],
    queryFn: () => fetchInstructorCourses(), // Use the instructor-specific function
  });

  const tableData = coursesData?.results || [];

  if (isLoading) {
    return (
      <PageWrapper title="Manage Courses">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="Manage Courses">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Courses</AlertTitle>
          <AlertDescription>
            Failed to load your courses. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Manage Courses"
      actions={
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      }
    >
      <DataTable columns={instructorCourseColumns} data={tableData} />
    </PageWrapper>
  );
}
