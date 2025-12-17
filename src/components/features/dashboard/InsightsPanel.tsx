"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchLearnerInsights,
  type LearnerInsights,
  type LearnerInsightRecommendation,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronRight,
  AlertCircle,
  Flame,
  BookOpen,
  Target,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Simple bar chart component for daily activity
const ActivityChart: React.FC<{
  data: { date: string; minutes_spent: number }[];
}> = ({ data }) => {
  const maxMinutes = Math.max(...data.map((d) => d.minutes_spent), 1);

  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((day, index) => {
        const height = (day.minutes_spent / maxMinutes) * 100;
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-full rounded-t transition-all",
                day.minutes_spent > 0 ? "bg-primary" : "bg-muted"
              )}
              style={{ height: `${Math.max(height, 4)}%` }}
              title={`${day.minutes_spent} min`}
            />
            <span className="text-[10px] text-muted-foreground">{dayName}</span>
          </div>
        );
      })}
    </div>
  );
};

// Score trend mini chart
const ScoreTrendChart: React.FC<{
  data: { date: string | null; score: number }[];
}> = ({ data }) => {
  if (data.length === 0) return null;

  const maxScore = 100;
  const minScore = 0;

  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((point, index) => {
        const height = ((point.score - minScore) / (maxScore - minScore)) * 100;

        return (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-t transition-all",
              point.score >= 70 ? "bg-green-500" : point.score >= 50 ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ height: `${Math.max(height, 8)}%` }}
            title={`${point.score}%`}
          />
        );
      })}
    </div>
  );
};

// Device usage display
const DeviceUsageDisplay: React.FC<{
  usage: { desktop: number; mobile: number; tablet: number };
}> = ({ usage }) => {
  const devices = [
    { name: "Desktop", value: usage.desktop, icon: Monitor },
    { name: "Mobile", value: usage.mobile, icon: Smartphone },
    { name: "Tablet", value: usage.tablet, icon: Tablet },
  ].filter((d) => d.value > 0);

  if (devices.length === 0) {
    return <p className="text-sm text-muted-foreground">No device data available</p>;
  }

  return (
    <div className="space-y-2">
      {devices.map((device) => (
        <div key={device.name} className="flex items-center gap-2">
          <device.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1">{device.name}</span>
          <div className="w-20">
            <Progress value={device.value} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground w-10 text-right">
            {device.value}%
          </span>
        </div>
      ))}
    </div>
  );
};

// Recommendation card
const RecommendationCard: React.FC<{
  recommendation: LearnerInsightRecommendation;
}> = ({ recommendation }) => {
  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-green-500",
  };

  const typeIcons = {
    engagement: Flame,
    completion: Target,
    reminder: Clock,
    improvement: TrendingUp,
    achievement: CheckCircle2,
  };

  const Icon = typeIcons[recommendation.type] || Lightbulb;

  return (
    <div
      className={cn(
        "border-l-4 bg-muted/50 rounded-r-md p-3",
        priorityColors[recommendation.priority]
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{recommendation.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {recommendation.description}
          </p>
          {recommendation.course_slug && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-1 text-xs"
              asChild
            >
              <Link href={`/learner/courses/${recommendation.course_slug}`}>
                Go to course
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton
const InsightsPanelSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-full mb-4" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const InsightsPanel: React.FC = () => {
  const {
    data: insights,
    isLoading,
    isError,
  } = useQuery<LearnerInsights>({
    queryKey: QUERY_KEYS.LEARNER_INSIGHTS,
    queryFn: fetchLearnerInsights,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  if (isLoading) {
    return <InsightsPanelSkeleton />;
  }

  if (isError || !insights) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Unable to load learning insights at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { learning_activity, assessment_performance, learning_patterns, recommendations } =
    insights;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Learning Insights
        </CardTitle>
        <CardDescription>
          Your personalized learning analytics and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              <Activity className="h-4 w-4 mr-1 hidden sm:inline" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1 hidden sm:inline" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs sm:text-sm">
              <Clock className="h-4 w-4 mr-1 hidden sm:inline" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm">
              <Lightbulb className="h-4 w-4 mr-1 hidden sm:inline" />
              Tips
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">This Week&apos;s Activity</h4>
                <Badge variant="secondary" className="text-xs">
                  {learning_activity.this_week_total_minutes} min total
                </Badge>
              </div>
              <ActivityChart data={learning_activity.daily_activity} />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Activity Breakdown (30 days)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-lg font-semibold">
                      {learning_activity.activity_breakdown.content_views}
                    </p>
                    <p className="text-xs text-muted-foreground">Content Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <Activity className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-lg font-semibold">
                      {learning_activity.activity_breakdown.video_watches}
                    </p>
                    <p className="text-xs text-muted-foreground">Videos Watched</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <Target className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-lg font-semibold">
                      {learning_activity.activity_breakdown.quiz_attempts}
                    </p>
                    <p className="text-xs text-muted-foreground">Quiz Attempts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-lg font-semibold">
                      {learning_activity.activity_breakdown.assessments_completed}
                    </p>
                    <p className="text-xs text-muted-foreground">Assessments Done</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <p className="text-2xl font-bold">
                  {assessment_performance.total_assessments_taken}
                </p>
                <p className="text-xs text-muted-foreground">Total Taken</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <p className="text-2xl font-bold text-green-600">
                  {assessment_performance.assessments_passed}
                </p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <p className="text-2xl font-bold">
                  {assessment_performance.average_score}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-md">
                <p className="text-2xl font-bold">
                  {assessment_performance.pass_rate}%
                </p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
            </div>

            {assessment_performance.score_trend.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Score Trend</h4>
                <ScoreTrendChart data={assessment_performance.score_trend} />
              </div>
            )}

            {assessment_performance.recent_results.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Results</h4>
                <div className="space-y-2">
                  {assessment_performance.recent_results.slice(0, 3).map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {result.is_passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {result.assessment_title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.course_title}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={result.is_passed ? "default" : "secondary"}
                        className="shrink-0 ml-2"
                      >
                        {result.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Best Study Times</h4>
                {learning_patterns.optimal_study_hours.length > 0 ? (
                  <div className="space-y-2">
                    {learning_patterns.optimal_study_hours.map((hour, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <span className="text-sm">
                          {hour.hour === 0
                            ? "12 AM"
                            : hour.hour < 12
                            ? `${hour.hour} AM`
                            : hour.hour === 12
                            ? "12 PM"
                            : `${hour.hour - 12} PM`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {hour.engagement_score.toFixed(1)} engagement
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not enough data yet
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Preferred Days</h4>
                {learning_patterns.preferred_study_days.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {learning_patterns.preferred_study_days.map((day, index) => (
                      <Badge key={index} variant="secondary">
                        {day}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not enough data yet
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-2xl font-bold">
                  {learning_patterns.average_session_duration_minutes}
                </p>
                <p className="text-xs text-muted-foreground">Avg Session (min)</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-2xl font-bold">
                  {learning_patterns.total_sessions_last_30_days}
                </p>
                <p className="text-xs text-muted-foreground">Sessions (30 days)</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Device Usage</h4>
              <DeviceUsageDisplay usage={learning_patterns.device_usage} />
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-3">
            {recommendations.items.length > 0 ? (
              recommendations.items.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">You&apos;re doing great!</p>
                <p className="text-xs text-muted-foreground">
                  No specific recommendations at this time. Keep up the good work!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
