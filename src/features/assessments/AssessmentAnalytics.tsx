'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  BarChart3,
  Download
} from 'lucide-react';

interface AssessmentAnalyticsProps {
  assessmentId: string;
}

interface AnalyticsData {
  overview: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
    completionRate: number;
  };
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  questionAnalytics: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    averageScore: number;
    difficultyIndex: number;
    discriminationIndex: number;
    incorrectAnswers: Array<{
      option: string;
      count: number;
      percentage: number;
    }>;
  }>;
  timeAnalytics: Array<{
    timeRange: string;
    averageScore: number;
    attemptCount: number;
  }>;
  studentPerformance: Array<{
    studentId: string;
    studentName: string;
    score: number;
    timeSpent: number;
    attemptDate: string;
    status: 'PASSED' | 'FAILED' | 'IN_PROGRESS';
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AssessmentAnalytics({ assessmentId }: AssessmentAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['assessment-analytics', assessmentId, timeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${assessmentId}/analytics?period=${timeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data: AnalyticsData = await response.json();
      return data;
    },
  });

  const downloadReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/analytics/export?format=${format}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-analytics-${assessmentId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Failed to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  const { overview, scoreDistribution, questionAnalytics, timeAnalytics, studentPerformance } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assessment Analytics</h1>
        <div className="flex gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => downloadReport('pdf')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
          <Button onClick={() => downloadReport('excel')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Excel Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold">{overview.totalAttempts}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{overview.averageScore.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold">{overview.passRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold">{Math.round(overview.averageTimeSpent)}m</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{overview.completionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Score Distribution</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="time">Time Trends</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Score Ranges</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      dataKey="count"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.range}: ${entry.percentage}%`}
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {questionAnalytics.map((question, index) => (
                  <div key={question.questionId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          Question {index + 1}: {question.questionText}
                        </h4>
                        <Badge variant="outline">{question.questionType}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-lg font-bold">{question.averageScore.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Difficulty Index</p>
                        <Progress value={question.difficultyIndex * 100} className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {question.difficultyIndex < 0.3 ? 'Hard' : 
                           question.difficultyIndex < 0.7 ? 'Medium' : 'Easy'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Discrimination Index</p>
                        <Progress value={question.discriminationIndex * 100} className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">
                          {question.discriminationIndex > 0.4 ? 'Excellent' :
                           question.discriminationIndex > 0.3 ? 'Good' :
                           question.discriminationIndex > 0.2 ? 'Fair' : 'Poor'}
                        </p>
                      </div>
                    </div>

                    {question.incorrectAnswers.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Common Incorrect Answers</h5>
                        <div className="space-y-2">
                          {question.incorrectAnswers.map((answer, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span>{answer.option}</span>
                              <Badge variant="secondary">{answer.percentage.toFixed(1)}%</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timeAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeRange" />
                  <YAxis yAxisId="score" orientation="left" />
                  <YAxis yAxisId="attempts" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="score"
                    type="monotone" 
                    dataKey="averageScore" 
                    stroke="#3B82F6" 
                    name="Average Score (%)"
                  />
                  <Bar 
                    yAxisId="attempts"
                    dataKey="attemptCount" 
                    fill="#10B981" 
                    name="Number of Attempts"
                    opacity={0.6}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Student Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">Score</th>
                      <th className="text-left p-2">Time Spent</th>
                      <th className="text-left p-2">Attempt Date</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPerformance.map((student) => (
                      <tr key={student.studentId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{student.studentName}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{student.score.toFixed(1)}%</span>
                            <Progress value={student.score} className="w-20" />
                          </div>
                        </td>
                        <td className="p-2">{Math.round(student.timeSpent)}m</td>
                        <td className="p-2">
                          {new Date(student.attemptDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={student.status === 'PASSED' ? 'default' : 
                                   student.status === 'FAILED' ? 'destructive' : 'secondary'}
                          >
                            {student.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}