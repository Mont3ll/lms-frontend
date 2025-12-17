"use client";

import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

interface ProgressRingData {
  value: number;
  label?: string;
  target?: number;
}

interface ProgressRingWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * A circular progress ring widget for showing progress toward a goal.
 */
export function ProgressRingWidget({ data, config, className }: ProgressRingWidgetProps) {
  const progressData = data as ProgressRingData | undefined;

  if (!progressData) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground h-full flex items-center justify-center", className)}>
        No data available
      </div>
    );
  }

  const { value, label } = progressData;
  const target = config.target || progressData.target || 100;
  const percentage = Math.min(100, Math.max(0, (value / target) * 100));
  const color = config.color || "#0088FE";

  // SVG parameters
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("p-6 flex flex-col items-center justify-center h-full", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
        </div>
      </div>

      {/* Label and details */}
      <div className="mt-4 text-center">
        {label && (
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {value.toLocaleString()} / {target.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default ProgressRingWidget;
