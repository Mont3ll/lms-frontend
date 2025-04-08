"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField"; // Assuming FormField handles context
import { Textarea } from "@/components/ui/textarea"; // Assuming shadcn textarea
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchUserProfile,
  updateUserProfile,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { userProfileSchema } from "@/lib/validators"; // Import profile schema
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileFormValues = z.infer<typeof userProfileSchema>;

export default function ProfilePage() {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user profile data
  const {
    data: userProfileData,
    isLoading: isProfileLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: fetchUserProfile,
    enabled: !isAuthLoading && !!authUser, // Only fetch if auth is loaded and user exists
  });

  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      profile: {
        bio: "",
        language: "",
        timezone: "",
      },
    },
    // Update default values once profile data loads
    values: userProfileData
      ? {
          first_name: userProfileData.first_name || "",
          last_name: userProfileData.last_name || "",
          profile: {
            bio: userProfileData.profile?.bio || "",
            language: userProfileData.profile?.language || "",
            timezone: userProfileData.profile?.timezone || "",
          },
        }
      : undefined,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = methods;

  // Reset form when data loads/changes
  React.useEffect(() => {
    if (userProfileData) {
      reset({
        first_name: userProfileData.first_name || "",
        last_name: userProfileData.last_name || "",
        profile: {
          bio: userProfileData.profile?.bio || "",
          language: userProfileData.profile?.language || "",
          timezone: userProfileData.profile?.timezone || "",
        },
      });
    }
  }, [userProfileData, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      if (!authUser) throw new Error("User not authenticated");
      // Prepare data for API (might differ based on endpoint structure)
      const apiData = {
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile,
      };
      return updateUserProfile(authUser.id, apiData);
    },
    onSuccess: (updatedUser) => {
      toast({ title: "Success", description: "Profile updated successfully." });
      // Invalidate user profile query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
      // Update auth context? Only if critical info like name changes affect UI immediately elsewhere
      // reset(updatedUser); // Update form with response data
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${getApiErrorMessage(error)}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    console.log("Updating profile:", data);
    mutation.mutate(data);
  };

  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading) {
    return (
      <PageWrapper title="My Profile">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-24 ml-auto" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="My Profile">
        <p className="text-destructive">Error loading profile.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Profile">
      <FormProvider {...methods}>
        {" "}
        {/* Provide form methods to context */}
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
                {/* Use FormField which implicitly uses context */}
                <FormField name="first_name" label="First Name" />
                <FormField name="last_name" label="Last Name" />
              </div>

              {/* Email is usually read-only */}
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={authUser?.email || ""}
                  readOnly
                  disabled
                  className="bg-muted/50"
                />
              </div>

              {/* Profile Bio */}
              <div className="grid gap-2">
                <Label htmlFor="profile.bio">Bio (Optional)</Label>
                <Textarea
                  id="profile.bio"
                  placeholder="Tell us a little about yourself..."
                  {...register("profile.bio")}
                  className={errors.profile?.bio ? "border-destructive" : ""}
                />
                {errors.profile?.bio && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.profile.bio.message}
                  </p>
                )}
              </div>

              {/* TODO: Add fields for Language, Timezone (perhaps SelectField) */}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={mutation.isPending || !isDirty}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>

      {/* TODO: Add separate Card/Section for Password Change */}
      {/* <ChangePasswordSection /> */}

      {/* TODO: Add separate Card/Section for Notification Preferences */}
      {/* <NotificationPreferencesSection /> */}
    </PageWrapper>
  );
}
