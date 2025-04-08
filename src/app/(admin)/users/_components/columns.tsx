"use client";

// Import ColumnDef type from TanStack Table
// import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/lib/types"; // Your User type
import { Checkbox } from "@/components/ui/checkbox"; // For row selection
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // For sorting and actions
import { Badge } from "@/components/ui/badge"; // To display role/status
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils"; // Date formatter

// Define type or import from correct location
type UserColumn = Pick<
  User,
  "id" | "email" | "full_name" | "role" | "status" | "date_joined"
> & { tenant_name?: string };

// Define columns - replace 'any' with ColumnDef<UserColumn>
export const columns: any[] /* ColumnDef<UserColumn>[] */ = [
  // Optional: Select Checkbox Column
  //   {
  //     id: "select",
  //     header: ({ table }) => (
  //       <Checkbox
  //         checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
  //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={(value) => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
  // Email Column with Sorting
  {
    accessorKey: "email",
    header: ({ column }: any) => {
      // Replace 'any' with correct type
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  // Name Column
  {
    accessorKey: "full_name",
    header: "Full Name", // Simple header
    cell: ({ row }: any) => (
      <span>
        {row.original.first_name} {row.original.last_name}
      </span>
    ), // Use original data if full_name not direct property
  },
  // Role Column with Badges
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }: any) => {
      const role = row.getValue("role") as User["role"];
      let variant: "default" | "secondary" | "outline" = "secondary";
      if (role === "ADMIN") variant = "default";
      if (role === "INSTRUCTOR") variant = "outline";
      return <Badge variant={variant}>{role}</Badge>;
    },
    filterFn: (row, id, value) => {
      // Example filter function
      return value.includes(row.getValue(id));
    },
  },
  // Status Column with Badges
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status") as User["status"];
      let variant: "default" | "secondary" | "outline" | "destructive" =
        "default";
      if (status === "SUSPENDED" || status === "DELETED")
        variant = "destructive";
      if (status === "INVITED") variant = "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  // Tenant Column (if managing multiple)
  //   {
  //     accessorKey: "tenant_name",
  //     header: "Tenant",
  //   },
  // Date Joined with Formatting
  {
    accessorKey: "date_joined",
    header: "Date Joined",
    cell: ({ row }: any) => {
      const date = row.getValue("date_joined");
      return <span>{formatDate(date as string)}</span>; // Use date formatter
    },
  },
  // Actions Column
  {
    id: "actions",
    cell: ({ row }: any) => {
      const user = row.original as User; // Get user data

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.email)}
            >
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* TODO: Replace with Links or modal triggers */}
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
