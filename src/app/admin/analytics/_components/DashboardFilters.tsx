"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building2, Calendar } from "lucide-react";
import { fetchTenants } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { DashboardTimeRange, Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Time range options for the filter */
const TIME_RANGE_OPTIONS: { value: DashboardTimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" },
];

interface DashboardFiltersProps {
  /** Current selected time range */
  timeRange: DashboardTimeRange;
  /** Callback when time range changes */
  onTimeRangeChange: (timeRange: DashboardTimeRange) => void;
  /** Current selected tenant ID (optional, for super admins) */
  tenantId?: string;
  /** Callback when tenant selection changes */
  onTenantChange?: (tenantId: string | undefined) => void;
  /** Whether to show the tenant filter (default: true for super admins) */
  showTenantFilter?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DashboardFilters provides time range and tenant selection for dashboard viewing.
 * The tenant filter is typically only shown for super admins who can view data across tenants.
 */
export function DashboardFilters({
  timeRange,
  onTimeRangeChange,
  tenantId,
  onTenantChange,
  showTenantFilter = true,
  className,
}: DashboardFiltersProps) {
  // Fetch tenants for the tenant selector (only if showing tenant filter)
  const { data: tenantsData, isLoading: isLoadingTenants } = useQuery({
    queryKey: [QUERY_KEYS.TENANTS],
    queryFn: () => fetchTenants({ page_size: 100 }),
    enabled: showTenantFilter,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const tenants: Tenant[] = tenantsData?.results || [];

  const handleTenantChange = (value: string) => {
    onTenantChange?.(value === "all" ? undefined : value);
  };

  return (
    <div className={cn("flex items-center gap-4 flex-wrap", className)}>
      {/* Time Range Filter */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor="time-range"
          className="text-sm text-muted-foreground flex items-center gap-1"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Period</span>
        </Label>
        <Select
          value={timeRange}
          onValueChange={(value) => onTimeRangeChange(value as DashboardTimeRange)}
        >
          <SelectTrigger id="time-range" className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tenant Filter (for super admins) */}
      {showTenantFilter && onTenantChange && tenants.length > 0 && (
        <div className="flex items-center gap-2">
          <Label
            htmlFor="tenant-filter"
            className="text-sm text-muted-foreground flex items-center gap-1"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tenant</span>
          </Label>
          <Select
            value={tenantId || "all"}
            onValueChange={handleTenantChange}
            disabled={isLoadingTenants}
          >
            <SelectTrigger id="tenant-filter" className="w-[180px]">
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export default DashboardFilters;
