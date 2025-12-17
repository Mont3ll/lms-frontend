"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { DataTable, FilterConfig } from "@/components/features/common/DataTable";
import { columns } from "./_components/columns";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const userFilters: FilterConfig[] = [
  {
    columnId: "role",
    label: "Role",
    options: [
      { label: "Admin", value: "ADMIN" },
      { label: "Instructor", value: "INSTRUCTOR" },
      { label: "Learner", value: "LEARNER" },
    ],
  },
  {
    columnId: "is_active",
    label: "Status",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

export default function ManageUsersPage() {
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => fetchUsers({ page: 1, page_size: 50 }),
  });

  const tableData = userData?.results || [];

  if (isLoading) {
    return (
      <PageWrapper title="User Management">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="User Management">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Users</AlertTitle>
          <AlertDescription>
            Failed to load users. Please try again later.
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="User Management"
      description="View, invite, and manage user accounts across all tenants. Assign roles and monitor user activity."
      actions={
        <Button asChild>
          <Link href="/admin/users/invite">
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      }
    >
      <DataTable 
        columns={columns} 
        data={tableData} 
        filterColumnId="email"
        filterInputPlaceholder="Search by email, name..."
        filters={userFilters}
      />
    </PageWrapper>
  );
}
