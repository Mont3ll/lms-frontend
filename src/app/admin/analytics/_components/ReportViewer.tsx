import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReportData } from "@/lib/api"; // Assume API function
import { QUERY_KEYS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/features/common/DataTable"; // Use DataTable
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellContext } from "@tanstack/react-table";

interface ReportViewerProps {
  reportSlug: string;
  filters?: Record<string, string | number | boolean>; // Filters applied to the report
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  reportSlug,
  filters = {},
}) => {
  const {
    data: reportData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.REPORT_DATA, reportSlug, filters], // Include filters in key
    queryFn: () => fetchReportData(reportSlug, filters),
    enabled: !!reportSlug, // Only run if slug is provided
    staleTime: 1000 * 60 * 5, // Cache report data for 5 mins
  });

  // Dynamically generate columns based on data keys if possible, or define per report
  const columns = React.useMemo(() => {
    if (!reportData?.data || reportData.data.length === 0) return [];
    // Generate columns from the keys of the first data item
    return Object.keys(reportData.data[0]).map((key) => ({
      accessorKey: key,
      // Simple header: capitalize key
      header: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      // Basic cell rendering
      cell: ({ row }: CellContext<Record<string, unknown>, unknown>) => <span>{String(row.getValue(key))}</span>,
    }));
  }, [reportData]);

  const dataToDisplay = reportData?.data || [];

  const exportUrlBase = `/api/v1/analytics/reports/${reportSlug}/export`; // Adjust path if needed
  const filterParams = new URLSearchParams(filters as Record<string, string>).toString();
  const csvExportUrl = `${exportUrlBase}/csv/?${filterParams}`;
  const jsonExportUrl = `${exportUrlBase}/json/?${filterParams}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {reportData?.report_name ||
              reportSlug.replace(/-/g, " ") ||
              "Report"}
          </CardTitle>
          <CardDescription>
            Generated at:{" "}
            {reportData
              ? new Date(reportData.generated_at).toLocaleString()
              : "..."}
          </CardDescription>
          {/* Display applied filters? */}
        </div>
        {/* Export Buttons */}
        {reportData?.data && reportData.data.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={csvExportUrl} download>
                Export CSV
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={jsonExportUrl} download>
                Export JSON
              </a>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {isError && (
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Error loading report data.
          </div>
        )}
        {!isLoading &&
          !isError &&
          (dataToDisplay.length > 0 ? (
            <DataTable columns={columns} data={dataToDisplay} />
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No data available for this report and filters.
            </p>
          ))}
      </CardContent>
    </Card>
  );
};
