"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { DataTable } from "@/components/features/common/DataTable";
import { fetchCourseEnrollments } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Enrollment } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

// Define columns for enrollments
const enrollmentColumns: ColumnDef<Enrollment>[] = [
  {
    accessorFn: (row) => `${row.user.first_name} ${row.user.last_name}`,
    id: "user_name",
    header: "Student Name",
  },
  {
    accessorKey: "user.email",
    header: "Email",
  },
  {
    accessorKey: "status_display",
    header: "Status",
  },
  {
    accessorKey: "enrolled_at",
    header: "Enrolled",
    cell: ({ row }) => {
      return new Date(row.getValue("enrolled_at")).toLocaleDateString();
    },
  },
  {
    accessorKey: "progress_percentage",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress_percentage") || 0;
      return `${progress}%`;
    },
  },
];

export default function ManageEnrollmentsPage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const [, setIsModalOpen] = useState(false);

  const {
    data: enrollmentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.COURSE_ENROLLMENTS(courseSlug),
    queryFn: () => fetchCourseEnrollments(courseSlug),
    enabled: !!courseSlug,
  });

  const tableData = enrollmentsData?.results || [];

  if (isLoading) {
    return (
      <PageWrapper title="Manage Enrollments">
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
      <PageWrapper title="Manage Enrollments">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Enrollments</AlertTitle>
          <AlertDescription>
            Failed to load course enrollments. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Manage Enrollments"
      actions={
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Enrollment
        </Button>
      }
    >
      <DataTable columns={enrollmentColumns} data={tableData} />
      {/* TODO: Add AddEnrollmentModal component */}
    </PageWrapper>
  );
}
