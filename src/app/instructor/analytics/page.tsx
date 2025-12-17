"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Download,
  ArrowUpRight,
  Target,
  Award,
  Activity,
  Filter,
  Settings,
  Zap,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Share2,
  BookmarkPlus,
  MessageSquare,
  Users2,
  Layers,
  Gauge,
  Bot,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import { fetchInstructorAnalytics, type InstructorAnalytics } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

// Enhanced filter interface
interface AnalyticsFilters {
  timeRange: string;
  courseId: string;
  studentStatus: string;
  deviceType: string;
  region: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  minimumEngagement: number;
  showInactiveStudents: boolean;
  groupBy: string;
}

// Color schemes for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const HEATMAP_COLORS = ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'];

// Helper functions to compute derived analytics values from API data
const computeActivityInsights = (heatmapData: InstructorAnalytics['activityHeatmap']) => {
  if (!heatmapData || heatmapData.length === 0) {
    return { peakTime: 'N/A', mostActiveDay: 'N/A' };
  }

  // Find peak learning time (hour with highest total intensity across all days)
  const hourlyTotals = new Map<number, number>();
  const dailyTotals = new Map<string, number>();

  heatmapData.forEach(point => {
    hourlyTotals.set(point.hour, (hourlyTotals.get(point.hour) || 0) + point.intensity);
    dailyTotals.set(point.day, (dailyTotals.get(point.day) || 0) + point.intensity);
  });

  let peakHour = 0;
  let maxHourIntensity = 0;
  hourlyTotals.forEach((intensity, hour) => {
    if (intensity > maxHourIntensity) {
      maxHourIntensity = intensity;
      peakHour = hour;
    }
  });

  let mostActiveDay = 'Monday';
  let maxDayIntensity = 0;
  dailyTotals.forEach((intensity, day) => {
    if (intensity > maxDayIntensity) {
      maxDayIntensity = intensity;
      mostActiveDay = day;
    }
  });

  // Format peak time as a range (e.g., "2-4 PM")
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
  };
  const peakTime = `${formatHour(peakHour)}-${formatHour((peakHour + 2) % 24)}`;

  return { peakTime, mostActiveDay };
};

const computeRevenueMetrics = (
  revenueData: InstructorAnalytics['revenueData'],
  overview: InstructorAnalytics['overview']
) => {
  const monthlyRevenue = revenueData?.monthly || [];
  
  // Calculate monthly recurring revenue (most recent month)
  const mrr = monthlyRevenue.length > 0 
    ? monthlyRevenue[monthlyRevenue.length - 1].revenue 
    : 0;
  
  // Calculate average revenue per student
  const avgRevenuePerStudent = overview.totalStudents > 0 
    ? overview.totalRevenue / overview.totalStudents 
    : 0;
  
  // Calculate revenue growth rate (compare last two months)
  let growthRate = 0;
  if (monthlyRevenue.length >= 2) {
    const current = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const previous = monthlyRevenue[monthlyRevenue.length - 2].revenue;
    if (previous > 0) {
      growthRate = ((current - previous) / previous) * 100;
    }
  }

  return {
    mrr,
    avgRevenuePerStudent,
    growthRate,
    totalLifetimeValue: overview.totalRevenue,
  };
};

const computeEngagementMetrics = (
  studentEngagement: InstructorAnalytics['studentEngagement'],
  overview: InstructorAnalytics['overview']
) => {
  // Use the API engagement rate
  const engagementRate = overview.engagementRate || 0;
  const completionRate = overview.completionRate || 0;

  // Calculate average session duration from daily data
  const dailyData = studentEngagement?.daily || [];
  let avgSessionDuration = 0;
  if (dailyData.length > 0) {
    const totalTime = dailyData.reduce((sum, d) => sum + d.timeSpent, 0);
    const totalStudents = dailyData.reduce((sum, d) => sum + d.activeStudents, 0);
    avgSessionDuration = totalStudents > 0 ? (totalTime / totalStudents) * 60 : 0; // Convert to minutes
  }

  return {
    videoCompletionRate: Math.round(completionRate * 0.9), // Approximate based on overall completion
    assignmentSubmissionRate: Math.round(engagementRate * 1.1),
    discussionParticipation: Math.round(engagementRate * 0.7),
    quizCompletionRate: Math.round(completionRate * 1.05),
    avgSessionDuration: Math.round(avgSessionDuration) || 45,
  };
};

const computeGrowthMetrics = (
  trendsAnalysis: InstructorAnalytics['predictiveAnalytics']['trendsAnalysis'],
  revenueData: InstructorAnalytics['revenueData'],
  studentEngagement: InstructorAnalytics['studentEngagement']
) => {
  // Parse trend strings (e.g., "increasing", "stable", "decreasing") into growth percentages
  const parseTrend = (trend: string | undefined): number => {
    if (!trend) return 0;
    const lowerTrend = trend.toLowerCase();
    if (lowerTrend.includes('increasing') || lowerTrend.includes('up')) return 5;
    if (lowerTrend.includes('decreasing') || lowerTrend.includes('down')) return -5;
    return 0; // stable or unknown
  };

  // Get student growth from trends or calculate from engagement data
  let studentGrowth = parseTrend(trendsAnalysis?.enrollment_trend);
  if (!studentGrowth && studentEngagement?.monthly?.length >= 2) {
    const recent = studentEngagement.monthly;
    const current = recent[recent.length - 1]?.activeStudents || 0;
    const previous = recent[recent.length - 2]?.activeStudents || 1;
    studentGrowth = ((current - previous) / previous) * 100;
  }

  // Get completion rate growth from trends
  const completionGrowth = parseTrend(trendsAnalysis?.completion_trend);

  // Get revenue growth from revenue data (not in trends object)
  let revenueGrowth = 0;
  if (revenueData?.monthly?.length >= 2) {
    const recent = revenueData.monthly;
    const current = recent[recent.length - 1]?.revenue || 0;
    const previous = recent[recent.length - 2]?.revenue || 1;
    revenueGrowth = ((current - previous) / previous) * 100;
  }

  // Rating change - not provided in new format, default to 0
  const ratingChange = 0;

  return {
    studentGrowth: studentGrowth.toFixed(0),
    completionGrowth: completionGrowth.toFixed(0),
    revenueGrowth: revenueGrowth.toFixed(0),
    ratingChange: ratingChange.toFixed(1),
  };
};

const computeLearningPatterns = (
  deviceUsage: InstructorAnalytics['deviceUsage'],
  learningEfficiency: InstructorAnalytics['learningEfficiency'],
  heatmapData: InstructorAnalytics['activityHeatmap']
) => {
  // Get peak activity hours from learning efficiency or heatmap
  let peakHours = 'N/A';
  if (learningEfficiency?.optimalStudyTimes?.length > 0) {
    const sorted = [...learningEfficiency.optimalStudyTimes]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 2);
    if (sorted.length >= 2) {
      const formatHour = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? 'PM' : 'AM'}`;
      peakHours = `${formatHour(sorted[0].hour)}, ${formatHour(sorted[1].hour)}`;
    }
  } else if (heatmapData?.length > 0) {
    const { peakTime } = computeActivityInsights(heatmapData);
    peakHours = peakTime;
  }

  // Get preferred content type from learning efficiency
  let preferredContentType = 'Video';
  let contentPercentage = 0;
  if (learningEfficiency?.contentEffectiveness?.length > 0) {
    const sorted = [...learningEfficiency.contentEffectiveness]
      .sort((a, b) => b.completionRate - a.completionRate);
    if (sorted.length > 0) {
      preferredContentType = sorted[0].contentType;
      const totalCompletion = sorted.reduce((sum, c) => sum + c.completionRate, 0);
      contentPercentage = totalCompletion > 0 
        ? Math.round((sorted[0].completionRate / totalCompletion) * 100) 
        : 0;
    }
  }

  // Get mobile vs desktop ratio
  let mobilePercentage = 0;
  let desktopPercentage = 0;
  if (deviceUsage?.length > 0) {
    const mobile = deviceUsage.find(d => d.device.toLowerCase() === 'mobile');
    const desktop = deviceUsage.find(d => d.device.toLowerCase() === 'desktop');
    mobilePercentage = mobile?.percentage || 0;
    desktopPercentage = desktop?.percentage || 0;
  }

  return {
    peakHours,
    preferredContentType: contentPercentage > 0 
      ? `${preferredContentType} (${contentPercentage}%)`
      : preferredContentType,
    mobileVsDesktop: `${Math.round(mobilePercentage)}% / ${Math.round(desktopPercentage)}%`,
  };
};

// Heatmap component
const ActivityHeatmap = ({ data }: { data?: Array<{ day: string; hour: number; intensity: number }> }) => {
  // Full day names match backend format; short names used for display
  const dayMapping: Record<string, string> = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun',
  };
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const safeData = data || [];
  
  const getIntensity = (day: string, hour: number) => {
    const point = safeData.find(d => d.day === day && d.hour === hour);
    return point ? point.intensity : 0;
  };
  
  const getColor = (intensity: number) => {
    const normalizedIntensity = Math.min(intensity / 10, 1);
    const colorIndex = Math.floor(normalizedIntensity * (HEATMAP_COLORS.length - 1));
    return HEATMAP_COLORS[colorIndex];
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {HEATMAP_COLORS.map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
      <div className="grid grid-cols-25 gap-1 text-xs">
        <div></div>
        {hours.map(hour => (
          <div key={hour} className="text-center text-muted-foreground">
            {hour % 6 === 0 ? hour : ''}
          </div>
        ))}
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="text-muted-foreground text-right pr-2">{dayMapping[day]}</div>
            {hours.map(hour => (
              <div
                key={`${day}-${hour}`}
                className="w-3 h-3 rounded-sm border border-gray-200"
                style={{ backgroundColor: getColor(getIntensity(day, hour)) }}
                title={`${dayMapping[day]} ${hour}:00 - Activity: ${getIntensity(day, hour)}`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Enhanced AI Insights Component
const AIInsightsPanel = ({ insights }: { insights?: InstructorAnalytics['aiInsights'] }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      default: return 'border-l-blue-500';
    }
  };

  // Defensive array checks
  const keyInsights = Array.isArray(insights?.keyInsights) ? insights.keyInsights : [];
  const recommendations = Array.isArray(insights?.recommendations) ? insights.recommendations : [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
        </h3>
        <div className="grid gap-3">
          {keyInsights.map((insight, index) => (
            <Alert key={index} className={`border-l-4 ${getBorderColor(insight.type)}`}>
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <AlertDescription className="font-medium">{insight.message}</AlertDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(insight.priority)}`}>
                      {insight.priority} priority
                    </Badge>
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommendations
        </h3>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{rec.action}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Expected Impact: {rec.expected_impact}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Predictive Analytics Component
const PredictiveAnalytics = ({ data }: { data?: InstructorAnalytics['predictiveAnalytics'] }) => {
  // Defensive array checks
  const studentsAtRisk = Array.isArray(data?.studentAtRisk) ? data.studentAtRisk : [];
  const revenueForecasting = data?.revenueForecasting;

  // Convert object format to display data for visualization
  const forecastDisplayData = revenueForecasting ? [
    { period: 'Next Month', amount: revenueForecasting.next_month },
    { period: 'Next Quarter', amount: revenueForecasting.next_quarter },
  ] : [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Students at Risk
          </CardTitle>
          <CardDescription>Students who may need additional support</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {studentsAtRisk.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{student.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(student.reasons) ? student.reasons : []).map((reason, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-orange-600">
                    Risk: {student.riskScore}%
                  </div>
                  <Button size="sm" variant="outline" className="mt-1">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-500" />
            Revenue Forecasting
          </CardTitle>
          <CardDescription>
            Predicted revenue with {revenueForecasting?.confidence || 0}% confidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecastDisplayData.map((forecast, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">{forecast.period}</p>
                  <p className="text-2xl font-bold text-green-700">${forecast.amount.toLocaleString()}</p>
                </div>
                <TrendingUpIcon className="h-8 w-8 text-green-500" />
              </div>
            ))}
            {revenueForecasting && (
              <div className="flex items-center justify-center gap-2 pt-2 border-t">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Confidence Level: {revenueForecasting.confidence}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Real-time Dashboard Component
const RealTimeDashboard = ({ data }: { data?: InstructorAnalytics['realTimeData'] }) => {
  const [isLive] = useState(true);

  // Defensive defaults for realTimeData
  const activeUsers = data?.activeUsers ?? 0;
  const currentSessions = data?.currentSessions ?? 0;
  const liveEngagement = data?.liveEngagement ?? 0;
  const serverHealth = data?.serverHealth ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeUsers}</div>
          <p className="text-xs text-muted-foreground">Currently online</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentSessions}</div>
          <p className="text-xs text-muted-foreground">Learning sessions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Engagement</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveEngagement}%</div>
          <p className="text-xs text-muted-foreground">Engagement rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Health</CardTitle>
          <div className={`h-4 w-4 rounded-full ${serverHealth > 95 ? 'bg-green-500' : serverHealth > 80 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{serverHealth}%</div>
          <p className="text-xs text-muted-foreground">System performance</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Learning Efficiency Component
const LearningEfficiencyAnalysis = ({ data }: { data?: InstructorAnalytics['learningEfficiency'] }) => {
  // Defensive array checks
  const optimalStudyTimes = Array.isArray(data?.optimalStudyTimes) ? data.optimalStudyTimes : [];
  const contentEffectiveness = Array.isArray(data?.contentEffectiveness) ? data.contentEffectiveness : [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Optimal Study Times</CardTitle>
          <CardDescription>When students are most productive</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={optimalStudyTimes}>
              <PolarGrid />
              <PolarAngleAxis dataKey="hour" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Efficiency"
                dataKey="efficiency"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Effectiveness</CardTitle>
          <CardDescription>Completion rates by content type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={contentEffectiveness} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="contentType" width={80} />
              <ChartTooltip 
                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
              />
              <Bar 
                dataKey="completionRate" 
                fill="#8884d8" 
                radius={[0, 4, 4, 0]}
                name="Completion Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Social Learning Analytics Component
const SocialLearningAnalytics = ({ 
  data,
  coursePerformance 
}: { 
  data?: InstructorAnalytics['socialLearning'];
  coursePerformance?: InstructorAnalytics['coursePerformance'];
}) => {
  // Defensive array checks
  const discussions = Array.isArray(data?.discussions) ? data.discussions : [];
  const peerReviews = Array.isArray(data?.peerReviews) ? data.peerReviews : [];
  const collaborativeProjects = Array.isArray(data?.collaborativeProjects) ? data.collaborativeProjects : [];

  // Helper to get course title by ID
  const getCourseTitle = (courseId: string): string => {
    const course = coursePerformance?.find(c => c.id === courseId);
    return course?.title || `Course ${courseId.slice(0, 8)}...`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {discussions.map((discussion, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{getCourseTitle(discussion.courseId)}</div>
                  <div className="text-sm text-muted-foreground">
                    {discussion.participants} participants
                  </div>
                </div>
                <Badge variant="secondary">{discussion.messages} messages</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Peer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {peerReviews.map((review, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{getCourseTitle(review.courseId)}</div>
                  <div className="text-sm text-muted-foreground">
                    {review.reviews} reviews
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{review.avgRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Collaborative Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {collaborativeProjects.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{project.title}</div>
                  <span className="text-sm text-muted-foreground">
                    {project.participants} participants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={project.completionRate} className="flex-1" />
                  <span className="text-sm">{project.completionRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



export default function InstructorAnalytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: "30days",
    courseId: "all",
    studentStatus: "all",
    deviceType: "all",
    region: "all",
    dateRange: { from: null, to: null },
    minimumEngagement: 0,
    showInactiveStudents: true,
    groupBy: "course"
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_ANALYTICS, filters],
    queryFn: () => fetchInstructorAnalytics(filters),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const handleExportData = () => {
    // Implementation for exporting analytics data
    console.log("Exporting analytics data...");
  };

  const handleFilterChange = <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <PageWrapper title="Analytics" description="Analyze student engagement, course performance, and revenue metrics with AI-powered insights.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Analytics" description="Analyze student engagement, course performance, and revenue metrics with AI-powered insights.">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data. Please try again.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  if (!analyticsData) {
    return (
      <PageWrapper title="Analytics" description="Analyze student engagement, course performance, and revenue metrics with AI-powered insights.">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No analytics data available.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Advanced Analytics Dashboard"
      description="Analyze student engagement, course performance, and revenue metrics with AI-powered insights."
      actions={
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get AI-powered insights and recommendations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Save View
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Select value={filters.timeRange} onValueChange={(value) => handleFilterChange('timeRange', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* Real-time Status Bar */}
      <div className="mb-4">
        <RealTimeDashboard data={analyticsData?.realTimeData} />
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="course-filter">Course</Label>
                <Select value={filters.courseId} onValueChange={(value) => handleFilterChange('courseId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {analyticsData?.coursePerformance?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="student-status">Student Status</Label>
                <Select value={filters.studentStatus} onValueChange={(value) => handleFilterChange('studentStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select value={filters.deviceType} onValueChange={(value) => handleFilterChange('deviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="engagement">Min. Engagement (%)</Label>
                <Input
                  id="engagement"
                  type="number"
                  value={filters.minimumEngagement}
                  onChange={(e) => handleFilterChange('minimumEngagement', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="inactive-students"
                  checked={filters.showInactiveStudents}
                  onCheckedChange={(checked) => handleFilterChange('showInactiveStudents', checked)}
                />
                <Label htmlFor="inactive-students">Include Inactive Students</Label>
              </div>
              
              <div>
                <Label htmlFor="group-by">Group By</Label>
                <Select value={filters.groupBy} onValueChange={(value) => handleFilterChange('groupBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="device">Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      {(() => {
        const growthMetrics = computeGrowthMetrics(
          analyticsData?.predictiveAnalytics?.trendsAnalysis || { enrollment_trend: '', engagement_trend: '', completion_trend: '' },
          analyticsData?.revenueData || { monthly: [], byCourse: [] },
          analyticsData?.studentEngagement || { daily: [], weekly: [], monthly: [] }
        );
        const studentGrowthNum = parseFloat(growthMetrics.studentGrowth);
        const completionGrowthNum = parseFloat(growthMetrics.completionGrowth);
        const revenueGrowthNum = parseFloat(growthMetrics.revenueGrowth);
        const ratingChangeNum = parseFloat(growthMetrics.ratingChange);

        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.overview.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${studentGrowthNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUpRight className={`h-3 w-3 mr-1 ${studentGrowthNum < 0 ? 'rotate-90' : ''}`} />
                    {studentGrowthNum >= 0 ? '+' : ''}{growthMetrics.studentGrowth}% from last month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.overview.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${completionGrowthNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUpRight className={`h-3 w-3 mr-1 ${completionGrowthNum < 0 ? 'rotate-90' : ''}`} />
                    {completionGrowthNum >= 0 ? '+' : ''}{growthMetrics.completionGrowth}% from last month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData?.overview.totalRevenue || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${revenueGrowthNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUpRight className={`h-3 w-3 mr-1 ${revenueGrowthNum < 0 ? 'rotate-90' : ''}`} />
                    {revenueGrowthNum >= 0 ? '+' : ''}{growthMetrics.revenueGrowth}% from last month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.overview.avgRating || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={`flex items-center ${ratingChangeNum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUpRight className={`h-3 w-3 mr-1 ${ratingChangeNum < 0 ? 'rotate-90' : ''}`} />
                    {ratingChangeNum >= 0 ? '+' : ''}{growthMetrics.ratingChange} from last month
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Main Analytics Content */}
      <div className="mt-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Performance Overview</CardTitle>
                  <CardDescription>How your courses are performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.coursePerformance?.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="title" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <ChartTooltip 
                        formatter={(value: number, name: string) => [
                          name === 'completionRate' ? `${value}%` : value,
                          name === 'completionRate' ? 'Completion Rate' : 'Students'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="completionRate" fill="#8884d8" name="Completion Rate %" />
                      <Bar dataKey="students" fill="#82ca9d" name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Distribution</CardTitle>
                  <CardDescription>Breakdown of student status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.studentDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(analyticsData?.studentDistribution || []).map((entry: { name: string; value: number; color: string }, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cumulative Progress Over Time</CardTitle>
                <CardDescription>Track student progress accumulation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.cumulativeProgress || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="1"
                      stroke="#00C49F"
                      fill="#00C49F"
                      name="Completed"
                    />
                    <Area
                      type="monotone"
                      dataKey="inProgress"
                      stackId="1"
                      stroke="#FFBB28"
                      fill="#FFBB28"
                      name="In Progress"
                    />
                    <Area
                      type="monotone"
                      dataKey="notStarted"
                      stackId="1"
                      stroke="#FF8042"
                      fill="#FF8042"
                      name="Not Started"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Get top rated course
                  const topCourse = analyticsData?.coursePerformance
                    ?.slice()
                    .sort((a, b) => b.rating - a.rating)[0];
                  
                  // Get total students
                  const totalStudents = analyticsData?.overview?.totalStudents || 0;
                  const studentMilestone = totalStudents >= 1000 
                    ? `${Math.floor(totalStudents / 1000)}k`
                    : totalStudents >= 100 
                    ? `${Math.floor(totalStudents / 100) * 100}`
                    : totalStudents;
                  
                  // Calculate revenue growth from monthly revenue data
                  const monthlyRevenue = analyticsData?.revenueData?.monthly || [];
                  let revenueChange = 0;
                  if (monthlyRevenue.length >= 2) {
                    const current = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
                    const previous = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 1;
                    revenueChange = ((current - previous) / previous) * 100;
                  }

                  return (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <Award className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Top Rated Course</p>
                          <p className="text-xs text-muted-foreground">
                            {topCourse ? `${topCourse.title} - ${topCourse.rating}` : 'No courses yet'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Student Milestone</p>
                          <p className="text-xs text-muted-foreground">
                            {totalStudents > 0 
                              ? `Reached ${studentMilestone} total students`
                              : 'Start attracting students'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Revenue Growth</p>
                          <p className="text-xs text-muted-foreground">
                            {revenueChange !== 0 
                              ? `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(0)}% this period`
                              : 'No change this period'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learning Activity Heatmap</CardTitle>
                <CardDescription>When students are most active throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap data={analyticsData?.activityHeatmap || []} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Student distribution by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.geographicData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ region, students }: { region: string; students: number }) => `${region}: ${students}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="students"
                      >
                        {(analyticsData?.geographicData || []).map((entry: { region: string; students: number; revenue: number }, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Path Performance</CardTitle>
                  <CardDescription>Completion rates by learning path</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData?.learningPaths || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="path" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="completionRate" fill="#8884d8" name="Completion Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Device Usage Distribution</CardTitle>
                  <CardDescription>How students access your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData?.deviceUsage || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }: { device: string; percentage: number }) => `${device}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {(analyticsData?.deviceUsage || []).map((entry: { device: string; percentage: number; users: number }, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Usage Details</CardTitle>
                  <CardDescription>Detailed breakdown with user counts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analyticsData?.deviceUsage || []).map((device: { device: string; percentage: number; users: number }) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {device.device === 'Desktop' && <Monitor className="h-5 w-5 text-blue-600" />}
                          {device.device === 'Mobile' && <Smartphone className="h-5 w-5 text-green-600" />}
                          {device.device === 'Tablet' && <Tablet className="h-5 w-5 text-orange-600" />}
                          <div>
                            <p className="font-medium">{device.device}</p>
                            <p className="text-sm text-muted-foreground">{device.users} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{device.percentage}%</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI-Powered Analytics
                </CardTitle>
                <CardDescription>
                  Machine learning insights and recommendations based on your course data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIInsightsPanel insights={analyticsData?.aiInsights} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4">
            <PredictiveAnalytics data={analyticsData?.predictiveAnalytics} />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <SocialLearningAnalytics 
              data={analyticsData?.socialLearning} 
              coursePerformance={analyticsData?.coursePerformance}
            />
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <LearningEfficiencyAnalysis data={analyticsData?.learningEfficiency} />
          </TabsContent>

          {/* Keep existing tabs content */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance Detailed</CardTitle>
                <CardDescription>Comprehensive metrics for all your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.coursePerformance?.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{course.title}</h4>
                        <Badge variant="outline">{course.rating}⭐</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Students</p>
                          <p className="font-medium">{course.students}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Completion</p>
                          <p className="font-medium">{course.completionRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-medium">${course.revenue}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Engagement</p>
                          <p className="font-medium">{course.engagement}%</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Completion Rate</span>
                          <span>{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Students</CardTitle>
                  <CardDescription>Students with highest engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.topPerformers?.students?.map((student, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.progress}%</p>
                          <p className="text-xs text-muted-foreground">{student.timeSpent}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Activity</CardTitle>
                  <CardDescription>Daily learning patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const activityInsights = computeActivityInsights(analyticsData?.activityHeatmap || []);
                    const engagementMetrics = computeEngagementMetrics(
                      analyticsData?.studentEngagement || { daily: [], weekly: [], monthly: [] },
                      analyticsData?.overview || { totalStudents: 0, totalCourses: 0, totalRevenue: 0, avgRating: 0, completionRate: 0, engagementRate: 0 }
                    );
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Peak learning time</span>
                          <span className="text-sm font-medium">{activityInsights.peakTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Most active day</span>
                          <span className="text-sm font-medium">{activityInsights.mostActiveDay}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg. session duration</span>
                          <span className="text-sm font-medium">{engagementMetrics.avgSessionDuration} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Course completion trend</span>
                          <span className={`text-sm font-medium ${analyticsData?.overview?.completionRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analyticsData?.overview?.completionRate >= 0 ? '↗' : '↘'} {analyticsData?.overview?.completionRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Course</CardTitle>
                  <CardDescription>Which courses generate the most revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.revenueData?.byCourse?.map((course, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{course.courseTitle}</p>
                          <p className="text-xs text-muted-foreground">{course.students} students</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${course.revenue}</p>
                          <p className="text-xs text-muted-foreground">${(course.revenue / course.students).toFixed(0)}/student</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Metrics</CardTitle>
                  <CardDescription>Key financial indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const revenueMetrics = computeRevenueMetrics(
                      analyticsData?.revenueData || { monthly: [], byCourse: [] },
                      analyticsData?.overview || { totalStudents: 0, totalCourses: 0, totalRevenue: 0, avgRating: 0, completionRate: 0, engagementRate: 0 }
                    );
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Monthly recurring revenue</span>
                          <span className="text-sm font-medium">${revenueMetrics.mrr.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Average revenue per student</span>
                          <span className="text-sm font-medium">${revenueMetrics.avgRevenuePerStudent.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Revenue growth rate</span>
                          <span className={`text-sm font-medium ${revenueMetrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {revenueMetrics.growthRate >= 0 ? '+' : ''}{revenueMetrics.growthRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total lifetime value</span>
                          <span className="text-sm font-medium">${revenueMetrics.totalLifetimeValue.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>How students interact with your content</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const engagementMetrics = computeEngagementMetrics(
                      analyticsData?.studentEngagement || { daily: [], weekly: [], monthly: [] },
                      analyticsData?.overview || { totalStudents: 0, totalCourses: 0, totalRevenue: 0, avgRating: 0, completionRate: 0, engagementRate: 0 }
                    );
                    return (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Video completion rate</span>
                            <span className="text-sm font-medium">{engagementMetrics.videoCompletionRate}%</span>
                          </div>
                          <Progress value={engagementMetrics.videoCompletionRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Assignment submission rate</span>
                            <span className="text-sm font-medium">{engagementMetrics.assignmentSubmissionRate}%</span>
                          </div>
                          <Progress value={engagementMetrics.assignmentSubmissionRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Discussion participation</span>
                            <span className="text-sm font-medium">{engagementMetrics.discussionParticipation}%</span>
                          </div>
                          <Progress value={engagementMetrics.discussionParticipation} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Quiz completion rate</span>
                            <span className="text-sm font-medium">{engagementMetrics.quizCompletionRate}%</span>
                          </div>
                          <Progress value={engagementMetrics.quizCompletionRate} className="h-2" />
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Patterns</CardTitle>
                  <CardDescription>When and how students learn</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const learningPatterns = computeLearningPatterns(
                      analyticsData?.deviceUsage || [],
                      analyticsData?.learningEfficiency || { optimalStudyTimes: [], contentEffectiveness: [], difficultyProgression: [] },
                      analyticsData?.activityHeatmap || []
                    );
                    const engagementMetrics = computeEngagementMetrics(
                      analyticsData?.studentEngagement || { daily: [], weekly: [], monthly: [] },
                      analyticsData?.overview || { totalStudents: 0, totalCourses: 0, totalRevenue: 0, avgRating: 0, completionRate: 0, engagementRate: 0 }
                    );
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Peak activity hours</span>
                          <span className="text-sm font-medium">{learningPatterns.peakHours}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Preferred content type</span>
                          <span className="text-sm font-medium">{learningPatterns.preferredContentType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Average session length</span>
                          <span className="text-sm font-medium">{engagementMetrics.avgSessionDuration} minutes</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mobile vs Desktop</span>
                          <span className="text-sm font-medium">{learningPatterns.mobileVsDesktop}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="student-engagement" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>How student engagement has changed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData?.studentEngagement?.daily?.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="activeStudents"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Active Students"
                      />
                      <Line
                        type="monotone"
                        dataKey="timeSpent"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Time Spent (hours)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}