"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  FolderKanban,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  BookOpen,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchLearningPaths, deleteLearningPath } from "@/lib/api";
import { LearningPath } from "@/lib/types";

export default function InstructorLearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pathToDelete, setPathToDelete] = useState<LearningPath | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchLearningPaths();
      setLearningPaths(response.results);
    } catch (err) {
      console.error("Error loading learning paths:", err);
      setError("Failed to load learning paths. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (path: LearningPath) => {
    setPathToDelete(path);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pathToDelete) return;

    setIsDeleting(true);
    try {
      await deleteLearningPath(pathToDelete.slug);
      setLearningPaths((prev) =>
        prev.filter((p) => p.id !== pathToDelete.id)
      );
      toast.success(`"${pathToDelete.title}" has been deleted.`);
    } catch (err) {
      console.error("Error deleting learning path:", err);
      toast.error("Failed to delete learning path. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPathToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="default">Published</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter learning paths based on search query
  const filteredPaths = learningPaths.filter((path) =>
    path.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <PageWrapper
        title="Learning Paths"
        description="Create and curate learning journeys by combining courses and modules."
        actions={
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Learning Path
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Learning Paths"
        description="Create and curate learning journeys by combining courses and modules."
        actions={
          <Link href="/instructor/learning-paths/new">
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              New Learning Path
            </Button>
          </Link>
        }
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadLearningPaths} variant="outline" className="mt-4 cursor-pointer">
          Try Again
        </Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Learning Paths"
      description="Create and curate learning journeys by combining courses and modules."
      actions={
        <Link href="/instructor/learning-paths/new">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            New Learning Path
          </Button>
        </Link>
      }
    >
      {learningPaths.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No learning paths yet</CardTitle>
            <CardDescription className="mb-4">
              Create structured learning journeys by combining courses into guided pathways.
            </CardDescription>
            <Link href="/instructor/learning-paths/new">
              <Button className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Learning Path
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredPaths.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">
                No learning paths match your search.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPaths.map((path) => (
            <Card key={path.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-medium flex items-center gap-2 truncate">
                    <FolderKanban className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{path.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {path.description || "No description provided"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/instructor/learning-paths/${path.slug}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/learner/learning-paths/${path.slug}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={() => handleDeleteClick(path)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{path.step_count} {path.step_count === 1 ? "step" : "steps"}</span>
                  </div>
                  {getStatusBadge(path.status)}
                </div>
                <Link href={`/instructor/learning-paths/${path.slug}`}>
                  <Button variant="outline" size="sm" className="w-full cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Path
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Learning Path</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{pathToDelete?.title}&quot;? This action
              cannot be undone and will remove all steps associated with this path.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
