"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { fetchLearnerDashboardStats, type LearnerDashboardStats } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, BookOpen, Award, Trophy, Zap, Target, Play, ArrowRight, Calendar, Star, GraduationCap, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RecommendationsSection } from "@/components/features/dashboard/RecommendationsSection";
import { InsightsPanel } from "@/components/features/dashboard/InsightsPanel";

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

const ContinueLearningHeroSkeleton = () => (
  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Skeleton className="w-full lg:w-48 h-28 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CourseCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-14 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function LearnerDashboard() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<LearnerDashboardStats>({
    queryKey: [QUERY_KEYS.LEARNER_DASHBOARD_STATS],
    queryFn: () => fetchLearnerDashboardStats(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <PageWrapper title="My Learning Dashboard" description="Track your progress and continue learning.">
        {/* Continue Learning Hero Skeleton */}
        <ContinueLearningHeroSkeleton />
        
        {/* Stats Row Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Courses In Progress Skeleton */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
        </div>

        {/* Bottom Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="My Learning Dashboard" description="Track your progress and continue learning.">
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

  const continueLearning = stats?.continueLearning;
  const coursesInProgress = stats?.coursesInProgress || [];

  return (
    <PageWrapper title="My Learning Dashboard" description="Track your progress and continue learning.">
      {/* Continue Learning Hero Card */}
      {continueLearning ? (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Course Thumbnail */}
              <div className="w-full lg:w-48 h-28 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
                {continueLearning.courseThumbnail ? (
                  <Image
                    src={continueLearning.courseThumbnail}
                    alt={continueLearning.courseTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <GraduationCap className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Continue Learning</p>
                <h3 className="text-xl font-semibold truncate mb-2">
                  {continueLearning.courseTitle}
                </h3>
                
                {continueLearning.nextLesson && (
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium">Next:</span> {continueLearning.nextLesson.title}
                    <span className="text-muted-foreground/60"> in {continueLearning.nextLesson.moduleTitle}</span>
                  </p>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <Progress value={continueLearning.progressPercentage} className="h-2 flex-1 max-w-xs" />
                  <span className="text-sm font-medium">
                    {continueLearning.progressPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({continueLearning.completedLessons}/{continueLearning.totalLessons} lessons)
                  </span>
                </div>
                
                <Button asChild>
                  <Link href={`/learner/courses/${continueLearning.courseSlug}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : stats?.activeCourses === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey</h3>
            <p className="text-muted-foreground mb-4">
              Explore our catalog and enroll in courses to begin learning.
            </p>
            <Button asChild>
              <Link href="/learner/courses">
                Browse Courses
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Key Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <StatCard
          title="Active Courses"
          value={stats?.activeCourses || 0}
          icon={BookOpen}
          description="Currently enrolled"
        />
        <StatCard
          title="Completed"
          value={stats?.completedCourses || 0}
          icon={Award}
          description="Courses finished"
        />
        <StatCard
          title="Certificates"
          value={stats?.certificatesEarned || 0}
          icon={Trophy}
          description="Earned"
        />
        <StatCard
          title="Learning Streak"
          value={`${stats?.learningStreak || 0} days`}
          icon={Zap}
          description="Keep it up!"
        />
      </div>

      {/* Courses In Progress Section */}
      {coursesInProgress.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Courses In Progress</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/learner/courses">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesInProgress.slice(0, 6).map((course) => (
              <Link key={course.courseId} href={`/learner/courses/${course.courseSlug}`}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0 relative">
                        {course.courseThumbnail ? (
                          <Image
                            src={course.courseThumbnail}
                            alt={course.courseTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{course.courseTitle}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.completedLessons}/{course.totalLessons} lessons
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={course.progressPercentage} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium">{course.progressPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI-Powered Recommendations Section */}
      <RecommendationsSection limit={6} excludeEnrolled={true} />

      {/* Learning Insights Panel */}
      <div className="mt-6">
        <InsightsPanel />
      </div>

      {/* Bottom Section: Deadlines, Learning Paths, Achievements */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.upcomingDeadlines?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.upcomingDeadlines?.slice(0, 4).map((deadline, index) => (
                  <div key={index} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {deadline.course}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      {deadline.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        {/* Learning Paths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Learning Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.learningPaths?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.learningPaths?.slice(0, 3).map((path, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm gap-2">
                      <span className="font-medium truncate">{path.title}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {path.completedSteps}/{path.totalSteps}
                      </span>
                    </div>
                    <Progress value={path.progressPercentage} className="h-1.5" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No learning paths yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.recentAchievements?.length ?? 0) > 0 ? (
              <div className="space-y-3">
                {stats?.recentAchievements?.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.earnedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No achievements yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
