"use client";
import React, { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportViewer } from "@/app/admin/analytics/_components/ReportViewer";
import { fetchInstructorReports } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Report } from "@/lib/types/analytics";

export default function InstructorReportsPage() {
  const [selectedReportSlug, setSelectedReportSlug] = useState<string>("");
  
  const {
    data: reports,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.REPORT_DEFINITIONS, { instructor: true }],
    queryFn: () => fetchInstructorReports(), // Use the instructor-specific function
  });

  // Use all available reports since we don't have access_level field in the Report model
  const instructorReports = reports || [];

  if (isLoading) {
    return (
      <PageWrapper title="Course Reports">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="Course Reports">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Reports</AlertTitle>
          <AlertDescription>
            Failed to load available reports. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Course Reports">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Report</CardTitle>
            <CardDescription>
              Choose a report to view insights about your courses and students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedReportSlug} onValueChange={setSelectedReportSlug}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a report" />
              </SelectTrigger>
              <SelectContent>
                {instructorReports.map((report: Report) => (
                  <SelectItem key={report.id} value={report.slug}>
                    {report.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedReportSlug && (
          <Card>
            <CardHeader>
              <CardTitle>
                {instructorReports.find(r => r.slug === selectedReportSlug)?.name}
              </CardTitle>
              <CardDescription>
                {instructorReports.find(r => r.slug === selectedReportSlug)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportViewer 
                reportSlug={selectedReportSlug} 
                filters={{ instructor: 'me' }} // Pass instructor context
              />
            </CardContent>
          </Card>
        )}

        {instructorReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No reports are currently available for instructors.
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}