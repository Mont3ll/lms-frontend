"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/features/common/DataTable";
import { AddEditModelConfigModal } from "@/components/modals/AddEditModelConfigModal";
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

interface ModelConfig {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "huggingface" | "ollama" | "custom";
  model_type?: "text_generation" | "text_embedding" | "image_generation" | "code_generation";
  model_id: string;
  is_active: boolean;
}

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
      return provider.charAt(0).toUpperCase() + provider.slice(1);
    },
  },
  {
    accessorKey: "model_type",
    header: "Type",
    cell: ({ row }: CellContext<ModelConfig, unknown>) => {
      const type = row.getValue("model_type") as string;
      return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
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
  const queryClient = useQueryClient();

  const {
    data: modelConfigsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.AI_MODEL_CONFIGS],
    queryFn: () => fetchAIModelConfigs(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAIModelConfig,
    onSuccess: () => {
      toast.success("Model configuration deleted successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_MODEL_CONFIGS] });
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
    if (confirm("Are you sure you want to delete this model configuration?")) {
      deleteMutation.mutate(modelId);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
  };

  const tableData = modelConfigsData?.results || [];
  const modelColumns = createModelColumns(handleEdit, handleDelete);

  if (isLoading) {
    return (
      <PageWrapper title="AI Model Configurations">
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
      <PageWrapper title="AI Model Configurations">
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
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Model Config
        </Button>
      }
    >
      <DataTable columns={modelColumns} data={tableData} />
      
      <AddEditModelConfigModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modelConfig={editingModel}
      />
    </PageWrapper>
  );
}
