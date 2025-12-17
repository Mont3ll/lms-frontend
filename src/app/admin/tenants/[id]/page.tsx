"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTenantDetails } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Globe, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

export default function TenantDetailsPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser === true;

  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.TENANT_DETAILS, tenantId],
    queryFn: () => fetchTenantDetails(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <PageWrapper title="Tenant Details" description="Loading tenant information.">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (isError || !tenant) {
    return (
      <PageWrapper title="Tenant Details" description="There was a problem loading tenant details.">
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load tenant details</p>
          <Button asChild className="mt-4">
            <Link href="/admin/tenants">Back to Tenants</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={tenant.name}
      description="View tenant organization details and configuration."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/tenants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tenants
            </Link>
          </Button>
          {isSuperuser && (
            <Button asChild>
              <Link href={`/admin/tenants/${tenantId}/edit`}>
                <Settings className="mr-2 h-4 w-4" />
                Edit Tenant
              </Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core tenant organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tenant ID</label>
                <p className="text-sm font-mono">{tenant.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Slug</label>
                <p className="text-sm font-mono">{tenant.slug}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base font-medium">{tenant.name}</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  Whether this tenant is currently active
                </p>
              </div>
              <Badge variant={tenant.is_active ? "secondary" : "outline"}>
                {tenant.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Domains
            </CardTitle>
            <CardDescription>
              Domain names associated with this tenant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenant.domains && tenant.domains.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tenant.domains.map((domain) => (
                  <Badge
                    key={domain.id}
                    variant={domain.is_primary ? "default" : "secondary"}
                  >
                    {domain.domain}
                    {domain.is_primary && " (Primary)"}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No domains configured</p>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Theme and feature flag settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Theme Configuration</label>
              <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                {JSON.stringify(tenant.theme_config || {}, null, 2)}
              </pre>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Feature Flags</label>
              <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                {JSON.stringify(tenant.feature_flags || {}, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(tenant.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(tenant.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
