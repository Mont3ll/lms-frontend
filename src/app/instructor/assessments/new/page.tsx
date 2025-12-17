"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchInstructorCourses, createAssessment, AssessmentData } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

interface AssessmentFormData {
  course: string;
  title: string;
  description: string;
  assessment_type: "QUIZ" | "EXAM" | "ASSIGNMENT";
  grading_type: "AUTO" | "MANUAL" | "HYBRID";
  due_date: string;
  time_limit_minutes: number | null;
  max_attempts: number;
  pass_mark_percentage: number;
  show_results_immediately: boolean;
  shuffle_questions: boolean;
  is_published: boolean;
}

export default function NewAssessmentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AssessmentFormData>({
    course: "",
    title: "",
    description: "",
    assessment_type: "QUIZ",
    grading_type: "AUTO",
    due_date: "",
    time_limit_minutes: null,
    max_attempts: 1,
    pass_mark_percentage: 50,
    show_results_immediately: true,
    shuffle_questions: false,
    is_published: false,
  });

  // Fetch instructor courses for the dropdown
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: [QUERY_KEYS.INSTRUCTOR_COURSES],
    queryFn: () => fetchInstructorCourses(),
  });

  const createMutation = useMutation({
    mutationFn: (data: AssessmentData) => createAssessment(data),
    onSuccess: (assessment) => {
      toast.success("Assessment created successfully");
      router.push(`/instructor/assessments/${assessment.id}/edit`);
    },
    onError: (error: Error & { response?: { data?: { detail?: string } } }) => {
      setError(error.response?.data?.detail || "Failed to create assessment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.course || !formData.title) {
      setError("Course and title are required");
      return;
    }

    const submitData = {
      ...formData,
      due_date: formData.due_date || null,
      time_limit_minutes: formData.time_limit_minutes || null,
    };

    createMutation.mutate(submitData);
  };

  const handleInputChange = (field: keyof AssessmentFormData, value: AssessmentFormData[keyof AssessmentFormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PageWrapper
      title="Create New Assessment"
      description="Set up a new quiz, exam, or assignment with custom settings and grading options."
      actions={
        <Button asChild variant="outline">
          <Link href="/instructor/assessments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Link>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the basic details for your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleInputChange("course", value)}
                  disabled={coursesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesData?.results?.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter assessment title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter assessment description (optional)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment_type">Assessment Type</Label>
                  <Select
                    value={formData.assessment_type}
                    onValueChange={(value) => handleInputChange("assessment_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grading_type">Grading Type</Label>
                  <Select
                    value={formData.grading_type}
                    onValueChange={(value) => handleInputChange("grading_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">Automatic</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure assessment rules and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    min="0"
                    value={formData.time_limit_minutes || ""}
                    onChange={(e) => handleInputChange("time_limit_minutes", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    min="0"
                    value={formData.max_attempts}
                    onChange={(e) => handleInputChange("max_attempts", parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass_mark">Pass Mark (%)</Label>
                <Input
                  id="pass_mark"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.pass_mark_percentage}
                  onChange={(e) => handleInputChange("pass_mark_percentage", parseInt(e.target.value) || 50)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show_results">Show Results Immediately</Label>
                    <p className="text-sm text-muted-foreground">
                      Show score and feedback right after submission
                    </p>
                  </div>
                  <Switch
                    id="show_results"
                    checked={formData.show_results_immediately}
                    onCheckedChange={(checked) => handleInputChange("show_results_immediately", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      Randomize question order for each attempt
                    </p>
                  </div>
                  <Switch
                    id="shuffle_questions"
                    checked={formData.shuffle_questions}
                    onCheckedChange={(checked) => handleInputChange("shuffle_questions", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_published">Publish Assessment</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this assessment visible to students
                    </p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" asChild className="cursor-pointer">
              <Link href="/instructor/assessments">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="cursor-pointer">
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}