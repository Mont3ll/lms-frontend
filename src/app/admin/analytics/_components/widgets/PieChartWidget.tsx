"use client";

import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/lib/types";

// Default color palette for pie slices
const DEFAULT_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#ffc658",
  "#ff7300",
];

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartWidgetProps {
  data: unknown;
  config: WidgetConfig;
  className?: string;
}

/**
 * A pie/donut chart widget for distribution data visualization.
 */
export function PieChartWidget({ data, config, className }: PieChartWidgetProps) {
  const chartData = data as PieChartData[] | undefined;

  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className={cn("p-6 text-center text-muted-foreground h-full flex items-center justify-center", className)}>
        No data available
      </div>
    );
  }

  const colors = config.colors || DEFAULT_COLORS;
  const isDonut = config.donut === true;
  const showLabels = config.showLabels !== false;
  const showLegend = config.showLegend !== false;

  // Calculate total for percentage labels
  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  const renderLabel = (entry: { name: string; value: number; percent: number }) => {
    if (!showLabels) return null;
    return `${(entry.percent * 100).toFixed(0)}%`;
  };

  return (
    <div className={cn("p-4 h-full min-h-[200px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? "50%" : 0}
            outerRadius="80%"
            paddingAngle={2}
            label={showLabels ? renderLabel : false}
            labelLine={showLabels}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px" }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChartWidget;
