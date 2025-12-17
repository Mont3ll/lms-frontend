import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReportData } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/features/common/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CellContext } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

interface ReportViewerProps {
  reportSlug: string;
  filters?: Record<string, string | number | boolean>;
}

// Helper to format a label from snake_case or kebab-case
const formatLabel = (key: string): string =>
  key.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// Helper to render a value (handles primitives, arrays, objects)
const renderValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">N/A</span>;
  }
  if (typeof value === "boolean") {
    return value ? (
      <Badge variant="default">Yes</Badge>
    ) : (
      <Badge variant="secondary">No</Badge>
    );
  }
  if (typeof value === "number") {
    // Format numbers nicely
    if (Number.isInteger(value)) {
      return <span className="font-mono">{value.toLocaleString()}</span>;
    }
    return <span className="font-mono">{value.toFixed(2)}</span>;
  }
  if (typeof value === "string") {
    return <span>{value}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">None</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {value.slice(0, 5).map((item, idx) => (
          <li key={idx} className="text-sm">
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
          </li>
        ))}
        {value.length > 5 && (
          <li className="text-sm text-muted-foreground">
            ... and {value.length - 5} more
          </li>
        )}
      </ul>
    );
  }
  if (typeof value === "object") {
    // Nested object - render as sub-section
    return (
      <div className="pl-4 border-l-2 border-muted space-y-2">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {formatLabel(k)}
            </span>
            <div className="text-sm">{renderValue(v)}</div>
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
};

// Component to render dictionary/object data as a structured view
const DictDataViewer: React.FC<{ data: Record<string, unknown> }> = ({
  data,
}) => {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="border rounded-lg p-3 bg-muted/30"
        >
          <h4 className="font-medium text-sm mb-2">{formatLabel(key)}</h4>
          <div className="text-sm">{renderValue(value)}</div>
        </div>
      ))}
    </div>
  );
};

export const ReportViewer: React.FC<ReportViewerProps> = ({
  reportSlug,
  filters = {},
}) => {
  const {
    data: reportData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.REPORT_DATA, reportSlug, filters],
    queryFn: () => fetchReportData(reportSlug, filters),
    enabled: !!reportSlug,
    staleTime: 1000 * 60 * 5,
  });

  // Check if data is an array or a dictionary
  const isArrayData = Array.isArray(reportData?.data);
  const isDictData =
    reportData?.data &&
    typeof reportData.data === "object" &&
    !Array.isArray(reportData.data);

  // Dynamically generate columns for array data
  const columns = React.useMemo(() => {
    const data = reportData?.data;
    if (!Array.isArray(data) || data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: formatLabel(key),
      cell: ({ row }: CellContext<Record<string, unknown>, unknown>) => (
        <span>{String(row.getValue(key))}</span>
      ),
    }));
  }, [reportData]);

  const arrayDataToDisplay = Array.isArray(reportData?.data)
    ? reportData.data
    : [];

  const exportUrlBase = `/api/v1/analytics/reports/${reportSlug}/export`;
  const filterParams = new URLSearchParams(
    filters as Record<string, string>
  ).toString();
  const csvExportUrl = `${exportUrlBase}/csv/?${filterParams}`;
  const jsonExportUrl = `${exportUrlBase}/json/?${filterParams}`;

  // Determine if we have data to show export buttons
  const hasData = isArrayData
    ? arrayDataToDisplay.length > 0
    : isDictData && Object.keys(reportData?.data || {}).length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {reportData?.report_name ||
              formatLabel(reportSlug) ||
              "Report"}
          </CardTitle>
          <CardDescription>
            Generated at:{" "}
            {reportData
              ? new Date(reportData.generated_at).toLocaleString()
              : "..."}
          </CardDescription>
        </div>
        {hasData && (
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
        {!isLoading && !isError && (
          <>
            {isArrayData && arrayDataToDisplay.length > 0 && (
              <DataTable columns={columns} data={arrayDataToDisplay} />
            )}
            {isDictData && (
              <DictDataViewer
                data={reportData?.data as Record<string, unknown>}
              />
            )}
            {!isArrayData && !isDictData && (
              <p className="text-muted-foreground text-center py-4">
                No data available for this report and filters.
              </p>
            )}
            {isArrayData && arrayDataToDisplay.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No data available for this report and filters.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
