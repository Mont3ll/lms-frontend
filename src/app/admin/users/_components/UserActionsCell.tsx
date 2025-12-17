"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, UserX, UserCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { updateUser, getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { UserDetailsModal } from "@/components/modals/UserDetailsModal";
import { SuspendUserModal } from "@/components/modals/SuspendUserModal";

interface UserActionsProps {
  userId: string;
  userEmail: string;
  userName: string;
  isActive: boolean;
}

export function UserActionsCell({
  userId,
  userEmail,
  userName,
  isActive,
}: UserActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  const suspendMutation = useMutation({
    mutationFn: () => updateUser(userId, { is_active: !isActive }),
    onSuccess: () => {
      toast.success(isActive ? "User Suspended" : "User Reactivated", {
        description: isActive
          ? `${userName} has been suspended.`
          : `${userName} has been reactivated.`,
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_DETAILS, userId],
      });
      setIsSuspendModalOpen(false);
    },
    onError: (error) => {
      toast.error("Action Failed", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userEmail);
    toast.success("Email copied to clipboard");
  };

  const handleViewDetails = () => {
    setIsDetailsModalOpen(true);
  };

  const handleEditUser = () => {
    router.push(`/admin/users/${userId}/edit`);
  };

  const handleSuspendUser = () => {
    setIsSuspendModalOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleCopyEmail}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditUser}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSuspendUser}
            className={
              isActive
                ? "text-destructive focus:bg-destructive/10 focus:text-destructive"
                : "text-green-600 focus:bg-green-50 focus:text-green-600"
            }
          >
            {isActive ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Suspend User
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Reactivate User
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        userId={userId}
      />

      <SuspendUserModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={() => suspendMutation.mutate()}
        isLoading={suspendMutation.isPending}
        userName={userName}
        userEmail={userEmail}
        isCurrentlyActive={isActive}
      />
    </>
  );
}
