"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FolderKanban,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  BookOpen,
  Layers,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchLearningPathDetails,
  updateLearningPath,
  addLearningPathStep,
  deleteLearningPathStep,
  reorderLearningPathSteps,
  fetchCourses,
  getApiErrorMessage,
} from "@/lib/api";
import { LearningPath, LearningPathStep, Course } from "@/lib/types";

export default function EditLearningPathPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Learning path state
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [isSaving, setIsSaving] = useState(false);

  // Steps state
  const [steps, setSteps] = useState<LearningPathStep[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  // Add step dialog state
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [stepIsRequired, setStepIsRequired] = useState(true);

  // Delete step dialog state
  const [deleteStepDialogOpen, setDeleteStepDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<LearningPathStep | null>(null);
  const [isDeletingStep, setIsDeletingStep] = useState(false);

  // Load learning path details
  const loadLearningPath = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchLearningPathDetails(slug);
      setLearningPath(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setStatus(data.status);
      setSteps(data.steps || []);
    } catch (err) {
      console.error("Error loading learning path:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadLearningPath();
  }, [loadLearningPath]);

  // Load available courses for add step dialog
  const loadAvailableCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await fetchCourses({ status: "PUBLISHED" });
      // Filter out courses that are already steps
      const existingCourseIds = new Set(
        steps
          .filter((s) => s.content_type_name === "course")
          .map((s) => s.content_object?.data?.id)
      );
      const filteredCourses = response.results.filter(
        (course) => !existingCourseIds.has(course.id)
      );
      setAvailableCourses(filteredCourses);
    } catch (err) {
      console.error("Error loading courses:", err);
      toast.error("Failed to load available courses");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Save learning path details
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateLearningPath(slug, {
        title: title.trim(),
        description: description.trim() || null,
        status,
      });
      setLearningPath(updated);
      toast.success("Learning path updated successfully");
      
      // If slug changed, redirect to new URL
      if (updated.slug !== slug) {
        router.replace(`/instructor/learning-paths/${updated.slug}`);
      }
    } catch (err) {
      console.error("Error updating learning path:", err);
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Open add step dialog
  const handleOpenAddStepDialog = () => {
    setSelectedCourseId("");
    setStepIsRequired(true);
    setAddStepDialogOpen(true);
    loadAvailableCourses();
  };

  // Add step
  const handleAddStep = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    setIsAddingStep(true);
    try {
      // Backend accepts content_type_id as either integer PK or string model name
      await addLearningPathStep(slug, {
        content_type_id: "course", // String model name - backend resolves to ContentType
        object_id: selectedCourseId,
        is_required: stepIsRequired,
        order: steps.length + 1,
      });
      
      // Reload to get updated steps with proper serialization
      await loadLearningPath();
      toast.success("Step added successfully");
      setAddStepDialogOpen(false);
    } catch (err) {
      console.error("Error adding step:", err);
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsAddingStep(false);
    }
  };

  // Delete step
  const handleDeleteStepClick = (step: LearningPathStep) => {
    setStepToDelete(step);
    setDeleteStepDialogOpen(true);
  };

  const handleDeleteStepConfirm = async () => {
    if (!stepToDelete) return;

    setIsDeletingStep(true);
    try {
      await deleteLearningPathStep(slug, stepToDelete.id);
      setSteps((prev) => prev.filter((s) => s.id !== stepToDelete.id));
      toast.success("Step removed successfully");
    } catch (err) {
      console.error("Error deleting step:", err);
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeletingStep(false);
      setDeleteStepDialogOpen(false);
      setStepToDelete(null);
    }
  };

  // Move step up/down
  const handleMoveStep = async (stepId: string, direction: "up" | "down") => {
    const currentIndex = steps.findIndex((s) => s.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    // Optimistically update UI
    const newSteps = [...steps];
    [newSteps[currentIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[currentIndex]];
    setSteps(newSteps);

    setIsReordering(true);
    try {
      await reorderLearningPathSteps(
        slug,
        newSteps.map((s) => s.id)
      );
    } catch (err) {
      console.error("Error reordering steps:", err);
      toast.error(getApiErrorMessage(err));
      // Revert on error
      setSteps(steps);
    } finally {
      setIsReordering(false);
    }
  };

  const getStepTitle = (step: LearningPathStep): string => {
    if (step.content_object?.data) {
      return (step.content_object.data as { title?: string }).title || "Untitled";
    }
    return "Untitled Step";
  };

  const getStepIcon = (typeName: string) => {
    if (typeName === "course") {
      return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
    if (typeName === "module") {
      return <Layers className="h-4 w-4 text-muted-foreground" />;
    }
    return <BookOpen className="h-4 w-4 text-muted-foreground" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper
        title="Edit Learning Path"
        description="Edit the details and manage steps for this learning path."
        actions={
          <Button variant="outline" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        }
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <PageWrapper
        title="Edit Learning Path"
        description="Edit the details and manage steps for this learning path."
        actions={
          <Link href="/instructor/learning-paths">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
        }
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadLearningPath} variant="outline" className="mt-4 cursor-pointer">
          Try Again
        </Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={learningPath?.title || "Edit Learning Path"}
      description="Edit the details and manage steps for this learning path."
      actions={
        <div className="flex gap-2">
          <Link href="/instructor/learning-paths">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              Path Details
            </CardTitle>
            <CardDescription>
              Basic information about this learning path
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter learning path title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what learners will achieve..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => setStatus(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Steps Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Learning Path Steps</CardTitle>
              <CardDescription>
                Add and organize the courses in this learning path
              </CardDescription>
            </div>
            <Button onClick={handleOpenAddStepDialog} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </CardHeader>
          <CardContent>
            {steps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No steps added yet</p>
                <p className="text-sm">
                  Add courses to create a structured learning journey
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-pointer"
                        disabled={index === 0 || isReordering}
                        onClick={() => handleMoveStep(step.id, "up")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 cursor-pointer"
                        disabled={index === steps.length - 1 || isReordering}
                        onClick={() => handleMoveStep(step.id, "down")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <GripVertical className="h-5 w-5 text-muted-foreground/50" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground w-8">
                      {index + 1}.
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStepIcon(step.content_type_name)}
                        <span className="font-medium truncate">
                          {getStepTitle(step)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {step.content_type_name}
                        </Badge>
                        {!step.is_required && (
                          <Badge variant="secondary" className="text-xs">
                            Optional
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDeleteStepClick(step)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={addStepDialogOpen} onOpenChange={setAddStepDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Course to Learning Path</DialogTitle>
            <DialogDescription>
              Select a published course to add as a step in this learning path.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course</Label>
              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No available courses to add. All published courses are already in this path.
                </p>
              ) : (
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="required"
                checked={stepIsRequired}
                onChange={(e) => setStepIsRequired(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="required" className="text-sm font-normal">
                This step is required
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddStepDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStep}
              disabled={!selectedCourseId || isAddingStep}
              className="cursor-pointer"
            >
              {isAddingStep ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Confirmation Dialog */}
      <AlertDialog open={deleteStepDialogOpen} onOpenChange={setDeleteStepDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{stepToDelete ? getStepTitle(stepToDelete) : ""}&quot; 
              from this learning path? This will not delete the course itself.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingStep} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStepConfirm}
              disabled={isDeletingStep}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeletingStep ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
