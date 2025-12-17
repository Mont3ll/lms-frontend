"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCourseDetails,
  updateCourseModules,
  createModule,
  createContentItem,
  updateContentItem,
  getApiErrorMessage,
  ContentItemData,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { ModuleManager } from "@/components/features/courses/ModuleManager";
import { AddModuleModal } from "@/components/modals/AddModuleModal";
import { AddContentItemModal } from "@/components/modals/AddContentItemModal";
import { ContentItemEditor } from "@/components/features/courses/ContentItemEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { toast } from "sonner";
import { Module, ContentItem } from "@/lib/types";

export default function ManageModulesPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const queryClient = useQueryClient();

  // Modal states
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [isAddContentItemModalOpen, setIsAddContentItemModalOpen] = useState(
    false
  );
  const [isContentItemEditorOpen, setIsContentItemEditorOpen] = useState(false);
  const [selectedModuleForContent, setSelectedModuleForContent] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [selectedContentItem, setSelectedContentItem] = useState<{
    moduleId: string;
    item: ContentItem;
    mode: 'view' | 'edit';
  } | null>(null);

  const {
    data: course,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COURSE_DETAILS, courseSlug],
    queryFn: () => fetchCourseDetails(courseSlug),
    enabled: !!courseSlug,
  });

  const updateMutation = useMutation({
    mutationFn: (modulesData: Module[]) =>
      updateCourseModules(courseSlug, modulesData),
    onSuccess: () => {
      toast.success("Modules Updated", {
        description: "Module structure saved successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSE_DETAILS, courseSlug],
      });
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: `Failed to update modules: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const addModuleMutation = useMutation({
    mutationFn: (moduleData: { title: string; description?: string }) =>
      createModule(courseSlug, moduleData),
    onSuccess: () => {
      toast.success("Module Added", {
        description: "New module created successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSE_DETAILS, courseSlug],
      });
      setIsAddModuleModalOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to Add Module", {
        description: `Could not create module: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const addContentItemMutation = useMutation({
    mutationFn: ({
      moduleId,
      itemData,
    }: {
      moduleId: string;
      itemData: ContentItemData;
    }) => createContentItem(courseSlug, moduleId, itemData),
    onSuccess: () => {
      toast.success("Content Item Added", {
        description: "New content item created successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSE_DETAILS, courseSlug],
      });
      setIsAddContentItemModalOpen(false);
      setSelectedModuleForContent(null);
    },
    onError: (error) => {
      toast.error("Failed to Add Content Item", {
        description: `Could not create content item: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const updateContentItemMutation = useMutation({
    mutationFn: ({ moduleId, itemId, itemData }: {
      moduleId: string;
      itemId: string;
      itemData: Partial<ContentItem>;
    }) => updateContentItem(courseSlug, moduleId, itemId, itemData),
    onSuccess: () => {
      toast.success("Content Item Updated", {
        description: "Content item updated successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSE_DETAILS, courseSlug],
      });
      setIsContentItemEditorOpen(false);
      setSelectedContentItem(null);
    },
    onError: (error) => {
      toast.error("Failed to Update Content Item", {
        description: `Could not update content item: ${getApiErrorMessage(error)}`,
      });
    },
  });

  const handleModuleUpdate = (updatedModules: Module[]) => {
    updateMutation.mutate(updatedModules);
  };

  const handleAddModule = () => {
    setIsAddModuleModalOpen(true);
  };

  const handleAddModuleSubmit = async (data: {
    title: string;
    description?: string;
  }) => {
    await addModuleMutation.mutateAsync(data);
  };

  const handleAddContentItem = (moduleId: string) => {
    const courseModule = course?.modules?.find((m) => m.id === moduleId);
    setSelectedModuleForContent({
      id: moduleId,
      title: courseModule?.title || "Unknown Module",
    });
    setIsAddContentItemModalOpen(true);
  };

  const handleAddContentItemSubmit = async (data: ContentItemData) => {
    if (!selectedModuleForContent) return;
    await addContentItemMutation.mutateAsync({
      moduleId: selectedModuleForContent.id,
      itemData: data,
    });
  };

  const handleEditContentItem = (moduleId: string, itemId: string) => {
    const courseModule = course?.modules?.find((m) => m.id === moduleId);
    const item = courseModule?.content_items?.find((i) => i.id === itemId);
    
    if (item) {
      setSelectedContentItem({
        moduleId,
        item,
        mode: 'edit'
      });
      setIsContentItemEditorOpen(true);
    }
  };

  const handleViewContentItem = (moduleId: string, itemId: string) => {
    const courseModule = course?.modules?.find((m) => m.id === moduleId);
    const item = courseModule?.content_items?.find((i) => i.id === itemId);
    
    if (item) {
      setSelectedContentItem({
        moduleId,
        item,
        mode: 'view'
      });
      setIsContentItemEditorOpen(true);
    }
  };

  const handleContentItemEditorSubmit = async (data: Partial<ContentItem>) => {
    if (!selectedContentItem) return;
    
    await updateContentItemMutation.mutateAsync({
      moduleId: selectedContentItem.moduleId,
      itemId: selectedContentItem.item.id,
      itemData: data,
    });
  };

  const handleCloseContentItemEditor = () => {
    setIsContentItemEditorOpen(false);
    setSelectedContentItem(null);
  };

  if (isLoading) {
    return (
      <PageWrapper title="Loading Course..." description="Add modules and content items to structure your course material.">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper title="Error" description="Add modules and content items to structure your course material.">
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Failed to load course details: {getApiErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper
        title={`Manage Content: ${course?.title || "Course"}`}
        description="Add modules and content items to structure your course material."
        actions={
          <>
            <Button onClick={() => router.back()} variant="outline" className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleAddModule} className="cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </>
        }
      >
        <ModuleManager
          initialModules={course?.modules || []}
          onSave={handleModuleUpdate}
          isSaving={updateMutation.isPending}
          onAddContentItem={handleAddContentItem}
          onEditContentItem={handleEditContentItem}
          onViewContentItem={handleViewContentItem}
        />
      </PageWrapper>

      <AddModuleModal
        isOpen={isAddModuleModalOpen}
        onClose={() => setIsAddModuleModalOpen(false)}
        onSubmit={handleAddModuleSubmit}
        isLoading={addModuleMutation.isPending}
      />

      <AddContentItemModal
        isOpen={isAddContentItemModalOpen}
        onClose={() => {
          setIsAddContentItemModalOpen(false);
          setSelectedModuleForContent(null);
        }}
        onSubmit={handleAddContentItemSubmit}
        isLoading={addContentItemMutation.isPending}
        moduleTitle={selectedModuleForContent?.title}
      />

      {selectedContentItem && (
        <ContentItemEditor
          isOpen={isContentItemEditorOpen}
          onClose={handleCloseContentItemEditor}
          initialData={selectedContentItem.item}
          mode={selectedContentItem.mode}
          onSubmit={handleContentItemEditorSubmit}
          isLoading={updateContentItemMutation.isPending}
        />
      )}
    </>
  );
}
