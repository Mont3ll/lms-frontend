"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, UserPlus } from "lucide-react";
import { fetchUsers, createEnrollment, CreateEnrollmentData } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AddEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseSlug: string;
  courseTitle?: string;
}

type EnrollmentStatus = "ACTIVE" | "PENDING";

const STATUS_OPTIONS: { value: EnrollmentStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
];

export function AddEnrollmentModal({
  isOpen,
  onClose,
  courseId,
  courseSlug,
  courseTitle,
}: AddEnrollmentModalProps) {
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>("ACTIVE");

  // Fetch users for selection with search
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: [...QUERY_KEYS.USERS, searchQuery],
    queryFn: () => fetchUsers({ search: searchQuery, role: "LEARNER", page_size: 20 }),
    enabled: isOpen,
    staleTime: 30000,
  });

  const users = usersData?.results || [];

  // Mutation for creating enrollment
  const createEnrollmentMutation = useMutation({
    mutationFn: (data: CreateEnrollmentData) => createEnrollment(data),
    onSuccess: () => {
      toast.success("Enrollment created", {
        description: `${selectedUser?.first_name} ${selectedUser?.last_name} has been enrolled in the course.`,
      });
      // Invalidate course enrollments query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSE_ENROLLMENTS(courseSlug) });
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to create enrollment", {
        description: getApiErrorMessage(error),
      });
    },
  });

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUser(null);
    setEnrollmentStatus("ACTIVE");
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      toast.error("Select a user", {
        description: "Please select a user to enroll.",
      });
      return;
    }

    createEnrollmentMutation.mutate({
      user_id: selectedUser.id,
      course_id: courseId,
      status: enrollmentStatus,
    });
  };

  const getUserInitials = (user: User) => {
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Enrollment
          </DialogTitle>
          <DialogDescription>
            Enroll a user in {courseTitle ? `"${courseTitle}"` : "this course"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Search */}
          <div className="space-y-2">
            <Label>Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* User Selection List */}
          <div className="space-y-2">
            <Label>Select User</Label>
            <ScrollArea className="h-[200px] rounded-md border">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No learners available"}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors",
                        "hover:bg-accent",
                        selectedUser?.id === user.id && "bg-accent border border-primary"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile?.avatar ?? undefined} alt={user.first_name} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm font-medium">Selected User:</p>
              <p className="text-sm text-muted-foreground">
                {selectedUser.first_name} {selectedUser.last_name} ({selectedUser.email})
              </p>
            </div>
          )}

          {/* Enrollment Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Enrollment Status</Label>
            <Select
              value={enrollmentStatus}
              onValueChange={(value) => setEnrollmentStatus(value as EnrollmentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Active enrollments allow immediate course access. Pending enrollments require approval.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createEnrollmentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUser || createEnrollmentMutation.isPending}
          >
            {createEnrollmentMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enroll User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
