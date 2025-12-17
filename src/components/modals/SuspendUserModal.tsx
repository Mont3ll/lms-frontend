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
import { Loader2, UserX, UserCheck } from "lucide-react";

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  userName: string;
  userEmail: string;
  isCurrentlyActive: boolean;
}

export function SuspendUserModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userName,
  userEmail,
  isCurrentlyActive,
}: SuspendUserModalProps) {
  const action = isCurrentlyActive ? "Suspend" : "Reactivate";
  const Icon = isCurrentlyActive ? UserX : UserCheck;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon
              className={`h-5 w-5 ${isCurrentlyActive ? "text-destructive" : "text-green-600"}`}
            />
            {action} User
          </DialogTitle>
          <DialogDescription>
            {isCurrentlyActive
              ? "This will prevent the user from accessing the platform."
              : "This will restore the user's access to the platform."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2 mb-4">
            <p className="text-sm">
              <span className="text-muted-foreground">User:</span>{" "}
              <span className="font-medium">{userName}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium">{userEmail}</span>
            </p>
          </div>

          {isCurrentlyActive ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive-foreground">
                <strong>Warning:</strong> Suspended users will be logged out and
                unable to access any courses or content until reactivated.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Note:</strong> Reactivating this user will restore their
                full access to the platform and all previously enrolled courses.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isCurrentlyActive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action} User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
