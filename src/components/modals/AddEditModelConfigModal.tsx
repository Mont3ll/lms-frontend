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
import { ModelConfig } from "@/lib/types";

const modelConfigSchema = z.object({
  name: z.string().min(1, "Model name is required").max(100, "Name is too long"),
  provider: z.enum(["OPENAI", "ANTHROPIC", "HUGGINGFACE", "CUSTOM"] as const, {
    required_error: "Please select a provider",
  }),
  model_id: z.string().min(1, "Model ID is required"),
  base_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_active: z.boolean(),
  default_params: z.string().optional(),
});

type ModelConfigFormValues = z.infer<typeof modelConfigSchema>;

interface AddEditModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelConfig?: ModelConfig | null; // For editing existing config
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
      provider: modelConfig?.provider || "OPENAI",
      model_id: modelConfig?.model_id || "",
      base_url: modelConfig?.base_url || "",
      is_active: modelConfig?.is_active ?? true,
      default_params: modelConfig?.default_params ? JSON.stringify(modelConfig.default_params, null, 2) : "{}",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ModelConfigFormValues) => {
      const payload = {
        ...data,
        default_params: data.default_params ? JSON.parse(data.default_params) : {},
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
                        <SelectItem value="OPENAI">OpenAI</SelectItem>
                        <SelectItem value="ANTHROPIC">Anthropic</SelectItem>
                        <SelectItem value="HUGGINGFACE">Hugging Face</SelectItem>
                        <SelectItem value="CUSTOM">Custom / Self-Hosted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base URL</FormLabel>
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

            <FormField
              control={form.control}
              name="default_params"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Parameters (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"temperature": 0.7, "max_tokens": 4096}'
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Default model parameters as JSON
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