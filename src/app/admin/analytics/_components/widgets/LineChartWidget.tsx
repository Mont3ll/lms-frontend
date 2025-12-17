"use client";

import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

// Default color palette for chart lines
const DEFAULT_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface LineChartWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * A line chart widget for time-series data visualization.
 */
export function LineChartWidget({ data, config, className }: LineChartWidgetProps) {
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

  return (
    <div className={cn("p-4 h-full min-h-[200px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
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
              iconType="line"
              wrapperStyle={{ fontSize: "12px" }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChartWidget;
