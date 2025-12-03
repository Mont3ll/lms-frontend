"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createTenant } from "@/lib/api";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

const tenantSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  is_active: z.boolean(),
  domains: z.array(z.string().min(1, "Domain cannot be empty")),
  theme_config: z.string().optional(),
  feature_flags: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

export default function CreateTenantPage() {
  const router = useRouter();
  const [domainInputs, setDomainInputs] = React.useState<string[]>([""]);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      is_active: true,
      theme_config: "{}",
      feature_flags: "{}",
      domains: [],
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      toast.success("Tenant created successfully!");
      router.push("/admin/tenants");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create tenant");
    },
  });

  const onSubmit = (data: TenantFormValues) => {
    // Filter out empty domains
    const filteredDomains = domainInputs.filter((domain) => domain.trim() !== "");

    const payload = {
      ...data,
      domains: filteredDomains,
      theme_config: data.theme_config ? JSON.parse(data.theme_config) : {},
      feature_flags: data.feature_flags ? JSON.parse(data.feature_flags) : {},
    };

    createTenantMutation.mutate(payload);
  };

  const addDomainInput = () => {
    setDomainInputs([...domainInputs, ""]);
  };

  const removeDomainInput = (index: number) => {
    if (domainInputs.length > 1) {
      setDomainInputs(domainInputs.filter((_, i) => i !== index));
    }
  };

  const updateDomainInput = (index: number, value: string) => {
    const newInputs = [...domainInputs];
    newInputs[index] = value;
    setDomainInputs(newInputs);
  };

  return (
    <PageWrapper
      title="Create Tenant"
      actions={
        <Button variant="outline" asChild className="cursor-pointer">
          <Link href="/admin/tenants">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Link>
        </Button>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the basic settings for the new tenant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tenant name..." {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name for this tenant organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable this tenant to allow user access
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domains</CardTitle>
                <CardDescription>
                  Associate domain names with this tenant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {domainInputs.map((domain, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="example.com"
                      value={domain}
                      onChange={(e) => updateDomainInput(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeDomainInput(index)}
                      disabled={domainInputs.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDomainInput}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Domain
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  Optional JSON configuration for theme and feature flags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="theme_config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Configuration (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"primaryColor": "#007bff", "fontFamily": "Inter"}'
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON object for theme customization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feature_flags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feature Flags (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='{"enableAI": true, "enableAdvancedReports": false}'
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON object for feature flag configuration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/tenants")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTenantMutation.isPending}
              >
                {createTenantMutation.isPending ? "Creating..." : "Create Tenant"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageWrapper>
  );
}