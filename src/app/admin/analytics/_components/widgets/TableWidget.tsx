"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

interface TableWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

/**
 * A table widget for displaying tabular data.
 * Supports sorting and pagination.
 */
export function TableWidget({ data, config, className }: TableWidgetProps) {
  const tableData = data as Record<string, unknown>[] | undefined;
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = config.pageSize || 10;
  const isPaginated = config.paginated !== false;
  const isSortable = config.sortable !== false;

  // Determine columns from data or config
  const columns = useMemo(() => {
    if (config.columns && config.columns.length > 0) {
      return config.columns;
    }
    if (tableData && tableData.length > 0) {
      return Object.keys(tableData[0]);
    }
    return [];
  }, [config.columns, tableData]);

  // Sort the data
  const sortedData = useMemo(() => {
    if (!tableData || !sortColumn || !sortDirection) {
      return tableData || [];
    }

    return [...tableData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [tableData, sortColumn, sortDirection]);

  // Paginate the data
  const paginatedData = useMemo(() => {
    if (!isPaginated) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, isPaginated]);

  const totalPages = Math.ceil((sortedData?.length || 0) / pageSize);

  if (!tableData || tableData.length === 0) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground h-full flex items-center justify-center", className)}>
        No data available
      </div>
    );
  }

  const handleSort = (column: string) => {
    if (!isSortable) return;

    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const formatColumnName = (column: string) => {
    return column
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3 w-3 ml-1" />;
    }
    return <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className={cn(
                    "whitespace-nowrap",
                    isSortable && "cursor-pointer select-none hover:bg-muted/50"
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {formatColumnName(column)}
                    {isSortable && getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column} className="whitespace-nowrap">
                    {formatCellValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isPaginated && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableWidget;
