"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssessments } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { AssessmentCard } from "@/components/features/assessments/AssessmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function AssessmentsPage() {
  const {
    data: assessmentData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.ASSESSMENTS, { enrolled: true }],
    queryFn: () => fetchAssessments({ enrolled: "true" }),
  });

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
    ));

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Assessments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Assessments</h1>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            {error?.message || "Failed to load assessments. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const assessments = assessmentData?.results || [];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Assessments</h1>
      
      {assessments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No assessments found
          </p>
          <p className="text-sm text-muted-foreground">
            Start learning courses to access assessments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      )}
    </div>
  );
}