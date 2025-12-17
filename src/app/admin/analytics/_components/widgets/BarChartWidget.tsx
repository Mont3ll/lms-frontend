"use client";

import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

// Default color palette for chart bars
const DEFAULT_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

interface BarChartWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * A bar chart widget for categorical data visualization.
 * Supports both horizontal and vertical orientations, and stacked bars.
 */
export function BarChartWidget({ data, config, className }: BarChartWidgetProps) {
  const chartData = data as Record<string, unknown>[] | undefined;

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground h-full flex items-center justify-center", className)}>
        No data available
      </div>
    );
  }

  // Determine the keys to plot (exclude the x-axis key)
  const xAxisKey = config.xAxis || "name";
  const allKeys = Object.keys(chartData[0] || {});
  const dataKeys = allKeys.filter((key) => key !== xAxisKey);
  const colors = config.colors || DEFAULT_COLORS;
  const isHorizontal = config.orientation === "horizontal";
  const isStacked = config.stacked === true;

  return (
    <div className={cn("p-4 h-full min-h-[200px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 10, right: 10, left: isHorizontal ? 80 : -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          {isHorizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 600 }}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
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
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              stackId={isStacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartWidget;
