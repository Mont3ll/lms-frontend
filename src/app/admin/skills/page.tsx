"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchSkills,
  fetchSkillHierarchy,
  createSkill,
  updateSkill,
  deleteSkill,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { DataTable, FilterConfig } from "@/components/features/common/DataTable";
import { createColumns } from "./_components/columns";
import { SkillFormDialog } from "./_components/SkillFormDialog";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle, FolderTree } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import type { Skill, SkillListItem, SkillCreateUpdateData } from "@/lib/types";

/** Filter configurations for the skills data table */
const skillFilters: FilterConfig[] = [
  {
    columnId: "category",
    label: "Category",
    options: [
      { label: "Technical", value: "TECHNICAL" },
      { label: "Soft Skills", value: "SOFT" },
      { label: "Domain", value: "DOMAIN" },
      { label: "Language", value: "LANGUAGE" },
      { label: "Methodology", value: "METHODOLOGY" },
      { label: "Tool", value: "TOOL" },
    ],
  },
  {
    columnId: "difficulty_level",
    label: "Difficulty",
    options: [
      { label: "Beginner", value: "beginner" },
      { label: "Intermediate", value: "intermediate" },
      { label: "Advanced", value: "advanced" },
    ],
  },
];

export default function SkillsManagementPage() {
  const queryClient = useQueryClient();
  
  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    skill: SkillListItem | null;
  }>({ isOpen: false, skill: null });

  // Fetch skills list
  const {
    data: skillsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.SKILLS],
    queryFn: () => fetchSkills({ page_size: 100 }),
  });

  // Fetch skill hierarchy for parent selection
  const { data: hierarchyData } = useQuery({
    queryKey: [QUERY_KEYS.SKILLS, "hierarchy"],
    queryFn: fetchSkillHierarchy,
    enabled: isFormOpen,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: SkillCreateUpdateData) => createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SKILLS] });
      toast.success("Skill created successfully");
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(`Failed to create skill: ${getApiErrorMessage(error)}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<SkillCreateUpdateData> }) =>
      updateSkill(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SKILLS] });
      toast.success("Skill updated successfully");
      handleCloseForm();
    },
    onError: (error) => {
      toast.error(`Failed to update skill: ${getApiErrorMessage(error)}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteSkill(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SKILLS] });
      toast.success("Skill deleted successfully");
      setDeleteConfirm({ isOpen: false, skill: null });
    },
    onError: (error) => {
      toast.error(`Failed to delete skill: ${getApiErrorMessage(error)}`);
    },
  });

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingSkill(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((skill: SkillListItem) => {
    // Fetch full skill details for editing
    // For now, create a partial Skill object from SkillListItem
    setEditingSkill({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: "", // Not available in SkillListItem
      category: skill.category,
      category_display: skill.category_display,
      parent: skill.parent,
      parent_name: skill.parent_name,
      is_active: skill.is_active,
      external_id: "",
      tags: [],
      children: [],
      ancestors: [],
      module_count: 0,
      learner_count: 0,
      created_at: skill.created_at,
      updated_at: skill.created_at,
    });
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingSkill(null);
  }, []);

  const handleSubmitForm = useCallback(
    (data: SkillCreateUpdateData) => {
      if (editingSkill) {
        updateMutation.mutate({ slug: editingSkill.slug, data });
      } else {
        createMutation.mutate(data);
      }
    },
    [editingSkill, createMutation, updateMutation]
  );

  const handleDelete = useCallback((skill: SkillListItem) => {
    setDeleteConfirm({ isOpen: true, skill });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm.skill) {
      deleteMutation.mutate(deleteConfirm.skill.slug);
    }
  }, [deleteConfirm.skill, deleteMutation]);

  // Create columns with handlers
  const columns = createColumns({
    onView: (skill) => handleOpenEdit(skill),
    onEdit: (skill) => handleOpenEdit(skill),
    onDelete: (skill) => handleDelete(skill),
  });

  const tableData = skillsData?.results || [];

  if (isLoading) {
    return (
      <PageWrapper
        title="Skills Management"
        description="Create and manage skills/competencies for the learning platform."
      >
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper
        title="Skills Management"
        description="Create and manage skills/competencies for the learning platform."
      >
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Skills</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(error as Error)}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper
        title="Skills Management"
        description="Create and manage skills/competencies for the learning platform. Skills can be hierarchical and are used to track learner progress."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <FolderTree className="mr-2 h-4 w-4" />
              View Hierarchy
            </Button>
            <Button onClick={handleOpenCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Skill
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={tableData}
          filterColumnId="name"
          filterInputPlaceholder="Search skills by name..."
          filters={skillFilters}
        />
      </PageWrapper>

      {/* Create/Edit Form Dialog */}
      <SkillFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        skill={editingSkill}
        parentSkills={hierarchyData || []}
        onSubmit={handleSubmitForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, skill: null })}
        onConfirm={confirmDelete}
        title="Delete Skill"
        description="Are you sure you want to delete this skill? This action cannot be undone. Any module-skill mappings will also be removed."
        itemName={deleteConfirm.skill?.name || ""}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
