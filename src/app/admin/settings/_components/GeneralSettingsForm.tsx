"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUpload } from "@/components/forms/FileUpload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateGeneralSettings, uploadFile, getApiErrorMessage } from "@/lib/api";

const generalSettingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required").max(100),
  site_description: z.string().max(500).optional(),
  default_language: z.string().min(2, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
  support_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  terms_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  privacy_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Chicago", label: "Central Time (US)" },
  { value: "America/Denver", label: "Mountain Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

interface GeneralSettingsFormProps {
  initialData?: Partial<GeneralSettingsFormData> & {
    logo_url?: string;
    favicon_url?: string;
  };
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [faviconFile, setFaviconFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(initialData?.logo_url || null);
  const [faviconPreview, setFaviconPreview] = React.useState<string | null>(initialData?.favicon_url || null);

  const methods = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      site_name: initialData?.site_name ?? "",
      site_description: initialData?.site_description ?? "",
      default_language: initialData?.default_language ?? "en",
      timezone: initialData?.timezone ?? "UTC",
      support_email: initialData?.support_email ?? "",
      terms_url: initialData?.terms_url ?? "",
      privacy_url: initialData?.privacy_url ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: GeneralSettingsFormData) => {
    setIsSubmitting(true);
    try {
      let logoUrl = initialData?.logo_url || "";
      let faviconUrl = initialData?.favicon_url || "";

      // Upload logo if a new file was selected
      if (logoFile) {
        const uploadedLogo = await uploadFile(logoFile);
        logoUrl = uploadedLogo.file_url || "";
      }
      
      // Upload favicon if a new file was selected
      if (faviconFile) {
        const uploadedFavicon = await uploadFile(faviconFile);
        faviconUrl = uploadedFavicon.file_url || "";
      }

      await updateGeneralSettings({
        site_name: data.site_name,
        site_description: data.site_description || "",
        default_language: data.default_language,
        timezone: data.timezone,
        support_email: data.support_email || "",
        terms_url: data.terms_url || "",
        privacy_url: data.privacy_url || "",
        logo_url: logoUrl,
        favicon_url: faviconUrl,
      });
      
      toast.success("General settings have been updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Site Identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Site Identity</h3>
          
          <FormField
            name="site_name"
            label="Site Name"
            placeholder="My Learning Platform"
          />

          <div className="grid gap-2">
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              {...register("site_description")}
              placeholder="A brief description of your learning platform"
              rows={3}
            />
            {errors.site_description && (
              <p className="text-sm text-destructive">{errors.site_description.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Logo</Label>
              {logoPreview && (
                <div className="mb-2 p-2 border rounded-md bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={logoPreview} 
                    alt="Current logo" 
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
              <FileUpload
                accept="image/*"
                maxSize={2 * 1024 * 1024}
                onFileSelect={(file) => {
                  setLogoFile(file);
                  if (file) {
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
                placeholder="Upload logo (max 2MB)"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 200x50px, PNG or SVG
              </p>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              {faviconPreview && (
                <div className="mb-2 p-2 border rounded-md bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={faviconPreview} 
                    alt="Current favicon" 
                    className="max-h-8 object-contain"
                  />
                </div>
              )}
              <FileUpload
                accept="image/x-icon,image/png"
                maxSize={512 * 1024}
                onFileSelect={(file) => {
                  setFaviconFile(file);
                  if (file) {
                    setFaviconPreview(URL.createObjectURL(file));
                  }
                }}
                placeholder="Upload favicon (max 512KB)"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 32x32px, ICO or PNG
              </p>
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Localization</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <SelectField
              name="default_language"
              label="Default Language"
              options={LANGUAGE_OPTIONS}
              placeholder="Select language"
            />
            <SelectField
              name="timezone"
              label="Default Timezone"
              options={TIMEZONE_OPTIONS}
              placeholder="Select timezone"
            />
          </div>
        </div>

        {/* Contact & Legal */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Contact & Legal</h3>
          
          <FormField
            name="support_email"
            label="Support Email"
            type="email"
            placeholder="support@example.com"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              name="terms_url"
              label="Terms of Service URL"
              type="url"
              placeholder="https://example.com/terms"
            />
            <FormField
              name="privacy_url"
              label="Privacy Policy URL"
              type="url"
              placeholder="https://example.com/privacy"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save General Settings
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
