"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Module, ContentItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Trash2,
  Edit2,
  GripVertical,
  FileText,
  PlayCircle,
  Link,
  FileImage,
  HelpCircle,
  Eye,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";

interface ModuleManagerProps {
  initialModules: Module[];
  onSave: (updatedModules: Module[]) => void;
  isSaving?: boolean;
  onEditContentItem?: (moduleId: string, itemId: string) => void;
  onViewContentItem?: (moduleId: string, itemId: string) => void;
  onAddContentItem?: (moduleId: string) => void;
}

// Content type icon mapping
const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case "TEXT":
      return FileText;
    case "VIDEO":
      return PlayCircle;
    case "IMAGE":
      return FileImage;
    case "URL":
      return Link;
    case "DOCUMENT":
      return FileImage;
    default:
      return HelpCircle;
  }
};

// Content Item Component
const ContentItemComponent = ({
  item,
  index,
  onEdit,
  onView,
  onDelete,
}: {
  item: ContentItem;
  moduleId: string;
  index: number;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const IconComponent = getContentTypeIcon(item.content_type);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Prevent click if user is interacting with action buttons or drag handle
    const target = e.target as HTMLElement;
    if (target.closest('.action-buttons') || target.closest('[data-drag-handle]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    onView();
  };

  return (
    <Draggable draggableId={`content-${item.id}`} index={index} isDragDisabled={false}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex items-center gap-2 ml-4 pl-4 border-l group transition-transform",
            snapshot.isDragging && "shadow-lg bg-background border border-border rounded-md z-50"
          )}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging && {
              transform: provided.draggableProps.style?.transform,
            }),
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div 
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing flex-shrink-0 p-1"
            data-drag-handle="true"
            style={{ touchAction: 'none' }}
            onMouseDown={(e) => {
              // Don't prevent default - let the drag handle it
              e.stopPropagation();
            }}
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
          <div
            className={cn(
              "flex items-center justify-between p-2 rounded text-sm w-full transition-colors",
              !snapshot.isDragging && "hover:bg-accent/50 cursor-pointer"
            )}
            onClick={handleContentClick}
          >
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{item.title}</span>
              <Badge variant="secondary" className="text-xs">
                {item.content_type_display}
              </Badge>
              {!item.is_published && (
                <Badge variant="outline" className="text-xs">
                  Draft
                </Badge>
              )}
            </div>
            <div 
              className={cn(
                "action-buttons flex items-center gap-1 transition-opacity",
                isHovering && !snapshot.isDragging ? "opacity-100" : "opacity-0"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer hover:bg-accent"
                onClick={(e) => handleActionClick(e, onView)}
                title="View content"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer hover:bg-accent"
                onClick={(e) => handleActionClick(e, onEdit)}
                title="Edit content"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={(e) => handleActionClick(e, onDelete)}
                title="Delete content"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Module Component
const ModuleComponent = ({
  module,
  index,
  onEditModuleTitle,
  onDeleteModule,
  onEditContentItem,
  onViewContentItem,
  onDeleteContentItem,
  onAddContentItem,
}: {
  module: Module;
  index: number;
  onEditModuleTitle: (moduleId: string, newTitle: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onEditContentItem: (moduleId: string, itemId: string) => void;
  onViewContentItem: (moduleId: string, itemId: string) => void;
  onDeleteContentItem: (moduleId: string, itemId: string) => void;
  onAddContentItem: (moduleId: string) => void;
}) => {
  return (
    <Draggable draggableId={`module-${module.id}`} index={index} isDragDisabled={false}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "transition-transform",
            snapshot.isDragging && "shadow-lg z-50"
          )}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging && {
              transform: provided.draggableProps.style?.transform,
            }),
          }}
        >
          <div className="flex items-start gap-2">
            <div 
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1"
              style={{ touchAction: 'none' }}
              onMouseDown={(e) => {
                // Don't prevent default - let the drag handle it
                e.stopPropagation();
              }}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-grow">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-3 bg-muted/50 border-b">
                  <CardTitle className="text-base font-medium flex-grow mr-2">
                    {module.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer"
                      onClick={() => {
                        const newTitle = prompt("New Title:", module.title);
                        if (newTitle) {
                          onEditModuleTitle(module.id, newTitle);
                        }
                      }}
                      title="Edit module title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => onDeleteModule(module.id)}
                      title="Delete module"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  <Droppable droppableId={`content-${module.id}`} type="content">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "min-h-[2rem]",
                          snapshot.isDraggingOver && "bg-accent/30 rounded-md"
                        )}
                      >
                        {(module.content_items || []).map((item: ContentItem, itemIndex: number) => (
                          <ContentItemComponent
                            key={item.id}
                            item={item}
                            moduleId={module.id}
                            index={itemIndex}
                            onEdit={() => onEditContentItem(module.id, item.id)}
                            onView={() => onViewContentItem(module.id, item.id)}
                            onDelete={() => onDeleteContentItem(module.id, item.id)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="pl-12 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-8 cursor-pointer"
                      onClick={() => onAddContentItem(module.id)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Content Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Main Module Manager Component
export const ModuleManager: React.FC<ModuleManagerProps> = ({
  initialModules,
  onSave,
  isSaving,
  onEditContentItem,
  onViewContentItem,
  onAddContentItem,
}) => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'module' | 'content';
    moduleId: string;
    contentItemId?: string;
    itemName: string;
  }>({
    isOpen: false,
    type: 'module',
    moduleId: '',
    itemName: '',
  });

  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const handleDragEnd = useCallback((result: DropResult) => {
    document.body.style.userSelect = '';
    
    if (!result.destination) {
      return;
    }

    const { source, destination, type } = result;

    // Prevent updates during save
    if (isSaving) {
      return;
    }

    if (type === "module") {
      // Reordering modules
      setModules((prevModules) => {
        const newModules = Array.from(prevModules);
        const [reorderedModule] = newModules.splice(source.index, 1);
        newModules.splice(destination.index, 0, reorderedModule);

        // Update order property
        const updatedModules = newModules.map((mod, index) => ({
          ...mod,
          order: index + 1,
        }));

        // Save changes
        setTimeout(() => onSave(updatedModules), 0);
        return updatedModules;
      });
    } else if (type === "content") {
      // Reordering content items within a module
      const moduleId = destination.droppableId.replace("content-", "");
      
      setModules((prevModules) => {
        const newModules = prevModules.map((mod) => {
          if (mod.id === moduleId) {
            const newItems = Array.from(mod.content_items || []);
            const [reorderedItem] = newItems.splice(source.index, 1);
            newItems.splice(destination.index, 0, reorderedItem);

            return {
              ...mod,
              content_items: newItems.map((item, index) => ({
                ...item,
                order: index + 1,
              })),
            };
          }
          return mod;
        });

        // Save changes
        setTimeout(() => onSave(newModules), 0);
        return newModules;
      });
    }
  }, [onSave, isSaving]);

  const handleEditModuleTitle = (moduleId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    setModules((prev) => {
      const updated = prev.map((m) =>
        m.id === moduleId ? { ...m, title: newTitle.trim() } : m
      );
      onSave(updated);
      return updated;
    });
  };

  const handleDeleteModule = (moduleIdToDelete: string) => {
    const moduleToDelete = modules.find(m => m.id === moduleIdToDelete);
    if (moduleToDelete) {
      setDeleteModal({
        isOpen: true,
        type: 'module',
        moduleId: moduleIdToDelete,
        itemName: moduleToDelete.title,
      });
    }
  };

  const handleDeleteContentItem = (moduleIdToDelete: string, itemId: string) => {
    const moduleToDelete = modules.find(m => m.id === moduleIdToDelete);
    const contentItem = moduleToDelete?.content_items?.find((item: ContentItem) => item.id === itemId);
    if (contentItem) {
      setDeleteModal({
        isOpen: true,
        type: 'content',
        moduleId: moduleIdToDelete,
        contentItemId: itemId,
        itemName: contentItem.title,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'module') {
      setModules((prev) => {
        const updated = prev.filter((m) => m.id !== deleteModal.moduleId);
        onSave(updated);
        return updated;
      });
    } else if (deleteModal.type === 'content' && deleteModal.contentItemId) {
      setModules((prev) => {
        const updated = prev.map((m) =>
          m.id === deleteModal.moduleId
            ? {
                ...m,
                content_items: m.content_items?.filter((i: ContentItem) => i.id !== deleteModal.contentItemId) || [],
              }
            : m
        );
        onSave(updated);
        return updated;
      });
    }
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleEditContentItem = (moduleId: string, itemId: string) => {
    onEditContentItem?.(moduleId, itemId);
  };

  const handleViewContentItem = (moduleId: string, itemId: string) => {
    onViewContentItem?.(moduleId, itemId);
  };

  const handleAddContentItem = (moduleId: string) => {
    onAddContentItem?.(moduleId);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="modules" type="module">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-4",
                snapshot.isDraggingOver && "bg-accent/10 rounded-lg p-2"
              )}
            >
              {modules.map((module, moduleIndex) => (
                <ModuleComponent
                  key={module.id}
                  module={module}
                  index={moduleIndex}
                  onEditModuleTitle={handleEditModuleTitle}
                  onDeleteModule={handleDeleteModule}
                  onEditContentItem={handleEditContentItem}
                  onViewContentItem={handleViewContentItem}
                  onDeleteContentItem={handleDeleteContentItem}
                  onAddContentItem={handleAddContentItem}
                />
              ))}
              {provided.placeholder}

              {modules.length === 0 && (
                <p className="text-muted-foreground text-center py-6">
                  This course has no modules yet. Click &quot;Add Module&quot; to get started.
                </p>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModal.type === 'module' ? 'Delete Module' : 'Delete Content Item'}
        description={
          deleteModal.type === 'module' 
            ? 'Are you sure you want to delete this module? This will also delete all content items within it.'
            : 'Are you sure you want to delete this content item?'
        }
        itemName={deleteModal.itemName}
      />
    </>
  );
};
