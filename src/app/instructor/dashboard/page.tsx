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
import { Users, BookOpen, CheckSquare, Activity, Plus, BarChart3 } from "lucide-react";
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
      <PageWrapper title="Instructor Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
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
      <PageWrapper title="Instructor Dashboard">
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
    <PageWrapper title="Instructor Dashboard">
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
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Top performing courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.topCourses?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.topCourses?.slice(0, 3).map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.enrollments} students</p>
                    </div>
                    <div className="text-sm font-medium text-green-600">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Assignments and assessments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.upcomingDeadlines?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.upcomingDeadlines?.slice(0, 4).map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">{deadline.course}</p>
                    </div>
                    <div className="text-xs text-orange-600">
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

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>Most active students this week</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.topStudents?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.topStudents?.slice(0, 4).map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.course}</p>
                    </div>
                    <div className="text-xs text-blue-600">
                      {student.hoursSpent}h
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No student activity data</p>
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

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Creation Progress</CardTitle>
            <CardDescription>Your course development activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Courses in Draft</span>
                <span className="text-sm font-medium">{stats?.contentProgress?.drafts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published this Month</span>
                <span className="text-sm font-medium">{stats?.contentProgress?.publishedThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Modules Created</span>
                <span className="text-sm font-medium">{stats?.contentProgress?.modulesCreated || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Content Items</span>
                <span className="text-sm font-medium">{stats?.contentProgress?.contentItems || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
