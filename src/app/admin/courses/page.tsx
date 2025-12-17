"use client";
import React from "react";
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { DataTable, FilterConfig } from "@/components/features/common/DataTable";
import { fetchAllPlatformCourses } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Row } from "@tanstack/react-table";

interface CourseRow {
  title: string;
  tenant_name: string;
  instructor: { full_name: string };
  status: string;
  created_at: string;
}

const courseFilters: FilterConfig[] = [
  {
    columnId: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "DRAFT" },
      { label: "Published", value: "PUBLISHED" },
      { label: "Archived", value: "ARCHIVED" },
    ],
  },
];

// Define admin-specific columns for courses
const adminCourseColumns = [
  {
    accessorKey: "title",
    header: "Course Title",
  },
  {
    accessorKey: "tenant_name",
    header: "Tenant",
  },
  {
    accessorKey: "instructor.full_name",
    header: "Instructor",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: { row: Row<CourseRow> }) => {
      return new Date(row.getValue("created_at")).toLocaleDateString();
    },
  },
];

export default function AdminManageCoursesPage() {
  const {
    data: coursesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_COURSES],
    queryFn: () => fetchAllPlatformCourses(),
  });

  const tableData = (coursesData?.results || []) as unknown as CourseRow[];

  if (isLoading) {
    return (
      <PageWrapper title="Platform Courses">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="Platform Courses">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Courses</AlertTitle>
          <AlertDescription>
            Failed to load courses. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Platform Courses"
      description="View and manage all courses across the platform, including status and instructor assignments."
    >
      <DataTable 
        columns={adminCourseColumns} 
        data={tableData} 
        filterColumnId="title"
        filterInputPlaceholder="Search by course title..."
        filters={courseFilters}
      />
    </PageWrapper>
  );
}
