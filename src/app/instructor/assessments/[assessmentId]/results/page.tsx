"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Users,
  TrendingUp,
  Award,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAssessmentDetails,
  fetchAssessmentAttemptsForAssessment,
  gradeManualAttempt,
} from "@/lib/api";
import { Assessment, AssessmentAttempt } from "@/lib/types";

interface AttemptStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
  completionRate: number;
}

interface GradeDialogProps {
  attempt: AssessmentAttempt;
  assessmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAttempt: AssessmentAttempt) => void;
}

function GradeDialog({ attempt, assessmentId, isOpen, onClose, onUpdate }: GradeDialogProps) {
  const [score, setScore] = useState(attempt.score?.toString() || "");
  const [feedback, setFeedback] = useState(attempt.feedback || "");
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when attempt changes to prevent stale data
  useEffect(() => {
    setScore(attempt.score?.toString() || "");
    setFeedback(attempt.feedback || "");
  }, [attempt.id, attempt.score, attempt.feedback]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedAttempt = await gradeManualAttempt(assessmentId, String(attempt.id), {
        score: parseFloat(score),
        feedback,
      });
      onUpdate(updatedAttempt);
      onClose();
      toast.success("Grade updated successfully");
    } catch {
      toast.error("Failed to update grade");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grade Attempt</DialogTitle>
          <DialogDescription>
            Update the score and feedback for {attempt.user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score" className="text-right">
              Score
            </Label>
            <Input
              id="score"
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="col-span-3"
              placeholder="Enter score"
              min="0"
              max={attempt.max_score || 100}
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feedback" className="text-right">
              Feedback
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="col-span-3"
              placeholder="Enter feedback (optional)"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="cursor-pointer">
              {isLoading ? "Updating..." : "Update Grade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions
const getStatusBadge = (status: string) => {
  switch (status) {
    case "SUBMITTED":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Submitted
        </Badge>
      );
    case "GRADED":
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Graded
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          In Progress
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPassBadge = (isPassed: boolean | null | undefined) => {
  if (isPassed === null || isPassed === undefined) {
    return (
      <Badge variant="secondary" className="text-xs">
        Pending
      </Badge>
    );
  }
  return isPassed ? (
    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
      Passed
    </Badge>
  ) : (
    <Badge variant="destructive" className="text-xs">
      Failed
    </Badge>
  );
};

// Interface for grading data
interface GradeAttemptData {
  score: number;
  feedback?: string;
}

// Reference: GradeAttemptData is used by the gradeManualAttempt API function
void ({} as GradeAttemptData);

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [stats, setStats] = useState<AttemptStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Grading dialog
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<AssessmentAttempt | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load assessment details and all attempts
      const [assessmentData, attemptsResponse] = await Promise.all([
        fetchAssessmentDetails(assessmentId),
        fetchAssessmentAttemptsForAssessment(assessmentId),
      ]);
      
      setAssessment(assessmentData);
      setAttempts(attemptsResponse);
      setTotalPages(1); // No server-side pagination, all data loaded at once

      // Calculate statistics from all attempts
      calculateStats(attemptsResponse);
    } catch (err) {
      setError("Failed to load assessment results");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadData();
  }, [assessmentId, loadData]);

  const calculateStats = (attemptsList: AssessmentAttempt[]) => {
    if (!attemptsList || attemptsList.length === 0) {
      setStats({
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        averageTime: 0,
        completionRate: 0,
      });
      return;
    }

    const completedAttempts = attemptsList.filter(
      (attempt) => attempt.status === "SUBMITTED" || attempt.status === "GRADED"
    );

    const gradedAttempts = attemptsList.filter(
      (attempt) => attempt.score !== null && attempt.score !== undefined
    );

    const passedAttempts = attemptsList.filter(
      (attempt) => attempt.is_passed === true
    );

    const averageScore = gradedAttempts.length > 0
      ? gradedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / gradedAttempts.length
      : 0;

    const passRate = gradedAttempts.length > 0
      ? (passedAttempts.length / gradedAttempts.length) * 100
      : 0;

    const completionRate = attemptsList.length > 0
      ? (completedAttempts.length / attemptsList.length) * 100
      : 0;

    // Calculate average time (in minutes)
    const attemptsWithTime = completedAttempts.filter(
      (attempt) => attempt.start_time && attempt.end_time
    );

    const averageTime = attemptsWithTime.length > 0
      ? attemptsWithTime.reduce((sum, attempt) => {
          const start = new Date(attempt.start_time);
          const end = new Date(attempt.end_time!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0) / attemptsWithTime.length
      : 0;

    setStats({
      totalAttempts: attemptsList.length,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      averageTime: Math.round(averageTime),
      completionRate: Math.round(completionRate * 100) / 100,
    });
  };

  const handleGradeAttempt = (attempt: AssessmentAttempt) => {
    setSelectedAttempt(attempt);
    setGradeDialogOpen(true);
  };

  const handleAttemptUpdate = (updatedAttempt: AssessmentAttempt) => {
    setAttempts(attempts.map(attempt => 
      attempt.id === updatedAttempt.id ? updatedAttempt : attempt
    ));
    calculateStats(attempts.map(attempt => 
      attempt.id === updatedAttempt.id ? updatedAttempt : attempt
    ));
  };

  const handleViewAttempt = (attemptId: string) => {
    router.push(`/instructor/assessments/${assessmentId}/attempts/${attemptId}`);
  };

  const handleExportResults = () => {
    if (filteredAttempts.length === 0) {
      toast.error("No results to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Student Email",
      "Status",
      "Score",
      "Max Score",
      "Percentage",
      "Result",
      "Started",
      "Completed",
      "Time Taken (minutes)",
      "Feedback",
    ];

    // Map attempts to CSV rows
    const rows = filteredAttempts.map((attempt) => {
      const startTime = new Date(attempt.start_time);
      const endTime = attempt.end_time ? new Date(attempt.end_time) : null;
      const timeTaken = endTime
        ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
        : "";
      const maxScore = attempt.max_score || assessment?.total_points || 0;
      const percentage =
        attempt.score !== null && attempt.score !== undefined
          ? Math.round((attempt.score / maxScore) * 100)
          : "";
      const result =
        attempt.is_passed === true
          ? "Passed"
          : attempt.is_passed === false
            ? "Failed"
            : "Pending";

      return [
        attempt.user.email,
        attempt.status,
        attempt.score ?? "",
        maxScore,
        percentage ? `${percentage}%` : "",
        result,
        startTime.toLocaleString(),
        endTime ? endTime.toLocaleString() : "",
        timeTaken,
        attempt.feedback || "",
      ];
    });

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape cells that contain commas, quotes, or newlines
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const fileName = `${assessment?.title?.replace(/[^a-z0-9]/gi, "_") || "assessment"}_results_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredAttempts.length} results to CSV`);
  };

  const filteredAttempts = (attempts || []).filter((attempt) => {
    const matchesSearch = attempt.user.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || attempt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assessment Results</h1>
            <p className="text-muted-foreground">{assessment?.title}</p>
          </div>
        </div>
        <Button onClick={handleExportResults} variant="outline" className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <Progress value={stats.averageScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.passRate}%</div>
              <Progress value={stats.passRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageTime}m</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <Progress value={stats.completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="GRADED">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attempts</CardTitle>
          <CardDescription>
            View and manage individual student attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">
                    {attempt.user.email}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(attempt.status)}
                  </TableCell>
                  <TableCell>
                    {attempt.score !== null && attempt.score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {attempt.score}/{attempt.max_score || assessment?.total_points}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({Math.round((attempt.score / (attempt.max_score || assessment?.total_points || 1)) * 100)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not graded</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPassBadge(attempt.is_passed)}
                  </TableCell>
                  <TableCell>
                    {new Date(attempt.start_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {attempt.end_time ? (
                      new Date(attempt.end_time).toLocaleString()
                    ) : (
                      <span className="text-muted-foreground">In progress</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewAttempt(String(attempt.id))}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {(attempt.status === "SUBMITTED" || attempt.status === "GRADED") && (
                          <DropdownMenuItem onClick={() => handleGradeAttempt(attempt)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Grade/Edit
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAttempts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No attempts found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Grade Dialog */}
      {selectedAttempt && (
        <GradeDialog
          attempt={selectedAttempt}
          assessmentId={assessmentId}
          isOpen={gradeDialogOpen}
          onClose={() => {
            setGradeDialogOpen(false);
            setSelectedAttempt(null);
          }}
          onUpdate={handleAttemptUpdate}
        />
      )}
    </div>
  );
}