"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Import Sonner toast

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
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, getApiErrorMessage } from "@/lib/api"; // Use createUser API
import { QUERY_KEYS, USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider"; // To get current admin's tenant if needed

// Schema for inviting/creating user
const inviteUserSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Valid email is required"),
  role: z.enum([USER_ROLES.LEARNER, USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]),
  // Tenant might be inferred from admin user or selected if superuser
  tenant_id: z.string().uuid("Tenant must be selected").optional(),
  // No password needed for invite, backend should handle setting initial status/token
});

type InviteUserFormValues = z.infer<typeof inviteUserSchema>;

export default function InviteUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth(); // Get current admin user info

  // TODO: Fetch Tenants if superuser needs to select one
  // const { data: tenants } = useQuery(...)
  // Placeholder - this needs proper implementation with tenant management
  const tenants = [{ id: "placeholder-tenant-id", name: "My Tenant" }];

  const methods = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: { role: USER_ROLES.LEARNER },
  });

  const {
    handleSubmit,
    control,
  } = methods;

  // Use createUser mutation (backend logic determines if it's invite vs create)
  const mutation = useMutation({
    mutationFn: (data: InviteUserFormValues) => {
      const apiData = {
        ...data,
        // Backend API needs tenant ID. Use tenant_id from form if provided,
        // otherwise use a placeholder (this needs proper implementation)
        tenant: data.tenant_id || "placeholder-tenant-id",
        // No password sent for invite flow
      };
      if (!apiData.tenant) {
        throw new Error("Tenant could not be determined for user creation.");
      }
      // Remove tenant_id if it exists (API expects 'tenant')
      delete (apiData as { tenant_id?: string }).tenant_id;
      return createUser(apiData); // Use createUser API endpoint
    },
    onSuccess: (newUser) => {
      // Use Sonner toast
      toast.success("User Invited", {
        description: `User ${newUser.email} invited successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] }); // Refresh user list
      router.push("/admin/users"); // Redirect to user list
    },
    onError: (error) => {
      // Use Sonner toast
      toast.error("Invitation Failed", {
        description: `Failed to invite user: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const onSubmit = (data: InviteUserFormValues) => {
    mutation.mutate(data);
  };

  return (
    <PageWrapper title="Invite New User">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Invite User</CardTitle>
              <CardDescription>
                Enter the details for the user you want to invite. They will
                receive an email to set up their account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={USER_ROLES.LEARNER}>Learner</SelectItem>
                        <SelectItem value={USER_ROLES.INSTRUCTOR}>
                          Instructor
                        </SelectItem>
                        <SelectItem value={USER_ROLES.ADMIN}>
                          Admin (Tenant)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tenant Selection for Superuser */}
              {adminUser?.is_superuser === true && (
                <FormField
                  control={control}
                  name="tenant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Tenant</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Tenant..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tenants?.map((t) => (
                            <SelectItem key={t.id} value={t.id!}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Invitation
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </PageWrapper>
  );
}
