"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Calendar, Shield, Settings, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
import { FormField } from "@/components/forms/FormField";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  fetchUserProfile,
  updateUserProfile,
  getApiErrorMessage,
} from "@/lib/api";
import { User as UserType } from "@/lib/types";
import { QUERY_KEYS } from "@/lib/constants";
import { userProfileSchema } from "@/lib/validators";

import { ChangePasswordForm } from "@/components/features/users/ChangePasswordForm";
import { NotificationPreferencesForm } from "@/components/features/notifications/NotificationPreferencesForm";

type ProfileFormValues = z.infer<typeof userProfileSchema>;

export default function ProfilePage() {
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: userProfileData,
    isLoading: isProfileLoading,
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
          first_name: userProfileData.first_name || "",
          last_name: userProfileData.last_name || "",
          profile: {
            bio: userProfileData.profile?.bio || "",
            language: userProfileData.profile?.language || "",
            timezone: userProfileData.profile?.timezone || "",
          },
        }
      : {
          first_name: "",
          last_name: "",
          profile: { bio: "", language: "", timezone: "" },
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = methods;

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
      const apiData: ProfileFormValues = {
        first_name: data.first_name,
        last_name: data.last_name,
        profile: data.profile ? {
          bio: data.profile.bio || "",
          language: data.profile.language || "",
          timezone: data.profile.timezone || "",
        } : undefined,
      };
      return updateUserProfile(String(authUser.id), apiData);
    },
    onSuccess: (updatedUser) => {
      toast.success("Profile Updated", {
        description: "Your profile information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
      reset({
        first_name: updatedUser.first_name || "",
        last_name: updatedUser.last_name || "",
        profile: {
          bio: updatedUser.profile?.bio || "",
          language: updatedUser.profile?.language || "",
          timezone: updatedUser.profile?.timezone || "",
        },
      });
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: `Failed to update profile: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };

  const isLoading = isAuthLoading || isProfileLoading;
  // Use isLoading to show loading state if needed in the future
  void isLoading;

  // Get user initials for avatar
  const getUserInitials = (user: UserType | null) => {
    if (!user) return "?";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || "?";
  };

  // Get role-specific info
  const getRoleInfo = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          title: "Administrator",
          description: "Platform administrator with full access",
          color: "destructive" as const,
        };
      case "INSTRUCTOR":
        return {
          title: "Instructor",
          description: "Course instructor and content creator",
          color: "default" as const,
        };
      case "LEARNER":
        return {
          title: "Learner",
          description: "Student enrolled in courses",
          color: "secondary" as const,
        };
      default:
        return {
          title: "User",
          description: "Platform user",
          color: "outline" as const,
        };
    }
  };

  // Calculate derived values
  const userInitials = getUserInitials(authUser);
  const roleInfo = getRoleInfo(authUser?.role || "");

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <PageWrapper 
      title="My Profile" 
      className="max-w-7xl mx-auto pt-8"
      actions={
        <Button 
          variant="outline" 
          onClick={handleBackToDashboard}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Profile Overview - Left Column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                {/* Avatar */}
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={`${authUser?.first_name} ${authUser?.last_name}`} />
                  <AvatarFallback className="text-2xl font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                {/* User Name */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {authUser?.first_name && authUser?.last_name
                      ? `${authUser.first_name} ${authUser.last_name}`
                      : authUser?.email || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {roleInfo.description}
                  </p>
                </div>

                {/* Role Badge */}
                <Badge variant={roleInfo.color} className="text-sm">
                  <Shield className="mr-1 h-3 w-3" />
                  {roleInfo.title}
                </Badge>
                {authUser?.is_staff && (
                  <Badge variant="outline" className="text-xs">
                    Staff Member
                  </Badge>
                )}

                {/* Bio */}
                {userProfileData?.profile?.bio && (
                  <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground">
                      {userProfileData.profile.bio}
                    </p>
                  </div>
                )}

                {/* Account Info */}
                <div className="w-full space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{authUser?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined {new Date(authUser?.date_joined || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and profile information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="first_name" label="First Name" />
                        <FormField name="last_name" label="Last Name" />
                      </div>
                      
                      {/* Email Field (Read-only) */}
                      <div className="grid gap-2">
                        <Label>Email Address</Label>
                        <Input
                          value={authUser?.email || ""}
                          readOnly
                          disabled
                          className="bg-muted/50 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                          Your email address cannot be changed. Contact support if you need to update it.
                        </p>
                      </div>
                      
                      {/* Bio Field */}
                      <div className="grid gap-2">
                        <Label htmlFor="profile.bio">Bio</Label>
                        <Textarea
                          id="profile.bio"
                          placeholder="Tell us about yourself..."
                          {...register("profile.bio")}
                          className={errors.profile?.bio ? "border-destructive" : ""}
                          rows={4}
                        />
                        {errors.profile?.bio && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.profile.bio.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Brief description for your profile. Maximum 500 characters.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => reset()}
                        disabled={!isDirty}
                      >
                        Reset Changes
                      </Button>
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
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <ChangePasswordForm />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <NotificationPreferencesForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageWrapper>
  );
}