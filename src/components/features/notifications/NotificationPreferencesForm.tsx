"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, BellOff, BellRing } from "lucide-react";
import { toast } from "sonner"; // Import Sonner toast

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// import { useToast } from '@/components/ui/use-toast'; // Remove this
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  getApiErrorMessage,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

// Import types if needed
import { NotificationPreference } from "@/lib/types/notification";

// Define structure based on backend models
const NOTIFICATION_TYPES = [
  // ... (Keep the list from previous generation) ...
  { value: "COURSE_ENROLLMENT", label: "Course Enrollment" },
  { value: "COURSE_COMPLETION", label: "Course Completion" },
  { value: "ASSESSMENT_GRADED", label: "Assessment Graded" },
  { value: "DEADLINE_REMINDER", label: "Deadline Reminder" },
  { value: "ANNOUNCEMENT", label: "Announcements" },
];
const DELIVERY_METHODS = [
  { value: "EMAIL", label: "Email" },
  { value: "IN_APP", label: "In-App" },
];

interface NotificationPreferencesFormData {
  is_enabled: boolean;
  preferences: Record<string, Record<string, boolean>>;
}

export const NotificationPreferencesForm = () => {
  // const { toast: shadcnToast } = useToast(); // Remove this
  const queryClient = useQueryClient();

  const {
    data: currentPrefs,
    isLoading,
    error,
  } = useQuery<NotificationPreference>({
    // Add type
    queryKey: [QUERY_KEYS.NOTIFICATION_PREFERENCES],
    queryFn: fetchNotificationPreferences,
  });

  const methods = useForm<NotificationPreferencesFormData>({
    defaultValues: { is_enabled: true, preferences: {} },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = methods;
  const isGloballyEnabled = watch("is_enabled");

  React.useEffect(() => {
    /* ... useEffect to reset form ... */
  }, [currentPrefs, methods]);

  const mutation = useMutation({
    mutationFn: (data: NotificationPreferencesFormData) =>
      updateNotificationPreferences(data), // Pass data directly
    onSuccess: (updatedPrefs) => {
      // Use Sonner toast
      toast.success("Preferences Saved", {
        description: "Notification preferences updated successfully.",
      });
      queryClient.setQueryData(
        [QUERY_KEYS.NOTIFICATION_PREFERENCES],
        updatedPrefs,
      );
      methods.reset(updatedPrefs);
    },
    onError: (error) => {
      // Use Sonner toast
      toast.error("Save Failed", {
        description: `Failed to update preferences: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const onSubmit = (data: NotificationPreferencesFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    /* ... Skeleton UI ... */
  }
  if (error) {
    /* ... Error UI ... */
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified.</CardDescription>
      </CardHeader>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Global Switch */}
            <div className="flex items-center space-x-2 border p-4 rounded-md">
              <Switch
                id="is_enabled"
                {...register("is_enabled")}
                checked={isGloballyEnabled}
                onCheckedChange={(checked) =>
                  setValue("is_enabled", checked, { shouldDirty: true })
                }
              />
              <Label htmlFor="is_enabled" className="flex flex-col">
                ...
              </Label>
              {isGloballyEnabled ? (
                <BellRing className="h-4 w-4 ml-auto" />
              ) : (
                <BellOff className="h-4 w-4 ml-auto" />
              )}
            </div>

            {/* Per-Type Preferences */}
            {isGloballyEnabled && (
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types:</h4>
                {NOTIFICATION_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className="pl-4 border-l-2 ml-1 space-y-3 py-2"
                  >
                    <Label className="font-semibold">{type.label}</Label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pl-2">
                      {DELIVERY_METHODS.map((method) => (
                        <div
                          key={method.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${type.value}-${method.value}`}
                            {...register(
                              `preferences.${type.value}.${method.value}`,
                            )}
                            onCheckedChange={(checked) =>
                              setValue(
                                `preferences.${type.value}.${method.value}`,
                                !!checked,
                                { shouldDirty: true },
                              )
                            }
                          />
                          <Label
                            htmlFor={`${type.value}-${method.value}`}
                            className="text-sm font-normal"
                          >
                            {method.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={mutation.isPending || !isDirty}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Preferences
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
};
