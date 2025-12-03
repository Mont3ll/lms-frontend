"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { fetchLearnerDashboardStats } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BookOpen, Award, TrendingUp, Clock, Target, Trophy, Brain, Calendar, CheckCircle, BarChart3, Zap } from "lucide-react";

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

export default function LearnerDashboard() {
  // Interfaces for dashboard stats
  interface LearningPathProgress {
    title: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
  }

  interface RecentActivity {
    description: string;
    timestamp: string;
  }

  interface UpcomingDeadline {
    title: string;
    course: string;
    dueDate: string;
  }

  interface RecentAchievement {
    title: string;
    earnedDate: string;
  }

  interface DashboardStats {
    activeCourses: number;
    completedCourses: number;
    certificatesEarned: number;
    learningStreak: number;
    overallProgress: number;
    totalStudyHours: number;
    lessonsCompleted: number;
    averageAssessmentScore: number;
    weeklyLessonsCompleted?: number;
    weeklyAssessmentsTaken?: number;
    weeklyStudyHours?: number;
    learningPaths?: LearningPathProgress[];
    recentActivity?: RecentActivity[];
    upcomingDeadlines?: UpcomingDeadline[];
    recentAchievements?: RecentAchievement[];
  }

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<DashboardStats>({
    queryKey: [QUERY_KEYS.LEARNER_DASHBOARD_STATS],
    queryFn: fetchLearnerDashboardStats,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <PageWrapper title="My Learning Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="My Learning Dashboard">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            Failed to load your learning dashboard. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Learning Dashboard">
      {/* Primary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Courses"
          value={stats?.activeCourses || 0}
          icon={BookOpen}
          description="Courses in progress"
        />
        <StatCard
          title="Completed Courses"
          value={stats?.completedCourses || 0}
          icon={Award}
          description="Successfully completed"
        />
        <StatCard
          title="Certificates Earned"
          value={stats?.certificatesEarned || 0}
          icon={Trophy}
          description="Achievement certificates"
        />
        <StatCard
          title="Learning Streak"
          value={`${stats?.learningStreak || 0} days`}
          icon={Zap}
          description="Consecutive learning days"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <StatCard
          title="Overall Progress"
          value={`${stats?.overallProgress || 0}%`}
          icon={TrendingUp}
          description="Across all courses"
        />
        <StatCard
          title="Study Time"
          value={`${stats?.totalStudyHours || 0}h`}
          icon={Clock}
          description="Total hours logged"
        />
        <StatCard
          title="Lessons Completed"
          value={stats?.lessonsCompleted || 0}
          icon={CheckCircle}
          description="Individual lessons finished"
        />
        <StatCard
          title="Avg Assessment Score"
          value={`${stats?.averageAssessmentScore || 0}%`}
          icon={BarChart3}
          description="Quiz & exam performance"
        />
      </div>

      {/* Learning Paths Progress */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Learning Paths Progress</CardTitle>
            <CardDescription>Your active learning journey pathways</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.learningPaths?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {stats?.learningPaths?.slice(0, 4).map((path, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{path.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {path.completedSteps} of {path.totalSteps} steps completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{path.progressPercentage}%</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${path.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No learning paths started yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week&apos;s Goals</CardTitle>
            <CardDescription>Your learning objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Complete 3 lessons</span>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    {stats?.weeklyLessonsCompleted || 0}/3
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(((stats?.weeklyLessonsCompleted || 0) / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Take 2 assessments</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">
                    {stats?.weeklyAssessmentsTaken || 0}/2
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(((stats?.weeklyAssessmentsTaken || 0) / 2) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Study 5 hours</span>
                  </div>
                  <span className="text-xs font-medium text-orange-600">
                    {(stats?.weeklyStudyHours || 0).toFixed(1)}/5h
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(((stats?.weeklyStudyHours || 0) / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.recentActivity?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Assignments and assessments due soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.upcomingDeadlines?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {stats?.upcomingDeadlines?.slice(0, 3).map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.course}
                      </p>
                    </div>
                    <p className="text-sm text-orange-600">{deadline.dueDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Certificates and milestones earned</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.recentAchievements?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.recentAchievements?.slice(0, 4).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.earnedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Trophy className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No achievements yet</p>
                <p className="text-xs text-muted-foreground">Complete courses to earn certificates!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
