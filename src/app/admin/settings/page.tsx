"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldX } from "lucide-react";
// Import specific settings forms
import { GeneralSettingsForm } from "./_components/GeneralSettingsForm";
import { EmailSettingsForm } from "./_components/EmailSettingsForm";
import { StorageSettingsForm } from "./_components/StorageSettingsForm";
import { IntegrationsSettingsForm } from "./_components/IntegrationsSettingsForm";
import { fetchPlatformSettings, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function PlatformSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isSuperuser = user?.is_superuser ?? false;

  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: fetchPlatformSettings,
    enabled: isSuperuser, // Only fetch if superuser
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <PageWrapper title="Platform Settings">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </PageWrapper>
    );
  }

  // Show access denied for non-superusers
  if (!isSuperuser) {
    return (
      <PageWrapper title="Platform Settings">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don&apos;t have permission to access Platform Settings. This page is only accessible to superusers.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // Transform settings data for forms
  const generalSettings = settingsData ? {
    site_name: settingsData.site_name,
    site_description: settingsData.site_description,
    default_language: settingsData.default_language,
    timezone: settingsData.timezone,
    support_email: settingsData.support_email,
    terms_url: settingsData.terms_url,
    privacy_url: settingsData.privacy_url,
  } : undefined;

  const storageSettings = settingsData ? {
    storage_backend: settingsData.storage_backend,
    s3_bucket_name: settingsData.s3_bucket_name,
    s3_region: settingsData.s3_region,
    s3_access_key_id: settingsData.s3_access_key_id,
    s3_endpoint_url: settingsData.s3_endpoint_url,
    s3_custom_domain: settingsData.s3_custom_domain,
    gcs_bucket_name: settingsData.gcs_bucket_name,
    gcs_project_id: settingsData.gcs_project_id,
    azure_container_name: settingsData.azure_container_name,
    azure_account_name: settingsData.azure_account_name,
    max_file_size_mb: settingsData.max_file_size_mb,
    allowed_extensions: settingsData.allowed_extensions,
  } : undefined;

  const emailSettings = settingsData ? {
    smtp_host: settingsData.smtp_host,
    smtp_port: settingsData.smtp_port,
    smtp_username: settingsData.smtp_username,
    smtp_use_tls: settingsData.smtp_use_tls,
    smtp_use_ssl: settingsData.smtp_use_ssl,
    default_from_email: settingsData.default_from_email,
    default_from_name: settingsData.default_from_name,
    email_timeout: settingsData.email_timeout,
  } : undefined;

  const SettingsSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-1/2" />
    </div>
  );

  return (
    <PageWrapper 
      title="Platform Settings"
      description="Configure platform-wide settings including general options, email, storage, AI engine, and integrations."
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load settings: {getApiErrorMessage(error)}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="ai">AI Engine</TabsTrigger>
          <TabsTrigger value="integrations">Integrations (LTI/SSO)</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SettingsSkeleton />
              ) : (
                <GeneralSettingsForm initialData={generalSettings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure SMTP server for sending emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SettingsSkeleton />
              ) : (
                <EmailSettingsForm initialData={emailSettings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Configure file storage backend (e.g., S3).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SettingsSkeleton />
              ) : (
                <StorageSettingsForm initialData={storageSettings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Engine Settings</CardTitle>
              <CardDescription>
                Manage AI model configurations and prompt templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Links or embedded management for AI Model Configurations and
                Prompt Templates.
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin/settings/models">Manage Model Configs</Link>
              </Button>
              <Button variant="outline" asChild className="ml-2">
                <Link href="/admin/settings/prompts">Manage Prompts</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSettingsForm />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
