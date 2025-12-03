'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BookOpen, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { formatPercentage } from '@/lib/analytics-utils';

interface CompletionData {
  overallCompletion: number;
  courseCompletions: Array<{
    courseId: string;
    courseName: string;
    completionRate: number;
    totalStudents: number;
    completedStudents: number;
    avgTimeToComplete: number;
  }>;
  completionTrends: Array<{
    date: string;
    completionRate: number;
    newCompletions: number;
  }>;
  completionByCategory: Array<{
    category: string;
    completionRate: number;
    count: number;
  }>;
}

interface CompletionChartProps {
  data: CompletionData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function CompletionChart({ data }: CompletionChartProps) {
  const getCompletionLevel = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (rate >= 60) return { label: 'Good', color: 'bg-blue-500' };
    if (rate >= 40) return { label: 'Fair', color: 'bg-yellow-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };

  const completionLevel = getCompletionLevel(data.overallCompletion);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(data.overallCompletion)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${completionLevel.color}`} />
              <span className="text-sm text-muted-foreground">{completionLevel.label}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performing Course</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...data.courseCompletions.map(c => c.completionRate)).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.courseCompletions.find(c => 
                c.completionRate === Math.max(...data.courseCompletions.map(c => c.completionRate))
              )?.courseName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.courseCompletions.reduce((sum, c) => sum + c.completedStudents, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Complete</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.courseCompletions.reduce((sum, c) => sum + c.avgTimeToComplete, 0) / data.courseCompletions.length)}d
            </div>
            <p className="text-xs text-muted-foreground">
              Average across courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.courseCompletions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="courseName" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion Rate']}
                />
                <Bar dataKey="completionRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Completion by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.completionByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, completionRate }) => `${category}: ${completionRate.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="completionRate"
                >
                  {data.completionByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.completionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completionRate" fill="#8884d8" name="Completion Rate %" />
              <Bar dataKey="newCompletions" fill="#82ca9d" name="New Completions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Course List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Completion Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.courseCompletions.map((course) => (
              <div key={course.courseId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{course.courseName}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{course.completedStudents} / {course.totalStudents} students</span>
                    <span>Avg: {course.avgTimeToComplete} days</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={course.completionRate} className="h-2" />
                  </div>
                  <Badge 
                    variant={course.completionRate >= 70 ? "default" : course.completionRate >= 50 ? "secondary" : "destructive"}
                  >
                    {formatPercentage(course.completionRate)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}