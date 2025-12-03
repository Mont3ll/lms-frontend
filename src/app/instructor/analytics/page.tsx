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
  ComposedChart,
  ScatterChart,
  Scatter,
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
  XCircle,
  Share2,
  BookmarkPlus,
  MessageSquare,
  Users2,
  Layers,
  Gauge,
  Bot,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import { fetchInstructorAnalytics } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    avgRating: number;
    completionRate: number;
    engagementRate: number;
  };
  coursePerformance: Array<{
    id: string;
    title: string;
    students: number;
    completionRate: number;
    rating: number;
    revenue: number;
    engagement: number;
  }>;
  studentEngagement: {
    daily: Array<{ date: string; activeStudents: number; timeSpent: number }>;
    weekly: Array<{ week: string; activeStudents: number; timeSpent: number }>;
    monthly: Array<{ month: string; activeStudents: number; timeSpent: number }>;
  };
  revenueData: {
    monthly: Array<{ month: string; revenue: number; students: number }>;
    byCourse: Array<{ courseTitle: string; revenue: number; students: number }>;
  };
  topPerformers: {
    courses: Array<{ title: string; metric: string; value: number }>;
    students: Array<{ name: string; course: string; progress: number; timeSpent: number }>;
  };
  // Enhanced data structures
  studentDistribution: Array<{ name: string; value: number; color: string }>;
  cumulativeProgress: Array<{ date: string; completed: number; inProgress: number; notStarted: number }>;
  activityHeatmap: Array<{ day: string; hour: number; intensity: number }>;
  deviceUsage: Array<{ device: string; percentage: number; users: number }>;
  geographicData: Array<{ region: string; students: number; revenue: number }>;
  learningPaths: Array<{ path: string; completionRate: number; avgTime: number }>;
  // New enhanced features
  predictiveAnalytics: {
    studentAtRisk: Array<{ id: string; name: string; riskScore: number; reasons: string[] }>;
    courseRecommendations: Array<{ course: string; potentialStudents: number; confidence: number }>;
    revenueForecasting: Array<{ month: string; predicted: number; confidence: number }>;
    trendsAnalysis: Array<{ metric: string; trend: 'up' | 'down' | 'stable'; change: number }>;
  };
  aiInsights: {
    keyInsights: Array<{ type: 'positive' | 'negative' | 'neutral'; title: string; description: string; confidence: number }>;
    recommendations: Array<{ priority: 'high' | 'medium' | 'low'; title: string; description: string; impact: string }>;
    anomalies: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }>;
  };
  realTimeData: {
    activeUsers: number;
    currentSessions: number;
    liveEngagement: number;
    serverHealth: number;
  };
  socialLearning: {
    discussions: Array<{ courseId: string; messages: number; participants: number }>;
    peerReviews: Array<{ courseId: string; reviews: number; avgRating: number }>;
    collaborativeProjects: Array<{ projectId: string; participants: number; completionRate: number }>;
  };
  learningEfficiency: {
    optimalStudyTimes: Array<{ hour: number; efficiency: number }>;
    contentEffectiveness: Array<{ contentType: string; avgTimeSpent: number; completionRate: number }>;
    difficultyProgression: Array<{ lesson: string; difficultyScore: number; successRate: number }>;
  };
}

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

// Heatmap component
const ActivityHeatmap = ({ data }: { data: Array<{ day: string; hour: number; intensity: number }> }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getIntensity = (day: string, hour: number) => {
    const point = data.find(d => d.day === day && d.hour === hour);
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
            <div className="text-muted-foreground text-right pr-2">{day}</div>
            {hours.map(hour => (
              <div
                key={`${day}-${hour}`}
                className="w-3 h-3 rounded-sm border border-gray-200"
                style={{ backgroundColor: getColor(getIntensity(day, hour)) }}
                title={`${day} ${hour}:00 - Activity: ${getIntensity(day, hour)}`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Enhanced AI Insights Component
const AIInsightsPanel = ({ insights }: { insights: AnalyticsData['aiInsights'] }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
        </h3>
        <div className="grid gap-3">
          {insights.keyInsights.map((insight, index) => (
            <Alert key={index} className="border-l-4 border-l-blue-500">
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <AlertDescription className="font-medium">{insight.title}</AlertDescription>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      <span className="text-xs">Confidence: {insight.confidence}%</span>
                    </div>
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
          {insights.recommendations.map((rec, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm mt-1">{rec.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Impact: {rec.impact}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {rec.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Predictive Analytics Component
const PredictiveAnalytics = ({ data }: { data: AnalyticsData['predictiveAnalytics'] }) => {
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
            {data.studentAtRisk.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{student.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {student.reasons.map((reason, idx) => (
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
          <CardDescription>Predicted revenue for next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={data.revenueForecasting}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip />
              <Area dataKey="predicted" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
              <Line dataKey="confidence" stroke="#82ca9d" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Real-time Dashboard Component
const RealTimeDashboard = ({ data }: { data: AnalyticsData['realTimeData'] }) => {
  const [isLive] = useState(true);

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
          <div className="text-2xl font-bold">{data.activeUsers}</div>
          <p className="text-xs text-muted-foreground">Currently online</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.currentSessions}</div>
          <p className="text-xs text-muted-foreground">Learning sessions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Engagement</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.liveEngagement}%</div>
          <p className="text-xs text-muted-foreground">Engagement rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Health</CardTitle>
          <div className={`h-4 w-4 rounded-full ${data.serverHealth > 95 ? 'bg-green-500' : data.serverHealth > 80 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.serverHealth}%</div>
          <p className="text-xs text-muted-foreground">System performance</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Learning Efficiency Component
const LearningEfficiencyAnalysis = ({ data }: { data: AnalyticsData['learningEfficiency'] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Optimal Study Times</CardTitle>
          <CardDescription>When students are most productive</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={data.optimalStudyTimes}>
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
          <CardDescription>Which content types work best</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={data.contentEffectiveness}>
              <CartesianGrid />
              <XAxis dataKey="avgTimeSpent" name="Time Spent" />
              <YAxis dataKey="completionRate" name="Completion Rate" />
              <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Content" dataKey="completionRate" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Social Learning Analytics Component
const SocialLearningAnalytics = ({ data }: { data: AnalyticsData['socialLearning'] }) => {
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
            {data.discussions.map((discussion, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Course {discussion.courseId}</div>
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
            {data.peerReviews.map((review, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Course {review.courseId}</div>
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
            {data.collaborativeProjects.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Project {project.projectId}</div>
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
  } = useQuery<AnalyticsData>({
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
      <PageWrapper title="Analytics">
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
      <PageWrapper title="Analytics">
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
      <PageWrapper title="Analytics">
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
        <RealTimeDashboard data={analyticsData.realTimeData} />
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
                    <SelectItem value="react-basics">React Basics</SelectItem>
                    <SelectItem value="advanced-python">Advanced Python</SelectItem>
                    <SelectItem value="javascript-fundamentals">JavaScript Fundamentals</SelectItem>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.overview.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% from last month
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
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5% from last month
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
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +18% from last month
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
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +0.2 from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

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
                        data={analyticsData.studentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.studentDistribution.map((entry: { name: string; value: number; color: string }, index: number) => (
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
                  <AreaChart data={analyticsData.cumulativeProgress}>
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
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Award className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Top Rated Course</p>
                      <p className="text-xs text-muted-foreground">React Fundamentals - 4.9★</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Student Milestone</p>
                      <p className="text-xs text-muted-foreground">Reached 500 total students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Revenue Growth</p>
                      <p className="text-xs text-muted-foreground">25% increase this quarter</p>
                    </div>
                  </div>
                </div>
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
                <ActivityHeatmap data={analyticsData.activityHeatmap} />
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
                        data={analyticsData.geographicData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ region, students }: { region: string; students: number }) => `${region}: ${students}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="students"
                      >
                        {analyticsData.geographicData.map((entry: { region: string; students: number; revenue: number }, index: number) => (
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
                    <BarChart data={analyticsData.learningPaths}>
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
                        data={analyticsData.deviceUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, percentage }: { device: string; percentage: number }) => `${device}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {analyticsData.deviceUsage.map((entry: { device: string; percentage: number; users: number }, index: number) => (
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
                    {analyticsData.deviceUsage.map((device: { device: string; percentage: number; users: number }) => (
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
            <AIInsightsPanel insights={analyticsData.aiInsights} />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-4">
            <PredictiveAnalytics data={analyticsData.predictiveAnalytics} />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <SocialLearningAnalytics data={analyticsData.socialLearning} />
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <LearningEfficiencyAnalysis data={analyticsData.learningEfficiency} />
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Peak learning time</span>
                      <span className="text-sm font-medium">2-4 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most active day</span>
                      <span className="text-sm font-medium">Tuesday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. session duration</span>
                      <span className="text-sm font-medium">45 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Course completion trend</span>
                      <span className="text-sm font-medium text-green-600">↗ +12%</span>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly recurring revenue</span>
                      <span className="text-sm font-medium">$2,340</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average revenue per student</span>
                      <span className="text-sm font-medium">$89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue growth rate</span>
                      <span className="text-sm font-medium text-green-600">+18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total lifetime value</span>
                      <span className="text-sm font-medium">$15,670</span>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Video completion rate</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Assignment submission rate</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Discussion participation</span>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Quiz completion rate</span>
                        <span className="text-sm font-medium">91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Patterns</CardTitle>
                  <CardDescription>When and how students learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Peak activity hours</span>
                      <span className="text-sm font-medium">2-4 PM, 7-9 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Preferred content type</span>
                      <span className="text-sm font-medium">Video (65%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average session length</span>
                      <span className="text-sm font-medium">45 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile vs Desktop</span>
                      <span className="text-sm font-medium">40% / 60%</span>
                    </div>
                  </div>
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