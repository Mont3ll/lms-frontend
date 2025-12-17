"use client";

import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

// Default color palette for chart areas
const DEFAULT_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface AreaChartWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * An area chart widget for time-series data with filled areas.
 * Supports stacked areas and gradient fills.
 */
export function AreaChartWidget({ data, config, className }: AreaChartWidgetProps) {
  const chartData = data as Record<string, unknown>[] | undefined;

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground h-full flex items-center justify-center", className)}>
        No data available
      </div>
    );
  }

  // Determine the keys to plot (exclude the x-axis key)
  const xAxisKey = config.xAxis || "date";
  const allKeys = Object.keys(chartData[0] || {});
  const dataKeys = allKeys.filter((key) => key !== xAxisKey);
  const colors = config.colors || DEFAULT_COLORS;
  const isStacked = config.stacked === true;
  const useGradient = config.gradient !== false;

  return (
    <div className={cn("p-4 h-full min-h-[200px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient
                key={`gradient-${key}`}
                id={`gradient-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          {config.showLegend !== false && dataKeys.length > 1 && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="rect"
              wrapperStyle={{ fontSize: "12px" }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={useGradient ? `url(#gradient-${key})` : colors[index % colors.length]}
              fillOpacity={useGradient ? 1 : 0.3}
              stackId={isStacked ? "stack" : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartWidget;
