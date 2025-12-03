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
import { Loader2 } from "lucide-react";

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface AddModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModuleFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AddModuleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddModuleModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  });

  const handleFormSubmit = async (data: ModuleFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding module:", error);
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
          <DialogTitle>Add New Module</DialogTitle>
          <DialogDescription>
            Create a new module to organize your course content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Module Title *</Label>
              <Input
                id="title"
                placeholder="Enter module title..."
                {...register("title")}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter module description..."
                rows={3}
                {...register("description")}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
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
              Add Module
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}