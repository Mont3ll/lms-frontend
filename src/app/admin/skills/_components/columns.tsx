"use client";

import { ColumnDef, HeaderContext, CellContext, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { SkillListItem, SkillCategory } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Get badge variant based on skill category */
const getCategoryBadgeVariant = (
  category: SkillCategory
): "default" | "secondary" | "outline" | "destructive" => {
  switch (category) {
    case "TECHNICAL":
      return "default";
    case "SOFT":
      return "secondary";
    case "DOMAIN":
      return "outline";
    default:
      return "secondary";
  }
};

/** Get category display label */
const getCategoryLabel = (category: SkillCategory): string => {
  const labels: Record<SkillCategory, string> = {
    TECHNICAL: "Technical",
    SOFT: "Soft Skills",
    DOMAIN: "Domain",
    LANGUAGE: "Language",
    METHODOLOGY: "Methodology",
    TOOL: "Tool",
    OTHER: "Other",
  };
  return labels[category] || category;
};

/** Props for the actions cell component */
interface SkillActionsCellProps {
  skill: SkillListItem;
  onView?: (skill: SkillListItem) => void;
  onEdit?: (skill: SkillListItem) => void;
  onDelete?: (skill: SkillListItem) => void;
}

/** Actions cell component */
export const SkillActionsCell: React.FC<SkillActionsCellProps> = ({
  skill,
  onView,
  onEdit,
  onDelete,
}) => {
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
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem onClick={() => onView(skill)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(skill)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(skill)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** Create columns with action handlers */
export const createColumns = (
  handlers: {
    onView?: (skill: SkillListItem) => void;
    onEdit?: (skill: SkillListItem) => void;
    onDelete?: (skill: SkillListItem) => void;
  }
): ColumnDef<SkillListItem>[] => [
  {
    accessorKey: "name",
    header: ({ column }: HeaderContext<SkillListItem, unknown>) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: CellContext<SkillListItem, unknown>) => {
      const skill = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{skill.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: CellContext<SkillListItem, unknown>) => {
      const category = row.getValue("category") as SkillCategory;
      return (
        <Badge variant={getCategoryBadgeVariant(category)}>
          {getCategoryLabel(category)}
        </Badge>
      );
    },
    filterFn: (row: Row<SkillListItem>, id: string, value: string[]) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "difficulty_level",
    header: "Difficulty",
    cell: ({ row }: CellContext<SkillListItem, unknown>) => {
      const level = row.getValue("difficulty_level") as string;
      const labels: Record<string, string> = {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
      };
      return <span className="capitalize">{labels[level] || level}</span>;
    },
  },
  {
    accessorKey: "module_count",
    header: ({ column }: HeaderContext<SkillListItem, unknown>) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Modules
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: CellContext<SkillListItem, unknown>) => {
      const count = row.getValue("module_count") as number;
      return <span>{count || 0}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: CellContext<SkillListItem, unknown>) => {
      const date = row.getValue("created_at") as string;
      return <span>{formatDate(date)}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }: CellContext<SkillListItem, unknown>) => {
      const skill = row.original;
      return (
        <SkillActionsCell
          skill={skill}
          onView={handlers.onView}
          onEdit={handlers.onEdit}
          onDelete={handlers.onDelete}
        />
      );
    },
  },
];

/** Default columns (without handlers - for basic display) */
export const columns: ColumnDef<SkillListItem>[] = createColumns({});
