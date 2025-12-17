"use client";
import React from "react";
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { StatCard } from "@/components/features/dashboard/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  Activity, 
  Plus, 
  BarChart3, 
  GraduationCap, 
  Clock,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  UserX,
  ArrowRight,
  Bell
} from "lucide-react";
import { fetchInstructorDashboardStats } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

export default function InstructorDashboard() {
  const router = useRouter();
  
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_DASHBOARD_STATS],
    queryFn: fetchInstructorDashboardStats,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Navigation handlers
  const handleCreateCourse = () => {
    router.push('/instructor/courses/new');
  };

  const handleViewCourses = () => {
    router.push('/instructor/courses');
  };

  const handleViewAnalytics = () => {
    router.push('/instructor/analytics');
  };

  const handleGradeAssignments = () => {
    router.push('/instructor/assessments');
  };

  if (isLoading) {
    return (
      <PageWrapper title="Instructor Dashboard" description="Monitor your courses, track student progress, and manage your teaching activities from one central location.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton key="skeleton-1" />
          <StatCardSkeleton key="skeleton-2" />
          <StatCardSkeleton key="skeleton-3" />
          <StatCardSkeleton key="skeleton-4" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="Instructor Dashboard" description="Monitor your courses, track student progress, and manage your teaching activities from one central location.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            Failed to load dashboard statistics. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title="Instructor Dashboard"
      description="Monitor your courses, track student progress, and manage your teaching activities from one central location."
    >
      {/* Urgent Alerts Section - Always at top if there are alerts */}
      {(stats?.urgentAlerts?.length ?? 0) > 0 && (
        <div className="mb-6">
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <Bell className="h-5 w-5" />
                Action Required
              </CardTitle>
              <CardDescription>Items that need your immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.urgentAlerts?.map((alert, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'high' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                          : alert.severity === 'medium'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(alert.actionUrl)}
                      className="shrink-0"
                    >
                      {alert.actionLabel}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          description="Courses you're teaching"
        />
        <StatCard
          title="Active Students"
          value={stats?.activeStudents || 0}
          icon={Users}
          description="Students across all courses"
        />
        <StatCard
          title="Pending Grading"
          value={stats?.pendingGrading || 0}
          icon={CheckSquare}
          description="Assessments to grade"
        />
        <StatCard
          title="Avg Completion"
          value={`${stats?.avgCompletionRate || 0}%`}
          icon={Activity}
          description="Average course completion"
        />
      </div>

      {/* Proactive Insights Row */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        {/* Courses Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Courses Needing Attention
            </CardTitle>
            <CardDescription>Courses that may need intervention</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.coursesNeedingAttention?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.coursesNeedingAttention?.slice(0, 4).map((course, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/instructor/courses/${course.courseSlug}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate flex-1">{course.courseTitle}</p>
                      <Badge 
                        variant={course.severity === 'high' ? 'destructive' : course.severity === 'medium' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {course.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {course.issues?.slice(0, 2).map((issue, issueIndex) => (
                        <div key={issueIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <TrendingDown className="h-3 w-3 text-orange-500" />
                          <span>{issue.message}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {course.activeEnrollments} active / {course.enrollments} total enrollments
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All courses are performing well!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* At-Risk Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              At-Risk Students
            </CardTitle>
            <CardDescription>Students who may need support</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.atRiskStudents?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.atRiskStudents?.slice(0, 4).map((student, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{student.studentName}</p>
                      <Badge 
                        variant={student.riskLevel === 'high' ? 'destructive' : student.riskLevel === 'medium' ? 'default' : 'secondary'}
                      >
                        {student.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{student.courseTitle}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {student.progress}% complete • {student.daysInactive} days inactive
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => window.location.href = `mailto:${student.studentEmail}?subject=Checking in on your progress in ${student.courseTitle}`}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All students are progressing well!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Overview and Performance Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Course Overview
            </CardTitle>
            <CardDescription>Your courses at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published Courses</span>
                <span className="text-lg font-semibold text-green-600">{stats?.publishedCourses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Draft Courses</span>
                <span className="text-lg font-semibold text-orange-600">{stats?.draftCourses || 0}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Enrollments</span>
                  <span className="text-sm font-medium">{stats?.totalEnrollments || 0}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Active Enrollments</span>
                  <span className="text-sm font-medium">{stats?.activeEnrollments || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Top performing courses</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.topCourses?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.topCourses?.slice(0, 4).map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.enrollments} students</p>
                    </div>
                    <div className="text-sm font-medium text-green-600 ml-2">
                      {course.completionRate}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No course data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Earnings from paid courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-2xl font-bold">${stats?.revenue?.thisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="text-sm font-medium">${stats?.revenue?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg per Course</span>
                <span className="text-sm font-medium">${stats?.revenue?.avgPerCourse || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <span className={`text-sm font-medium ${(stats?.revenue?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(stats?.revenue?.growth || 0) >= 0 ? '+' : ''}{stats?.revenue?.growth || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Deadlines Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student activity in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.recentActivity?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Assessments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.upcomingDeadlines?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.upcomingDeadlines?.slice(0, 4).map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{deadline.course}</p>
                    </div>
                    <div className="text-xs text-orange-600 ml-2 shrink-0">
                      {deadline.dueDate}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button 
                onClick={handleCreateCourse} 
                variant="outline" 
                className="w-full justify-start h-auto p-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Create New Course</p>
                    <p className="text-xs text-muted-foreground">Start building your next course</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={handleViewCourses} 
                variant="outline" 
                className="w-full justify-start h-auto p-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Manage Courses</p>
                    <p className="text-xs text-muted-foreground">View and edit your courses</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={handleGradeAssignments} 
                variant="outline" 
                className="w-full justify-start h-auto p-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Grade Assignments</p>
                    <p className="text-xs text-muted-foreground">Review pending submissions</p>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={handleViewAnalytics} 
                variant="outline" 
                className="w-full justify-start h-auto p-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4" />
                  <div className="text-left">
                    <p className="text-sm font-medium">View Analytics</p>
                    <p className="text-xs text-muted-foreground">Check course performance</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
