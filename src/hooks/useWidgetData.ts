"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { fetchWidgetData } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import type { WidgetData, DashboardTimeRange } from "@/lib/types";

export interface UseWidgetDataParams {
  /** Widget ID to fetch data for */
  widgetId: string;
  /** Time range filter */
  timeRange?: DashboardTimeRange;
  /** Custom date range start (when timeRange is "custom") */
  startDate?: string;
  /** Custom date range end (when timeRange is "custom") */
  endDate?: string;
  /** Tenant ID filter for super admin views */
  tenantId?: string;
  /** Whether to enable the query */
  enabled?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
}

export interface UseWidgetDataResult {
  /** The widget data */
  data: WidgetData | undefined;
  /** Whether the data is currently loading */
  isLoading: boolean;
  /** Whether the initial load is in progress */
  isPending: boolean;
  /** Whether data is being refetched */
  isRefetching: boolean;
  /** Error if the query failed */
  error: Error | null;
  /** Whether the query resulted in an error */
  isError: boolean;
  /** Refetch function */
  refetch: () => Promise<unknown>;
}

/**
 * Hook for fetching widget data with caching and automatic refetching.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useWidgetData({
 *   widgetId: "widget-123",
 *   timeRange: "30d",
 *   refetchInterval: 60000, // Refresh every minute
 * });
 * ```
 */
export function useWidgetData({
  widgetId,
  timeRange = "30d",
  startDate,
  endDate,
  tenantId,
  enabled = true,
  refetchInterval,
}: UseWidgetDataParams): UseWidgetDataResult {
  const queryKey = QUERY_KEYS.WIDGET_DATA(widgetId, timeRange);

  const queryOptions: UseQueryOptions<WidgetData, Error> = {
    queryKey,
    queryFn: () =>
      fetchWidgetData(widgetId, {
        time_range: timeRange,
        start_date: startDate,
        end_date: endDate,
        tenant_id: tenantId,
      }),
    enabled: enabled && !!widgetId,
    staleTime: 1000 * 60 * 2, // Consider data stale after 2 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchInterval: refetchInterval,
    retry: 2,
  };

  const query = useQuery(queryOptions);

  return {
    data: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isRefetching: query.isRefetching,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export default useWidgetData;
