"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ShieldX } from "lucide-react";
import { DataTable } from "@/components/features/common/DataTable";
import { AddEditModelConfigModal } from "@/components/modals/AddEditModelConfigModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import {
  fetchAIModelConfigs,
  deleteAIModelConfig,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { toast } from "sonner";
import { Row, CellContext } from "@tanstack/react-table";
import { ModelConfig } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

// Define columns for model configs
const createModelColumns = (
  onEdit: (model: ModelConfig) => void,
  onDelete: (modelId: string) => void
) => [
  {
    accessorKey: "name",
    header: "Model Name",
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }: CellContext<ModelConfig, unknown>) => {
      const provider = row.getValue("provider") as string;
      if (!provider) return "—";
      return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
    },
  },
  {
    accessorKey: "model_id",
    header: "Model ID",
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }: CellContext<ModelConfig, unknown>) => {
      return row.getValue("is_active") ? "Yes" : "No";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: Row<ModelConfig> }) => {
      const model = row.original;
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(model)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(model.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      );
    },
  },
];

export default function ManageModelConfigsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isSuperuser = user?.is_superuser ?? false;

  const {
    data: modelConfigsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.AI_MODEL_CONFIGS],
    queryFn: () => fetchAIModelConfigs(),
    enabled: isSuperuser, // Only fetch if superuser
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAIModelConfig,
    onSuccess: () => {
      toast.success("Model configuration deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_MODEL_CONFIGS] });
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete model configuration", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const handleEdit = (model: ModelConfig) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  const handleDelete = (modelId: string) => {
    setModelToDelete(modelId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (modelToDelete) {
      deleteMutation.mutate(modelToDelete);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
  };

  const tableData = modelConfigsData?.results || [];
  const modelColumns = createModelColumns(handleEdit, handleDelete);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <PageWrapper title="AI Model Configurations">
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
      <PageWrapper title="AI Model Configurations">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access AI Model Configurations. This page is only accessible to superusers.
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
      <PageWrapper title="AI Model Configurations" description="Loading model configurations.">
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
      <PageWrapper title="AI Model Configurations" description="There was a problem loading model configurations.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Model Configurations</AlertTitle>
          <AlertDescription>
            Failed to load model configurations. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="AI Model Configurations"
      description="Configure AI model providers, API keys, and settings for content generation features."
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Model Config
        </Button>
      }
    >
      <DataTable 
        columns={modelColumns} 
        data={tableData} 
        filterColumnId="name"
        filterInputPlaceholder="Search by model name..."
      />
      
      <AddEditModelConfigModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modelConfig={editingModel}
      />

      <DeleteConfirmationModal
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setModelToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Model Configuration"
        description="Are you sure you want to delete this model configuration? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </PageWrapper>
  );
}
