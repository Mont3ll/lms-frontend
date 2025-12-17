"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Link as LinkIcon,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Spinner } from "@/components/ui/spinner";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import {
  fetchCoursePrerequisites,
  createCoursePrerequisite,
  updateCoursePrerequisite,
  deleteCoursePrerequisite,
  fetchCourses,
} from "@/lib/api";
import type {
  CoursePrerequisite,
  CoursePrerequisiteCreateData,
  PrerequisiteType,
  Course,
} from "@/lib/types";

/** Props for the PrerequisiteManager component */
interface PrerequisiteManagerProps {
  /** Course ID to manage prerequisites for */
  courseId: string;
  /** Course slug (for display/linking) */
  courseSlug: string;
  /** Whether the user can edit prerequisites */
  canEdit?: boolean;
}

/** Prerequisite type options */
const PREREQUISITE_TYPES: { value: PrerequisiteType; label: string; description: string }[] = [
  {
    value: "REQUIRED",
    label: "Required",
    description: "Learner must complete this course before enrolling",
  },
  {
    value: "RECOMMENDED",
    label: "Recommended",
    description: "Suggested but not mandatory",
  },
  {
    value: "COREQUISITE",
    label: "Corequisite",
    description: "Should be taken alongside this course",
  },
];

/** Get badge variant based on prerequisite type */
const getPrerequisiteTypeBadge = (type: PrerequisiteType) => {
  switch (type) {
    case "REQUIRED":
      return "destructive";
    case "RECOMMENDED":
      return "secondary";
    case "COREQUISITE":
      return "outline";
    default:
      return "default";
  }
};

/**
 * PrerequisiteManager - Component for managing course prerequisites.
 *
 * Allows instructors and admins to add, edit, and remove course prerequisites.
 * Shows prerequisites with their type and minimum completion percentage.
 */
export const PrerequisiteManager: React.FC<PrerequisiteManagerProps> = ({
  courseId,
  courseSlug,
  canEdit = true,
}) => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPrerequisite, setEditingPrerequisite] = useState<CoursePrerequisite | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; prerequisite: CoursePrerequisite | null }>({
    isOpen: false,
    prerequisite: null,
  });

  // Form state for add/edit
  const [formData, setFormData] = useState<{
    prerequisite_course: string;
    prerequisite_type: PrerequisiteType;
    minimum_completion_percentage: number;
  }>({
    prerequisite_course: "",
    prerequisite_type: "REQUIRED",
    minimum_completion_percentage: 100,
  });

  // Fetch prerequisites for this course
  const {
    data: prerequisites,
    isLoading: isLoadingPrerequisites,
    error: prerequisitesError,
  } = useQuery({
    queryKey: ["coursePrerequisites", courseId],
    queryFn: () => fetchCoursePrerequisites(courseId),
    enabled: !!courseId,
  });

  // Fetch available courses for selection
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses", "published"],
    queryFn: () => fetchCourses({ status: "PUBLISHED", page_size: 100 }),
    enabled: isAddDialogOpen || !!editingPrerequisite,
  });

  // Filter out the current course and already-added prerequisites
  const availableCourses = coursesData?.results?.filter(
    (course: Course) =>
      course.id !== courseId &&
      !prerequisites?.some((p) => p.prerequisite_course === course.id)
  ) || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CoursePrerequisiteCreateData) =>
      createCoursePrerequisite(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coursePrerequisites", courseId] });
      toast.success("Prerequisite added successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to add prerequisite: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CoursePrerequisiteCreateData }) =>
      updateCoursePrerequisite(courseId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coursePrerequisites", courseId] });
      toast.success("Prerequisite updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update prerequisite: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoursePrerequisite(courseId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coursePrerequisites", courseId] });
      toast.success("Prerequisite removed successfully");
      setDeleteConfirm({ isOpen: false, prerequisite: null });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove prerequisite: ${error.message}`);
    },
  });

  const handleOpenAddDialog = useCallback(() => {
    setFormData({
      prerequisite_course: "",
      prerequisite_type: "REQUIRED",
      minimum_completion_percentage: 100,
    });
    setEditingPrerequisite(null);
    setIsAddDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((prerequisite: CoursePrerequisite) => {
    setFormData({
      prerequisite_course: prerequisite.prerequisite_course,
      prerequisite_type: prerequisite.prerequisite_type,
      minimum_completion_percentage: prerequisite.minimum_completion_percentage,
    });
    setEditingPrerequisite(prerequisite);
    setIsAddDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingPrerequisite(null);
    setFormData({
      prerequisite_course: "",
      prerequisite_type: "REQUIRED",
      minimum_completion_percentage: 100,
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.prerequisite_course) {
      toast.error("Please select a course");
      return;
    }

    const data: CoursePrerequisiteCreateData = {
      prerequisite_course: formData.prerequisite_course,
      prerequisite_type: formData.prerequisite_type,
      minimum_completion_percentage: formData.minimum_completion_percentage,
    };

    if (editingPrerequisite) {
      updateMutation.mutate({ id: editingPrerequisite.id, data });
    } else {
      createMutation.mutate(data);
    }
  }, [formData, editingPrerequisite, createMutation, updateMutation]);

  const handleDelete = useCallback((prerequisite: CoursePrerequisite) => {
    setDeleteConfirm({ isOpen: true, prerequisite });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm.prerequisite) {
      deleteMutation.mutate(deleteConfirm.prerequisite.id);
    }
  }, [deleteConfirm, deleteMutation]);

  if (isLoadingPrerequisites) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prerequisitesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load prerequisites</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Prerequisites
            {prerequisites && prerequisites.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {prerequisites.length}
              </Badge>
            )}
          </CardTitle>
          {canEdit && (
            <Button size="sm" onClick={handleOpenAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prerequisite
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!prerequisites || prerequisites.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No prerequisites defined</p>
              {canEdit && (
                <p className="text-sm mt-1">
                  Add prerequisites to specify courses learners should complete first.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Min. Completion</TableHead>
                  {canEdit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {prerequisites.map((prereq) => (
                  <TableRow key={prereq.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {prereq.prerequisite_course_title}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">
                          {courseSlug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={getPrerequisiteTypeBadge(prereq.prerequisite_type)}
                            >
                              {prereq.prerequisite_type_display}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {PREREQUISITE_TYPES.find(
                              (t) => t.value === prereq.prerequisite_type
                            )?.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      {prereq.minimum_completion_percentage}%
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEditDialog(prereq)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(prereq)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPrerequisite ? "Edit Prerequisite" : "Add Prerequisite"}
            </DialogTitle>
            <DialogDescription>
              {editingPrerequisite
                ? "Update the prerequisite settings."
                : "Select a course that learners should complete before this course."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prerequisite_course">Prerequisite Course</Label>
              <Select
                value={formData.prerequisite_course}
                onValueChange={(value) =>
                  setFormData({ ...formData, prerequisite_course: value })
                }
                disabled={!!editingPrerequisite}
              >
                <SelectTrigger id="prerequisite_course">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCourses ? (
                    <div className="flex items-center justify-center py-4">
                      <Spinner className="h-4 w-4" />
                    </div>
                  ) : editingPrerequisite ? (
                    <SelectItem value={editingPrerequisite.prerequisite_course}>
                      {editingPrerequisite.prerequisite_course_title}
                    </SelectItem>
                  ) : availableCourses.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No available courses
                    </div>
                  ) : (
                    availableCourses.map((course: Course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prerequisite_type">Prerequisite Type</Label>
              <Select
                value={formData.prerequisite_type}
                onValueChange={(value: PrerequisiteType) =>
                  setFormData({ ...formData, prerequisite_type: value })
                }
              >
                <SelectTrigger id="prerequisite_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREREQUISITE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <span>{type.label}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>{type.description}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_completion_percentage">
                Minimum Completion Percentage
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minimum_completion_percentage"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.minimum_completion_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_completion_percentage: Math.min(
                        100,
                        Math.max(0, parseInt(e.target.value) || 0)
                      ),
                    })
                  }
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Learners must complete at least this percentage of the prerequisite
                course.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !formData.prerequisite_course
              }
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : null}
              {editingPrerequisite ? "Update" : "Add"} Prerequisite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, prerequisite: null })}
        onConfirm={confirmDelete}
        title="Remove Prerequisite"
        description="Are you sure you want to remove this prerequisite? This will not affect learners who have already completed it."
        itemName={deleteConfirm.prerequisite?.prerequisite_course_title || ""}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};

export default PrerequisiteManager;
