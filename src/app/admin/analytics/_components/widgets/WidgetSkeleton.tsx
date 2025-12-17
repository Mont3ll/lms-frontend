"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { WidgetType } from "@/lib/types";

interface WidgetSkeletonProps {
  /** Widget type to render appropriate skeleton */
  widgetType: WidgetType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Loading skeleton for widgets that matches the expected content shape.
 */
export function WidgetSkeleton({ widgetType, className }: WidgetSkeletonProps) {
  const renderSkeleton = () => {
    switch (widgetType) {
      case "stat_card":
        return (
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        );

      case "line_chart":
      case "area_chart":
        return (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="h-[200px] flex items-end justify-around gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                />
              ))}
            </div>
          </div>
        );

      case "bar_chart":
        return (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="h-[200px] flex items-end justify-around gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full rounded-t"
                  style={{ height: `${Math.random() * 60 + 30}%` }}
                />
              ))}
            </div>
          </div>
        );

      case "pie_chart":
        return (
          <div className="p-4 flex flex-col items-center space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        );

      case "table":
        return (
          <div className="p-4 space-y-3">
            <div className="flex gap-4 pb-2 border-b">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-4">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        );

      case "progress_ring":
        return (
          <div className="p-4 flex flex-col items-center space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        );

      case "leaderboard":
        return (
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-24 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        );
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
}

export default WidgetSkeleton;
