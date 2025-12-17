"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

interface StatCardData {
  value: number | string;
  label?: string;
  trend?: number;
  trendLabel?: string;
  previousValue?: number;
}

interface StatCardWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * Formats a number based on the format type.
 */
function formatValue(value: number | string, format?: string): string {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case "percentage":
      return `${value.toFixed(1)}%`;

    case "number":
    default:
      return new Intl.NumberFormat("en-US", {
        notation: value >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
      }).format(value);
  }
}

/**
 * A stat card widget displaying a single KPI with optional trend indicator.
 */
export function StatCardWidget({ data, config, className }: StatCardWidgetProps) {
  const statData = data as StatCardData | undefined;

  if (!statData) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground", className)}>
        No data available
      </div>
    );
  }

  const { value, label, trend, trendLabel } = statData;
  const formattedValue = formatValue(value, config.format);

  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) return <TrendingUp className="h-4 w-4" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return "";
    if (trend > 0) return "text-green-600 dark:text-green-400";
    if (trend < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("p-6 flex flex-col justify-center h-full", className)}>
      {label && (
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </p>
      )}

      <p className="text-3xl font-bold tracking-tight">{formattedValue}</p>

      {config.showTrend !== false && trend !== undefined && (
        <div className={cn("flex items-center gap-1 mt-2 text-sm", getTrendColor())}>
          {getTrendIcon()}
          <span className="font-medium">
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-muted-foreground ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCardWidget;
