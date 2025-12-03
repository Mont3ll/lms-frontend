"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createAIModelConfig, updateAIModelConfig, getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

// Local interface for the model config that this modal can edit
interface EditableModelConfig {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "huggingface" | "ollama" | "custom";
  model_type?: "text_generation" | "text_embedding" | "image_generation" | "code_generation";
  model_id: string;
  api_key?: string;
  api_base_url?: string;
  max_tokens?: number;
  temperature?: number;
  is_active: boolean;
  configuration?: Record<string, unknown>;
}

const modelConfigSchema = z.object({
  name: z.string().min(1, "Model name is required").max(100, "Name is too long"),
  provider: z.enum(["openai", "anthropic", "huggingface", "ollama", "custom"], {
    required_error: "Please select a provider",
  }),
  model_type: z.enum(["text_generation", "text_embedding", "image_generation", "code_generation"], {
    required_error: "Please select a model type",
  }),
  model_id: z.string().min(1, "Model ID is required"),
  api_key: z.string().optional(),
  api_base_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  max_tokens: z.number().min(1, "Must be at least 1").max(100000, "Too large").optional(),
  temperature: z.number().min(0, "Must be 0 or higher").max(2, "Must be 2 or lower").optional(),
  is_active: z.boolean(),
  configuration: z.string().optional(),
});

type ModelConfigFormValues = z.infer<typeof modelConfigSchema>;

interface AddEditModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelConfig?: EditableModelConfig | null; // For editing existing config
}

export function AddEditModelConfigModal({
  isOpen,
  onClose,
  modelConfig,
}: AddEditModelConfigModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!modelConfig;

  const form = useForm<ModelConfigFormValues>({
    resolver: zodResolver(modelConfigSchema),
    defaultValues: {
      name: modelConfig?.name || "",
      provider: modelConfig?.provider || "openai",
      model_type: modelConfig?.model_type || "text_generation",
      model_id: modelConfig?.model_id || "",
      api_key: modelConfig?.api_key || "",
      api_base_url: modelConfig?.api_base_url || "",
      max_tokens: modelConfig?.max_tokens || 4096,
      temperature: modelConfig?.temperature || 0.7,
      is_active: modelConfig?.is_active ?? true,
      configuration: modelConfig?.configuration ? JSON.stringify(modelConfig.configuration, null, 2) : "{}",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ModelConfigFormValues) => {
      const payload = {
        ...data,
        configuration: data.configuration ? JSON.parse(data.configuration) : {},
      };
      
      if (isEditing) {
        return updateAIModelConfig(modelConfig.id, payload);
      }
      return createAIModelConfig(payload);
    },
    onSuccess: () => {
      toast.success(
        isEditing ? "Model configuration updated successfully!" : "Model configuration created successfully!"
      );
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AI_MODEL_CONFIGS] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error(
        isEditing ? "Failed to update model configuration" : "Failed to create model configuration",
        {
          description: getApiErrorMessage(error),
        }
      );
    },
  });

  const onSubmit = (data: ModelConfigFormValues) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Model Configuration" : "Add Model Configuration"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the AI model configuration settings."
              : "Configure a new AI model for use in the platform."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input placeholder="GPT-4 Turbo" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name for this model configuration
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                        <SelectItem value="ollama">Ollama</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text_generation">Text Generation</SelectItem>
                        <SelectItem value="text_embedding">Text Embedding</SelectItem>
                        <SelectItem value="image_generation">Image Generation</SelectItem>
                        <SelectItem value="code_generation">Code Generation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model ID</FormLabel>
                    <FormControl>
                      <Input placeholder="gpt-4-turbo-preview" {...field} />
                    </FormControl>
                    <FormDescription>
                      The actual model identifier used by the API
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sk-..." {...field} />
                  </FormControl>
                  <FormDescription>
                    API key for accessing the model (leave empty to use global key)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.openai.com/v1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Custom API base URL (optional, uses provider default if empty)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_tokens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Tokens</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of tokens to generate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Controls randomness (0 = deterministic, 2 = very random)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="configuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Configuration (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"top_p": 1, "frequency_penalty": 0}'
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional model-specific configuration as JSON
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this model configuration for use
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"} Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}