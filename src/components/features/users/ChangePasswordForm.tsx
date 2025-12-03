"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { FormField } from "@/components/forms/FormField";
import { changePasswordSchema } from "@/lib/validators";
import { changePassword, getApiErrorMessage } from "@/lib/api";
// import { useToast } from '@/components/ui/use-toast'; // Remove this

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm = () => {
  // const { toast: shadcnToast } = useToast(); // Remove this
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: "", new_password: "", new_password2: "" },
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = methods;

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      // Use Sonner toast
      toast.success("Password Updated", {
        description: "Your password has been changed successfully.",
      });
      reset();
      setError(null);
    },
    onError: (error) => {
      const errorMsg = getApiErrorMessage(error);
      setError(errorMsg); // Set form-level error
      // Use Sonner toast
      toast.error("Update Failed", {
        description: `Failed to update password: ${errorMsg}`,
      });
    },
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password.</CardDescription>
      </CardHeader>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive p-2 bg-destructive/10 rounded">
                {error}
              </p>
            )}
            <FormField
              name="old_password"
              label="Current Password"
              type="password"
            />
            <FormField
              name="new_password"
              label="New Password"
              type="password"
            />
            <FormField
              name="new_password2"
              label="Confirm New Password"
              type="password"
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={mutation.isPending || !isDirty}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
};
