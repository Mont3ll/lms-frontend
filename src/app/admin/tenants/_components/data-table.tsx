"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Filter, Loader2, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTenant, fetchTenants, getApiErrorMessage } from "@/lib/api";
import { Tenant, PaginatedResponse } from "@/lib/types";
import { createColumns } from "./columns";
import { useAuth } from "@/components/providers/AuthProvider";

interface DataTableProps {
  columns?: ColumnDef<Tenant>[];
}

export function TenantsDataTable({ columns: externalColumns }: DataTableProps) {
  const { user } = useAuth();
  const isSuperuser = user?.is_superuser === true;
  
  const [data, setData] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const loadTenants = async (page: number = 1, search: string = "", status: string = "all") => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string | number | boolean> = {
        page,
        page_size: pageSize,
      };
      
      if (search) {
        params.search = search;
      }
      
      if (status !== "all") {
        params.is_active = status === "active";
      }

      const response: PaginatedResponse<Tenant> = await fetchTenants(params);
      
      setData(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));
      setCurrentPage(page);

      // Debugging: Log the response to verify tenant data
      console.log("Tenant data fetched:", response.results);
    } catch (err) {
      console.error("Error loading tenants:", err);
      setError(err instanceof Error ? err.message : "Failed to load tenants");
      setData([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load tenants when debounced search term or status filter changes
  useEffect(() => {
    loadTenants(1, debouncedSearchTerm, statusFilter);
  }, [debouncedSearchTerm, statusFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    setDebouncedSearchTerm(searchTerm); // Trigger immediate search
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      loadTenants(newPage, debouncedSearchTerm, statusFilter);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      loadTenants(newPage, debouncedSearchTerm, statusFilter);
    }
  };

  // Delete handlers
  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTenant(tenantToDelete.id);
      toast.success("Tenant Deleted", {
        description: `Tenant "${tenantToDelete.name}" has been deleted.`,
      });
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      // Refresh the list
      loadTenants(currentPage, searchTerm, statusFilter);
    } catch (error) {
      toast.error("Delete Failed", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Create columns with delete handler and superuser flag
  const columns = useMemo(
    () => externalColumns ?? createColumns({ onDelete: handleDeleteClick, isSuperuser }),
    [externalColumns, isSuperuser]
  );

  const table = useReactTable({
    data: data || [], // Ensure data is never undefined
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Remove manual pagination for now since we're handling it ourselves
    enableRowSelection: true,
    enableMultiRowSelection: true,
  });

  // Render table body content based on state
  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="h-4 bg-muted rounded animate-pulse" />
          </TableCell>
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <div className="text-destructive">
              Error loading tenants: {error}
            </div>
            <Button 
              onClick={() => loadTenants(1, debouncedSearchTerm, statusFilter)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </TableCell>
        </TableRow>
      );
    }

    if (table.getRowModel()?.rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className="h-24 text-center"
        >
          No tenants found.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8 max-w-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Status: {statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Inactive"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => handleStatusFilter("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "active"}
                onCheckedChange={() => handleStatusFilter("active")}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "inactive"}
                onCheckedChange={() => handleStatusFilter("inactive")}
              >
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {loading ? (
            "Loading..."
          ) : (
            `Showing ${data.length} of ${totalCount} tenant(s)`
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={loading || currentPage <= 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={loading || currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tenant &quot;{tenantToDelete?.name}&quot;? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}