"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { DataTable } from "@/components/features/common/DataTable";
import { columns } from "./_components/columns";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function ManageUsersPage() {
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => fetchUsers({ page: 1, limit: 50 }),
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
      actions={
        <Button asChild>
          <Link href="/admin/users/invite">
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      }
    >
      <DataTable columns={columns} data={tableData} />
    </PageWrapper>
  );
}
