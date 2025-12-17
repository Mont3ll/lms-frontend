"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ShieldX } from "lucide-react";
import { DataTable } from '@/components/features/common/DataTable';
import { AddEditPromptTemplateModal } from "@/components/modals/AddEditPromptTemplateModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { fetchAIPromptTemplates, deleteAIPromptTemplate, getApiErrorMessage } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { toast } from "sonner";
import { Row, CellContext } from "@tanstack/react-table";
import { PromptTemplate } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

// Define columns for prompt templates
const createPromptColumns = (
  onEdit: (template: PromptTemplate) => void,
  onDelete: (templateId: string) => void
) => [
  {
    accessorKey: "name",
    header: "Template Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: CellContext<PromptTemplate, unknown>) => {
      const description = row.getValue("description") as string | null;
      if (!description) return "-";
      return description.length > 50 ? `${description.substring(0, 50)}...` : description;
    },
  },
  {
    accessorKey: "default_model_config_name",
    header: "Model Config",
    cell: ({ row }: CellContext<PromptTemplate, unknown>) => {
      return row.getValue("default_model_config_name") || "-";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: Row<PromptTemplate> }) => {
      const template = row.original;
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(template)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(template.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      );
    },
  },
];

export default function ManagePromptTemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isSuperuser = user?.is_superuser ?? false;

  const {
    data: promptTemplatesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.AI_PROMPT_TEMPLATES],
    queryFn: () => fetchAIPromptTemplates(),
    enabled: isSuperuser, // Only fetch if superuser
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAIPromptTemplate,
    onSuccess: () => {
      toast.success("Prompt template deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_PROMPT_TEMPLATES] });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete prompt template", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(undefined);
  };

  const tableData = promptTemplatesData?.results || [];
  const promptColumns = createPromptColumns(handleEdit, handleDelete);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <PageWrapper title="AI Prompt Templates">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </PageWrapper>
    );
  }

  // Show access denied for non-superusers
  if (!isSuperuser) {
    return (
      <PageWrapper title="AI Prompt Templates">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access AI Prompt Templates. This page is only accessible to superusers.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper title="AI Prompt Templates" description="Loading prompt templates.">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="AI Prompt Templates" description="There was a problem loading prompt templates.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Prompt Templates</AlertTitle>
          <AlertDescription>
            Failed to load prompt templates. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="AI Prompt Templates"
      description="Create and manage prompt templates used by the AI engine for content generation and assistance."
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Prompt Template
        </Button>
      }
    >
      <DataTable 
        columns={promptColumns} 
        data={tableData} 
        filterColumnId="name"
        filterInputPlaceholder="Search by template name..."
      />
      
      <AddEditPromptTemplateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        template={editingTemplate}
      />

      <DeleteConfirmationModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Prompt Template"
        description="Are you sure you want to delete this prompt template? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </PageWrapper>
  );
}