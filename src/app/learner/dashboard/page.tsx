"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import charting library if used (e.g., Recharts)
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Import other necessary components (Progress, Button, etc.)

// Assume API functions and types exist
// import { useQuery } from "@tanstack/react-query";
// import { fetchDashboardStats } from "@/lib/api";
// import { QUERY_KEYS } from "@/lib/constants";

export default function LearnerDashboard() {
  // Example: Fetch dashboard data
  // const { data: stats, isLoading, error } = useQuery({
  //   queryKey: [QUERY_KEYS.DASHBOARD_STATS], // Define appropriate query key
  //   queryFn: fetchDashboardStats,
  // });

  // Placeholder Data
  const isLoading = false; // Simulate loading state
  const stats = {
    activeCourses: 3,
    completedCourses: 5,
    certificatesEarned: 4,
    upcomingDeadlines: 2,
    // Add data for charts/progress
    courseProgress: [
      { name: "Intro to React", progress: 75 },
      { name: "Advanced TypeScript", progress: 40 },
      { name: "Data Structures", progress: 15 },
    ],
  };

  if (isLoading) {
    return <div>Loading Dashboard...</div>; // Add Skeleton components
  }

  // if (error) {
  //   return <div>Error loading dashboard data.</div>;
  // }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            {/* Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeCourses ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Courses
            </CardTitle>
            {/* Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completedCourses ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
        {/* Add more cards for certificates, deadlines etc. */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            {/* Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.certificatesEarned ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Earned so far</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Deadlines
            </CardTitle>
            {/* Icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.upcomingDeadlines ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Assessments due soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>
            Your progress in currently active courses.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {stats.courseProgress.map((course) => (
            <div
              key={course.name}
              className="flex items-center justify-between gap-4"
            >
              <span className="font-medium flex-1 truncate">{course.name}</span>
              <div className="w-32">
                {" "}
                {/* Fixed width for progress bar */}
                {/* Shadcn Progress component */}
                {/* <Progress value={course.progress} className="h-2" /> */}
                <div className="h-2 w-full bg-secondary rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted-foreground w-10 text-right">
                {course.progress}%
              </span>
            </div>
          ))}
          {stats.courseProgress.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No active courses found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Optional: Activity Feed or Chart */}
      {/* <Card>
        <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
            Chart placeholder
            <div className="h-[300px] bg-secondary rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Activity Chart Area</p>
            </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
