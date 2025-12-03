"use client";

import React from "react";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // For organizing settings
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import specific settings forms
// import { GeneralSettingsForm } from './_components/GeneralSettingsForm';
// import { EmailSettingsForm } from './_components/EmailSettingsForm';
// import { StorageSettingsForm } from './_components/StorageSettingsForm';
// import { AISettingsForm } from './_components/AISettingsForm'; // Link to manage Model Configs

export default function PlatformSettingsPage() {
  // TODO: Fetch current settings if they are stored in the database and editable via API
  // const { data: settingsData, isLoading } = useQuery(...)

  return (
    <PageWrapper title="Platform Settings">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="ai">AI Engine</TabsTrigger>
          <TabsTrigger value="integrations">Integrations (LTI/SSO)</TabsTrigger>
          {/* Add more tabs as needed */}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for GeneralSettingsForm */}
              <p>
                General settings form placeholder (e.g., Site Name, Logo Upload,
                Default Language).
              </p>
              {/* <GeneralSettingsForm initialData={settingsData?.general} /> */}
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
              {/* Placeholder for EmailSettingsForm */}
              <p>
                Email settings form placeholder (Host, Port, User, Password,
                From Address). Values likely come from environment variables but
                could be overridden here if design allows.
              </p>
              {/* <EmailSettingsForm initialData={settingsData?.email} /> */}
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
              {/* Placeholder for StorageSettingsForm */}
              <p>
                Storage settings form placeholder (Bucket Name, Region, Access
                Keys). Values likely come from environment variables but could
                be displayed or partially configured here.
              </p>
              {/* <StorageSettingsForm initialData={settingsData?.storage} /> */}
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
              {/* Placeholder or Link to Model/Prompt Management Pages */}
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
              {/* <AISettingsForm /> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations (LTI/SSO)</CardTitle>
              <CardDescription>
                Configure Learning Tools Interoperability and Single Sign-On.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for LTI/SSO configuration forms */}
              <p>
                LTI/SSO configuration forms placeholder. These are complex and
                often involve multiple fields per provider/platform.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
