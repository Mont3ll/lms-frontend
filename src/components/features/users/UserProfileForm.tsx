"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { FormField } from "@/components/forms/FormField";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { userProfileSchema } from "@/lib/validators";
import { User } from "@/lib/types"; // Import User type

type ProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileFormProps {
  user: User; // Pass the full user object including profile
  onSubmit: (data: ProfileFormValues) => Promise<void> | void;
  isLoading: boolean;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  user,
  onSubmit,
  isLoading,
}) => {
  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      profile: {
        bio: user?.profile?.bio || "",
        language: user?.profile?.language || "",
        timezone: user?.profile?.timezone || "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="first_name" label="First Name" />
              <FormField name="last_name" label="Last Name" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                readOnly
                disabled
                className="bg-muted/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile.bio">Bio</Label>
              <Textarea id="profile.bio" {...register("profile.bio")} />
              {errors.profile?.bio && (
                <p className="text-sm text-destructive mt-1">
                  {errors.profile.bio.message}
                </p>
              )}
            </div>
            {/* Add Language/Timezone fields */}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
};
