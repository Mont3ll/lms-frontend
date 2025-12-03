"use client";

import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ContentItem } from '@/lib/types';
import { toast } from 'sonner';

// Define content type choices based on backend model
const CONTENT_TYPE_CHOICES = [
    { value: 'TEXT', label: 'Text / HTML' },
    { value: 'URL', label: 'External URL' },
    { value: 'VIDEO', label: 'Video (URL)' },
    { value: 'DOCUMENT', label: 'Document (Upload)' },
    { value: 'IMAGE', label: 'Image' },
];

// Updated schema to match ContentItem type properties
const contentItemSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content_type: z.enum(['TEXT', 'VIDEO', 'IMAGE', 'URL', 'DOCUMENT']),
    text_content: z.string().optional().nullable(),
    external_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    is_published: z.boolean(),
});

type ContentItemFormValues = z.infer<typeof contentItemSchema>;

interface ContentItemEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ContentItem | null;
  mode?: 'view' | 'edit';
  onSubmit?: (data: ContentItemFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const ContentItemEditor: React.FC<ContentItemEditorProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'edit',
  onSubmit,
  isLoading = false,
}) => {
    const isEditing = !!initialData;
    const isViewMode = mode === 'view';

    const methods = useForm<ContentItemFormValues>({
        resolver: zodResolver(contentItemSchema),
        defaultValues: {
            title: '',
            content_type: 'TEXT',
            text_content: '',
            external_url: '',
            is_published: false,
        },
    });

    const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = methods;
    const selectedContentType = watch('content_type');

    // Effect to reset form when initialData changes or modal opens/closes
    useEffect(() => {
        if (isOpen && initialData) {
            reset({
                title: initialData.title || '',
                content_type: initialData.content_type as 'TEXT' | 'VIDEO' | 'IMAGE' | 'URL' | 'DOCUMENT',
                text_content: initialData.text_content || '',
                external_url: initialData.external_url || '',
                is_published: initialData.is_published || false,
            });
        } else if (isOpen && !initialData) {
            reset({
                title: '',
                content_type: 'TEXT',
                text_content: '',
                external_url: '',
                is_published: false,
            });
        }
    }, [initialData, isOpen, reset]);

    const handleFormSubmit = async (data: ContentItemFormValues) => {
        if (isViewMode) return;
        
        try {
            await onSubmit?.(data);
            toast.success("Success", {
                description: `Content item ${isEditing ? 'updated' : 'created'} successfully.`,
            });
        } catch {
            toast.error("Error", {
                description: `Failed to ${isEditing ? 'update' : 'create'} content item.`,
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'View' : (isEditing ? 'Edit' : 'Add')} Content Item
          </DialogTitle>
        </DialogHeader>
        
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                {...register('title')} 
                disabled={isViewMode}
                placeholder="Enter content title..."
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content_type">Content Type</Label>
              <Select 
                value={selectedContentType} 
                onValueChange={(value) => setValue('content_type', value as 'TEXT' | 'VIDEO' | 'IMAGE' | 'URL' | 'DOCUMENT')}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_CHOICES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.content_type && <p className="text-sm text-destructive">{errors.content_type.message}</p>}
            </div>

            {/* Conditional Fields based on Type */}
            {selectedContentType === 'TEXT' && (
              <div className="grid gap-2">
                <Label htmlFor="text_content">Text Content (Markdown/HTML)</Label>
                <Textarea 
                  id="text_content" 
                  {...register('text_content')} 
                  rows={10} 
                  disabled={isViewMode}
                  placeholder="Enter your content here..."
                />
                {errors.text_content && <p className="text-sm text-destructive">{errors.text_content.message}</p>}
              </div>
            )}

            {(selectedContentType === 'URL' || selectedContentType === 'VIDEO') && (
              <div className="grid gap-2">
                <Label htmlFor="external_url">
                  {selectedContentType === 'VIDEO' ? 'Video URL (e.g., YouTube, Vimeo)' : 'External URL'}
                </Label>
                <Input 
                  id="external_url" 
                  {...register('external_url')} 
                  disabled={isViewMode}
                  placeholder="https://..."
                />
                {errors.external_url && <p className="text-sm text-destructive">{errors.external_url.message}</p>}
              </div>
            )}

            {selectedContentType === 'DOCUMENT' && (
              <div className="grid gap-2">
                <Label>Document Upload</Label>
                <p className="text-sm text-muted-foreground">
                  Document upload functionality will be available in a future update.
                </p>
              </div>
            )}

            {selectedContentType === 'IMAGE' && (
              <div className="grid gap-2">
                <Label>Image Upload</Label>
                <p className="text-sm text-muted-foreground">
                  Image upload functionality will be available in a future update.
                </p>
              </div>
            )}

            {!isViewMode && (
              <div className="flex items-center space-x-2 pt-4">
                <Switch 
                  id="is_published" 
                  checked={watch('is_published')}
                  onCheckedChange={(checked) => setValue('is_published', checked)}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
            )}

            {isViewMode && (
              <div className="pt-4">
                <Label>Status</Label>
                <p className="text-sm text-muted-foreground">
                  {watch('is_published') ? 'Published' : 'Draft'}
                </p>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {isViewMode ? 'Close' : 'Cancel'}
                </Button>
              </DialogClose>
              {!isViewMode && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Add Item'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
