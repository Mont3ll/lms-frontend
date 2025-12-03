"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
// import { useToast } from '@/components/ui/use-toast'; // Remove this
import { toast } from "sonner"; // Import Sonner toast
import { fetchUserDetails, updateUser, getApiErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { Label } from "@/components/ui/label"; // Import Label
import { Input } from "@/components/ui/input"; // Import Input

// Validation Schema
const adminUserEditSchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(["LEARNER", "INSTRUCTOR", "ADMIN"]),
  is_active: z.boolean(),
});
type AdminUserEditFormValues = z.infer<typeof adminUserEditSchema>;

export default function EditUserPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  // const { toast: shadcnToast } = useToast(); // Remove this
  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.USER_DETAILS, userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId,
  });

  const methods = useForm<AdminUserEditFormValues>({
    resolver: zodResolver(adminUserEditSchema),
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
  } = methods;

  React.useEffect(() => {
    /* ... useEffect to reset form ... */
  }, [userData, reset]);

  const mutation = useMutation({
    mutationFn: (data: AdminUserEditFormValues) => {
      const { email: _unusedEmail, ...updateData } = data; // Exclude email if read-only
      void _unusedEmail; // Suppress unused variable warning
      return updateUser(userId, updateData);
    },
    onSuccess: (updatedUser) => {
      // Use Sonner toast
      toast.success("User Updated", {
        description: "User details saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_DETAILS, userId],
      });
      reset(updatedUser as AdminUserEditFormValues); // Reset with updated data
    },
    onError: (error) => {
      // Use Sonner toast
      toast.error("Update Failed", {
        description: `Failed to update user: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const onSubmit = (data: AdminUserEditFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    /* ... Skeleton UI ... */
  }
  if (isError) {
    /* ... Error UI ... */
  }

  return (
    <PageWrapper title="Edit User" className="max-w-3xl mx-auto">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            {/* CardHeader, CardContent with FormField, SelectField etc. */}
            <CardHeader>
              <CardTitle>{userData ? `${userData.first_name} ${userData.last_name}` : "User"}</CardTitle>
              <CardDescription>
                Update user details, role, and status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="first_name" label="First Name" />
                <FormField name="last_name" label="Last Name" />
              </div>
              <div className="grid gap-2">
                {" "}
                {/* Read only Email */}
                <Label>Email</Label>
                <Input
                  value={userData?.email || ""}
                  readOnly
                  disabled
                  className="bg-muted/50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="role"
                  label="Role"
                  options={[
                    { value: "LEARNER", label: "Learner" },
                    { value: "INSTRUCTOR", label: "Instructor" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                />
                <SelectField
                  name="is_active"
                  label="Status"
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                />
              </div>
              {/* Add Tenant SelectField if superuser */}
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="mr-2"
              >
                Cancel
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
    </PageWrapper>
  );
}
