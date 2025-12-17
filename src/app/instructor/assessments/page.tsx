"use client";
import React from "react";
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from "@tanstack/react-table";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { DataTable, FilterConfig } from "@/components/features/common/DataTable";
import { fetchInstructorAssessments } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface InstructorAssessment {
  id: string;
  title: string;
  course_title: string;
  assessment_type: string;
  total_points: number;
  attempts_count?: number;
  created_at: string;
}

const assessmentFilters: FilterConfig[] = [
  {
    columnId: "assessment_type",
    label: "Type",
    options: [
      { label: "Quiz", value: "QUIZ" },
      { label: "Exam", value: "EXAM" },
      { label: "Assignment", value: "ASSIGNMENT" },
    ],
  },
];

// Define columns for instructor assessments
const assessmentColumns: ColumnDef<InstructorAssessment>[] = [
  {
    accessorKey: "title",
    header: "Assessment Title",
  },
  {
    accessorKey: "course_title",
    header: "Course",
  },
  {
    accessorKey: "assessment_type",
    header: "Type",
  },
  {
    accessorKey: "total_points",
    header: "Points",
  },
  {
    accessorKey: "attempts_count",
    header: "Attempts",
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
      const assessment = row.original;
      return (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/instructor/assessments/${assessment.id}/edit`}>
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/instructor/assessments/${assessment.id}/results`}>
              Results
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export default function InstructorAssessmentsPage() {
  const {
    data: assessmentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_ASSESSMENTS],
    queryFn: () => fetchInstructorAssessments(),
  });

  const tableData = (assessmentsData?.results || []) as InstructorAssessment[];

  if (isLoading) {
    return (
      <PageWrapper title="Manage Assessments" description="Create quizzes, exams, and assignments for your courses. Review results and grade submissions.">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="Manage Assessments" description="Create quizzes, exams, and assignments for your courses. Review results and grade submissions.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Assessments</AlertTitle>
          <AlertDescription>
            Failed to load your assessments. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Manage Assessments"
      description="Create quizzes, exams, and assignments for your courses. Review results and grade submissions."
      actions={
        <Button asChild>
          <Link href="/instructor/assessments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Assessment
          </Link>
        </Button>
      }
    >
      <DataTable 
        columns={assessmentColumns} 
        data={tableData} 
        filterColumnId="title"
        filterInputPlaceholder="Search by assessment title..."
        filters={assessmentFilters}
      />
    </PageWrapper>
  );
}