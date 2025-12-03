"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Tenant } from '@/lib/types';

// TODO: Add delete confirmation dialog logic
const handleDelete = (tenantId: string) => {
  alert(`Placeholder: Delete tenant ${tenantId}`);
};

export const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name || "N/A"}</span>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span>{row.original.slug || "N/A"}</span>
    ),
  },
  {
    accessorKey: "domains",
    header: "Domains",
    cell: ({ row }) => {
      const domains = row.original.domains;
      if (!domains || domains.length === 0) {
        return <span className="text-xs text-muted-foreground">No domains</span>;
      }
      
      const domainNames = domains.map((domainObj) => domainObj.domain).join(", ");
      return <span className="text-xs">{domainNames}</span>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <Badge variant={isActive ? "secondary" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, _id, value) => value === row.original.is_active,
  },
  {
    accessorKey: "created_at",
    header: "Created On",
    cell: ({ row }) => formatDate(row.original.created_at || "N/A"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tenant = row.original;

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
            <DropdownMenuItem asChild>
              <Link href={`/admin/tenants/${tenant.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => handleDelete(tenant.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
