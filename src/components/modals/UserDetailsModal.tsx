"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserDetails } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { User, Mail, Calendar, Shield } from "lucide-react";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  userId,
}: UserDetailsModalProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USER_DETAILS, userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: isOpen && !!userId,
  });

  const getUserInitials = () => {
    if (!user) return "?";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "INSTRUCTOR":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : user ? (
          <div className="space-y-6 py-4">
            {/* User Avatar and Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user.profile?.avatar ?? undefined}
                  alt={`${user.first_name} ${user.last_name}`}
                />
                <AvatarFallback className="text-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.is_active ? "default" : "destructive"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="space-y-4">
              <DetailRow
                icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                label="Email"
                value={user.email}
              />
              <DetailRow
                icon={<Shield className="h-4 w-4 text-muted-foreground" />}
                label="Role"
                value={user.role}
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                label="Date Joined"
                value={formatDate(user.date_joined)}
              />
              {user.last_login && (
                <DetailRow
                  icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                  label="Last Login"
                  value={formatDate(user.last_login)}
                />
              )}
            </div>

            {/* Bio Section */}
            {user.profile?.bio && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            User not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
