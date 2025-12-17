"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SkillGap, SkillCategory, SkillProficiencyLevel } from "@/lib/types";

/** Chart type options */
type ChartType = "bar" | "radar";

/** Props for the SkillGapChart component */
interface SkillGapChartProps {
  /** Array of skill gaps to visualize */
  skillGaps: SkillGap[];
  /** Chart type - bar chart or radar chart */
  chartType?: ChartType;
  /** Allow toggling between chart types */
  allowToggle?: boolean;
  /** Chart title */
  title?: string;
  /** Show skill category filters */
  showCategoryFilter?: boolean;
  /** Height of the chart in pixels */
  height?: number;
  /** Callback when a skill bar/point is clicked */
  onSkillClick?: (skillGap: SkillGap) => void;
  /** Additional class names */
  className?: string;
}

/** Proficiency level labels */
const PROFICIENCY_LABELS: Record<SkillProficiencyLevel, string> = {
  NOVICE: "Novice",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

/** Category colors for visual distinction */
const CATEGORY_COLORS: Record<SkillCategory, string> = {
  TECHNICAL: "#3b82f6", // blue
  SOFT: "#ec4899", // pink
  DOMAIN: "#8b5cf6", // purple
  LANGUAGE: "#22c55e", // green
  METHODOLOGY: "#f97316", // orange
  TOOL: "#06b6d4", // cyan
  OTHER: "#6b7280", // gray
};

/** Category labels */
const CATEGORY_LABELS: Record<SkillCategory, string> = {
  TECHNICAL: "Technical",
  SOFT: "Soft Skills",
  DOMAIN: "Domain",
  LANGUAGE: "Language",
  METHODOLOGY: "Methodology",
  TOOL: "Tools",
  OTHER: "Other",
};

/** Format chart data for bar chart */
const formatBarChartData = (skillGaps: SkillGap[]) => {
  return skillGaps.map((gap) => ({
    name: gap.skill_name,
    skillId: gap.skill_id,
    current: gap.current_score,
    target: gap.target_score,
    gap: gap.gap_size,
    category: gap.skill_category,
    currentLevel: gap.current_level,
    targetLevel: gap.target_level,
    fullData: gap,
  }));
};

/** Format chart data for radar chart */
const formatRadarChartData = (skillGaps: SkillGap[]) => {
  return skillGaps.map((gap) => ({
    skill: gap.skill_name.length > 15 
      ? gap.skill_name.substring(0, 12) + "..." 
      : gap.skill_name,
    fullName: gap.skill_name,
    skillId: gap.skill_id,
    current: gap.current_score,
    target: gap.target_score,
    category: gap.skill_category,
    fullData: gap,
  }));
};

/** Custom tooltip for bar chart */
const BarChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: ReturnType<typeof formatBarChartData>[0];
  }>;
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const categoryColor = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.OTHER;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-semibold text-sm mb-2">{label}</p>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
        <span className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[data.category]}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-medium">
            {data.current}% ({PROFICIENCY_LABELS[data.currentLevel]})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target:</span>
          <span className="font-medium">
            {data.target}% ({PROFICIENCY_LABELS[data.targetLevel]})
          </span>
        </div>
        <div className="flex justify-between border-t pt-1 mt-1">
          <span className="text-muted-foreground">Gap:</span>
          <span className="font-medium text-destructive">{data.gap} points</span>
        </div>
      </div>
    </div>
  );
};

/** Custom tooltip for radar chart */
const RadarChartTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: ReturnType<typeof formatRadarChartData>[0];
  }>;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const categoryColor = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.OTHER;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[180px]">
      <p className="font-semibold text-sm mb-2">{data.fullName}</p>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
        <span className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[data.category]}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Current:</span>
          <span className="font-medium text-blue-600">{data.current}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Target:</span>
          <span className="font-medium text-green-600">{data.target}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * SkillGapChart - Visualizes skill gaps comparing current vs target proficiency.
 *
 * Supports both bar chart (for detailed comparison) and radar chart (for overview).
 * Shows current proficiency, target proficiency, and the gap between them.
 */
export const SkillGapChart: React.FC<SkillGapChartProps> = ({
  skillGaps,
  chartType: initialChartType = "bar",
  allowToggle = true,
  title = "Skill Gap Analysis",
  showCategoryFilter = true,
  height = 400,
  onSkillClick,
  className,
}) => {
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [selectedCategories, setSelectedCategories] = useState<Set<SkillCategory>>(
    new Set()
  );

  // Get unique categories from skill gaps
  const availableCategories = useMemo(() => {
    const categories = new Set<SkillCategory>();
    skillGaps.forEach((gap) => categories.add(gap.skill_category));
    return Array.from(categories);
  }, [skillGaps]);

  // Filter skill gaps by selected categories
  const filteredSkillGaps = useMemo(() => {
    if (selectedCategories.size === 0) return skillGaps;
    return skillGaps.filter((gap) => selectedCategories.has(gap.skill_category));
  }, [skillGaps, selectedCategories]);

  // Prepare chart data
  const barData = useMemo(
    () => formatBarChartData(filteredSkillGaps),
    [filteredSkillGaps]
  );
  const radarData = useMemo(
    () => formatRadarChartData(filteredSkillGaps),
    [filteredSkillGaps]
  );

  // Toggle category filter
  const toggleCategory = (category: SkillCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories(new Set());
  };

  // Handle bar/point click
  const handleClick = (data: { fullData: SkillGap }) => {
    if (onSkillClick && data.fullData) {
      onSkillClick(data.fullData);
    }
  };

  if (skillGaps.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No skill gaps to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          {allowToggle && (
            <div className="flex gap-1">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                Bar Chart
              </Button>
              <Button
                variant={chartType === "radar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("radar")}
              >
                Radar Chart
              </Button>
            </div>
          )}
        </div>

        {/* Category filters */}
        {showCategoryFilter && availableCategories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-sm text-muted-foreground">Filter:</span>
            {availableCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.has(category) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedCategories.has(category)
                    ? ""
                    : "hover:bg-muted"
                )}
                style={{
                  backgroundColor: selectedCategories.has(category)
                    ? CATEGORY_COLORS[category]
                    : undefined,
                  borderColor: CATEGORY_COLORS[category],
                }}
                onClick={() => toggleCategory(category)}
              >
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
            {selectedCategories.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredSkillGaps.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No skills match the selected filters
          </div>
        ) : chartType === "bar" ? (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<BarChartTooltip />} />
              <Legend />
              <Bar
                dataKey="current"
                name="Current"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                onClick={(data) => handleClick(data)}
                cursor={onSkillClick ? "pointer" : undefined}
              />
              <Bar
                dataKey="target"
                name="Target"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
                onClick={(data) => handleClick(data)}
                cursor={onSkillClick ? "pointer" : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<RadarChartTooltip />} />
              <Legend />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {filteredSkillGaps.length}
            </p>
            <p className="text-xs text-muted-foreground">Skills with Gaps</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {Math.round(
                filteredSkillGaps.reduce((sum, gap) => sum + gap.current_score, 0) /
                  filteredSkillGaps.length
              )}%
            </p>
            <p className="text-xs text-muted-foreground">Avg. Current</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(
                filteredSkillGaps.reduce((sum, gap) => sum + gap.target_score, 0) /
                  filteredSkillGaps.length
              )}%
            </p>
            <p className="text-xs text-muted-foreground">Avg. Target</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">
              {Math.round(
                filteredSkillGaps.reduce((sum, gap) => sum + gap.gap_size, 0) /
                  filteredSkillGaps.length
              )}
            </p>
            <p className="text-xs text-muted-foreground">Avg. Gap</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * SkillGapSummaryCard - A compact card showing skill gap summary for a single skill.
 */
interface SkillGapSummaryCardProps {
  skillGap: SkillGap;
  onClick?: () => void;
  className?: string;
}

export const SkillGapSummaryCard: React.FC<SkillGapSummaryCardProps> = ({
  skillGap,
  onClick,
  className,
}) => {
  const categoryColor = CATEGORY_COLORS[skillGap.skill_category] || CATEGORY_COLORS.OTHER;

  return (
    <Card
      className={cn(
        "w-full transition-colors",
        onClick && "cursor-pointer hover:bg-muted/50",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-sm">{skillGap.skill_name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[skillGap.skill_category]}
              </span>
            </div>
          </div>
          <Badge variant="destructive" className="text-xs">
            Gap: {skillGap.gap_size}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
            style={{ width: `${skillGap.current_score}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 border-r-2 border-green-500"
            style={{ width: `${skillGap.target_score}%` }}
          />
        </div>

        {/* Levels */}
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Current: <span className="text-blue-600 font-medium">
              {PROFICIENCY_LABELS[skillGap.current_level]}
            </span>
          </span>
          <span className="text-muted-foreground">
            Target: <span className="text-green-600 font-medium">
              {PROFICIENCY_LABELS[skillGap.target_level]}
            </span>
          </span>
        </div>

        {/* Recommended modules count */}
        {skillGap.recommended_modules.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {skillGap.recommended_modules.length} module
            {skillGap.recommended_modules.length !== 1 ? "s" : ""} recommended
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * SkillGapList - A list view of skill gaps with summary cards.
 */
interface SkillGapListProps {
  skillGaps: SkillGap[];
  onSkillClick?: (skillGap: SkillGap) => void;
  maxDisplay?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export const SkillGapList: React.FC<SkillGapListProps> = ({
  skillGaps,
  onSkillClick,
  maxDisplay,
  showViewAll = false,
  onViewAll,
  className,
}) => {
  const displayedGaps = maxDisplay ? skillGaps.slice(0, maxDisplay) : skillGaps;
  const remainingCount = maxDisplay ? skillGaps.length - maxDisplay : 0;

  if (skillGaps.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        No skill gaps to display
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayedGaps.map((gap) => (
        <SkillGapSummaryCard
          key={gap.skill_id}
          skillGap={gap}
          onClick={onSkillClick ? () => onSkillClick(gap) : undefined}
        />
      ))}
      {showViewAll && remainingCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onViewAll}
        >
          View {remainingCount} more skill gap{remainingCount !== 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
};

export default SkillGapChart;
