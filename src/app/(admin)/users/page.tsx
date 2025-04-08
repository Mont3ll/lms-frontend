"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
// import { fetchUsers } from '@/lib/api'; // Assume API function exists
// import { QUERY_KEYS } from '@/lib/constants';
import { DataTable } from "@/components/features/common/DataTable"; // Import your DataTable
import { columns } from "./_components/columns"; // Define columns for users table
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { User } from "@/lib/types"; // Import User type

export default function ManageUsersPage() {
  // Fetch users (add pagination/filtering params)
  // const { data: userData, isLoading, error } = useQuery({
  //     queryKey: [QUERY_KEYS.USERS], // Add filters/pagination keys if needed
  //     queryFn: () => fetchUsers({ page: 1, limit: 10 }),
  // });

  // Placeholder data
  const isLoading = false;
  const error = null;
  const userData = {
    results: [
      {
        id: "uuid-1",
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "User",
        role: "ADMIN",
        status: "ACTIVE",
        tenant_name: "Default",
        date_joined: new Date().toISOString(),
      },
      {
        id: "uuid-2",
        email: "instructor@example.com",
        first_name: "Inst",
        last_name: "Ructor",
        role: "INSTRUCTOR",
        status: "ACTIVE",
        tenant_name: "Default",
        date_joined: new Date().toISOString(),
      },
      {
        id: "uuid-3",
        email: "learner@example.com",
        first_name: "Lea",
        last_name: "Arner",
        role: "LEARNER",
        status: "ACTIVE",
        tenant_name: "Default",
        date_joined: new Date().toISOString(),
      },
    ] as User[], // Cast to User[] or appropriate type
    count: 3, // Example count
  };

  const tableData = userData?.results || [];

  return (
    <PageWrapper
      title="User Management"
      actions={
        <Button asChild>
          <Link href="/users/invite">
            {" "}
            {/* Or /users/new */}
            <PlusCircle className="mr-2 h-4 w-4" /> Invite User
          </Link>
        </Button>
      }
    >
      {isLoading && <p>Loading users...</p> /* Use Skeletons */}
      {
        error && (
          <p className="text-destructive">Error loading users.</p>
        ) /* Use Alert */
      }
      {!isLoading && !error && (
        <DataTable columns={columns} data={tableData} />
        // TODO: Add pagination controls linked to TanStack Table state and API calls
      )}
    </PageWrapper>
  );
}
