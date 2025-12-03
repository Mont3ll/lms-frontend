"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { DataTable } from '@/components/features/common/DataTable';
import { AddEditPromptTemplateModal } from "@/components/modals/AddEditPromptTemplateModal";
import { fetchAIPromptTemplates, deleteAIPromptTemplate, getApiErrorMessage } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { toast } from "sonner";
import { Row, CellContext } from "@tanstack/react-table";
import { AIPromptTemplate } from "@/lib/types/ai";

// Define columns for prompt templates
const createPromptColumns = (
  onEdit: (template: AIPromptTemplate) => void,
  onDelete: (templateId: string) => void
) => [
  {
    accessorKey: "name",
    header: "Template Name",
  },
  {
    accessorKey: "template_type",
    header: "Type",
    cell: ({ row }: CellContext<AIPromptTemplate, unknown>) => {
      const type = row.getValue("template_type") as string;
      return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }: CellContext<AIPromptTemplate, unknown>) => {
      const description = row.getValue("description") as string;
      return description.length > 50 ? `${description.substring(0, 50)}...` : description;
    },
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }: CellContext<AIPromptTemplate, unknown>) => {
      return row.getValue("is_active") ? "Yes" : "No";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: Row<AIPromptTemplate> }) => {
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
  const [editingTemplate, setEditingTemplate] = useState<AIPromptTemplate | undefined>(undefined);
  const queryClient = useQueryClient();

  const {
    data: promptTemplatesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.AI_PROMPT_TEMPLATES],
    queryFn: () => fetchAIPromptTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAIPromptTemplate,
    onSuccess: () => {
      toast.success("Prompt template deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_PROMPT_TEMPLATES] });
    },
    onError: (error) => {
      toast.error("Failed to delete prompt template", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const handleEdit = (template: AIPromptTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm("Are you sure you want to delete this prompt template?")) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(undefined);
  };

  const tableData = promptTemplatesData?.results || [];
  const promptColumns = createPromptColumns(handleEdit, handleDelete);

  if (isLoading) {
    return (
      <PageWrapper title="AI Prompt Templates">
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
      <PageWrapper title="AI Prompt Templates">
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
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Prompt Template
        </Button>
      }
    >
      <DataTable columns={promptColumns} data={tableData} />
      
      <AddEditPromptTemplateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        template={editingTemplate}
      />
    </PageWrapper>
  );
}