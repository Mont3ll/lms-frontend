import React from "react";
import { DataTable } from "@/components/features/common/DataTable";
import { columns } from "@/app/admin/users/_components/columns"; // Import columns definition
import { User } from "@/lib/types";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  // Add pagination props if needed
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading /*, pagination props */,
}) => {
  if (isLoading) {
    // Render table skeletons
    return <div>Loading Users Table...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      filterColumnId="email"
      filterInputPlaceholder="Filter by email..."
      // Pass pagination state and handlers if needed
    />
  );
};
