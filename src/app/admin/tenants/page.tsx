"use client";

import React from "react";
import { TenantsDataTable } from "./_components/data-table";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ManageTenantsPage() {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser === true;

  return (
    <PageWrapper
      title="Tenant Management"
      description="Create and manage tenant organizations, configure domains, and monitor tenant health."
      actions={
        isSuperuser ? (
          <Button asChild>
            <Link href="/admin/tenants/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Tenant
            </Link>
          </Button>
        ) : null
      }
    >
      <TenantsDataTable />
    </PageWrapper>
  );
}
