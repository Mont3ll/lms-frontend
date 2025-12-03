"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Import sonner toast

import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchUserProfile,
  updateUserProfile,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { userProfileSchema } from "@/lib/validators";
// import { useToast } from "@/components/ui/use-toast"; // Remove shadcn useToast import
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "@/components/features/users/ChangePasswordForm";
import { NotificationPreferencesForm } from "@/components/features/notifications/NotificationPreferencesForm";
import { Separator } from "@/components/ui/separator";

type ProfileFormValues = z.infer<typeof userProfileSchema>;

export default function ProfilePage() {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  // const { toast: shadcnToast } = useToast(); // Remove shadcn toast hook
  const queryClient = useQueryClient();

  const {
    data: userProfileData,
    isLoading: isProfileLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: fetchUserProfile,
    enabled: !isAuthLoading && !!authUser,
  });

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      profile: { bio: "", language: "", timezone: "" },
    },
    values: userProfileData
      ? {
          first_name: userProfileData.first_name ?? "",
          last_name: userProfileData.last_name ?? "",
          profile: {
            bio: userProfileData.profile?.bio ?? "",
            language: userProfileData.profile?.language ?? "",
            timezone: userProfileData.profile?.timezone ?? "",
          },
        }
      : undefined,
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = methods;

  React.useEffect(() => {
    if (userProfileData) {
      reset(userProfileData as ProfileFormValues);
    }
  }, [userProfileData, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      if (!authUser) throw new Error("User not authenticated");
      const apiData = {
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile,
      };
      return updateUserProfile(String(authUser.id), apiData);
    },
    onSuccess: (updatedUser) => {
      // Use Sonner toast for success
      toast.success("Profile Updated", {
        description: "Your profile information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
      reset(updatedUser as ProfileFormValues);
    },
    onError: (error) => {
      // Use Sonner toast for error
      toast.error("Update Failed", {
        description: `Failed to update profile: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading) {
    // Skeleton rendering remains the same
    return (
      <PageWrapper title="My Profile" className="space-y-6">
        {/* Profile Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />{" "}
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
        {/* Password Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        {/* Notification Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (error) {
    // Error display remains the same
    return (
      <PageWrapper title="My Profile">
        <p className="text-destructive">Error loading profile.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Profile" className="space-y-6">
      {/* Profile Information Form */}
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={methods.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={authUser?.email || ""}
                  readOnly
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
              </div>
              <FormField
                control={methods.control}
                name="profile.bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        {...field}
                        value={field.value ?? ""}
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Share a bit about yourself and your learning goals
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* TODO: Add fields for Language, Timezone */}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={mutation.isPending || !isDirty}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Profile Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Separator />
      <ChangePasswordForm />
      <Separator />
      <NotificationPreferencesForm />
    </PageWrapper>
  );
}
