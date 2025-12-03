"use client";

import React from "react";
import { TenantsDataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ManageTenantsPage() {
  return (
    <PageWrapper
      title="Tenant Management"
      actions={
        <Button asChild>
          <Link href="/admin/tenants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tenant
          </Link>
        </Button>
      }
    >
      <TenantsDataTable columns={columns} />
    </PageWrapper>
  );
}
