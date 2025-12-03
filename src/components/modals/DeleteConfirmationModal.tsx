"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description: string;
  itemName?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  itemName,
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
            {itemName && (
              <span className="block mt-2 font-medium text-foreground">
                &quot;{itemName}&quot;
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive-foreground">
              <strong>Warning:</strong> This action cannot be undone. All content and data associated with this item will be permanently deleted.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleConfirm} 
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}