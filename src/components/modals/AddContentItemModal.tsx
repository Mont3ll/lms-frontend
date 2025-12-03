"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const contentItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content_type: z.enum(["TEXT", "VIDEO", "IMAGE", "URL", "DOCUMENT"]),
  text_content: z.string().optional(),
  external_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ContentItemFormData = z.infer<typeof contentItemSchema>;

interface AddContentItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContentItemFormData) => Promise<void>;
  isLoading?: boolean;
  moduleTitle?: string;
}

const contentTypeOptions = [
  { value: "TEXT", label: "Text Content" },
  { value: "VIDEO", label: "Video" },
  { value: "IMAGE", label: "Image" },
  { value: "URL", label: "External URL" },
  { value: "DOCUMENT", label: "Document" },
];

export function AddContentItemModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  moduleTitle,
}: AddContentItemModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ContentItemFormData>({
    resolver: zodResolver(contentItemSchema),
    defaultValues: {
      content_type: "TEXT",
    },
  });

  const selectedContentType = watch("content_type");

  const handleFormSubmit = async (data: ContentItemFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding content item:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Content Item</DialogTitle>
          <DialogDescription>
            Add a new content item to {moduleTitle ? `"${moduleTitle}"` : "this module"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter content title..."
                {...register("title")}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content_type">Content Type *</Label>
              <Select
                value={selectedContentType}
                onValueChange={(value) => setValue("content_type", value as ContentItemFormData["content_type"])}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {contentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedContentType === "TEXT" && (
              <div className="grid gap-2">
                <Label htmlFor="text_content">Text Content</Label>
                <Textarea
                  id="text_content"
                  placeholder="Enter your text content..."
                  rows={4}
                  {...register("text_content")}
                  disabled={isLoading}
                />
                {errors.text_content && (
                  <p className="text-sm text-destructive">{errors.text_content.message}</p>
                )}
              </div>
            )}

            {selectedContentType === "URL" && (
              <div className="grid gap-2">
                <Label htmlFor="external_url">External URL *</Label>
                <Input
                  id="external_url"
                  type="url"
                  placeholder="https://example.com"
                  {...register("external_url")}
                  disabled={isLoading}
                />
                {errors.external_url && (
                  <p className="text-sm text-destructive">{errors.external_url.message}</p>
                )}
              </div>
            )}

            {(selectedContentType === "VIDEO" || 
              selectedContentType === "IMAGE" || 
              selectedContentType === "DOCUMENT") && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  File upload functionality will be available after creating the content item.
                  You can edit the item to upload files.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Content Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}