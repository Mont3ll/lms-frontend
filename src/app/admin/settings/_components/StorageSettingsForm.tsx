"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { toast } from "sonner";
import { Loader2, HardDrive, Cloud, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { updateStorageSettings, testStorageConnection, getApiErrorMessage } from "@/lib/api";

const storageSettingsSchema = z.object({
  storage_backend: z.enum(["local", "s3", "gcs", "azure"]),
  // S3 / DigitalOcean Spaces / MinIO settings
  s3_bucket_name: z.string().optional(),
  s3_region: z.string().optional(),
  s3_access_key_id: z.string().optional(),
  s3_secret_access_key: z.string().optional(),
  s3_endpoint_url: z.string().url().optional().or(z.literal("")),
  s3_custom_domain: z.string().optional(),
  // GCS settings
  gcs_bucket_name: z.string().optional(),
  gcs_project_id: z.string().optional(),
  // Azure settings
  azure_container_name: z.string().optional(),
  azure_account_name: z.string().optional(),
  azure_account_key: z.string().optional(),
  // General settings
  max_file_size_mb: z.coerce.number().min(1).max(500),
  allowed_extensions: z.string().optional(),
});

type StorageSettingsFormData = z.infer<typeof storageSettingsSchema>;

const STORAGE_BACKEND_OPTIONS = [
  { value: "local", label: "Local Filesystem" },
  { value: "s3", label: "Amazon S3 / S3-Compatible" },
  { value: "gcs", label: "Google Cloud Storage" },
  { value: "azure", label: "Azure Blob Storage" },
];

const S3_REGION_OPTIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
];

interface StorageSettingsFormProps {
  initialData?: Partial<StorageSettingsFormData>;
}

export const StorageSettingsForm: React.FC<StorageSettingsFormProps> = ({
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<"idle" | "success" | "error">("idle");

  const methods = useForm<StorageSettingsFormData>({
    resolver: zodResolver(storageSettingsSchema),
    defaultValues: {
      storage_backend: initialData?.storage_backend ?? "local",
      s3_bucket_name: initialData?.s3_bucket_name ?? "",
      s3_region: initialData?.s3_region ?? "us-east-1",
      s3_access_key_id: initialData?.s3_access_key_id ?? "",
      s3_secret_access_key: initialData?.s3_secret_access_key ?? "",
      s3_endpoint_url: initialData?.s3_endpoint_url ?? "",
      s3_custom_domain: initialData?.s3_custom_domain ?? "",
      gcs_bucket_name: initialData?.gcs_bucket_name ?? "",
      gcs_project_id: initialData?.gcs_project_id ?? "",
      azure_container_name: initialData?.azure_container_name ?? "",
      azure_account_name: initialData?.azure_account_name ?? "",
      azure_account_key: initialData?.azure_account_key ?? "",
      max_file_size_mb: initialData?.max_file_size_mb ?? 50,
      allowed_extensions: initialData?.allowed_extensions ?? "pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,gif,mp4,webm,mp3,zip",
    },
  });

  const { watch } = methods;
  const storageBackend = watch("storage_backend");

  const onSubmit = async (data: StorageSettingsFormData) => {
    setIsSubmitting(true);
    try {
      await updateStorageSettings({
        storage_backend: data.storage_backend,
        s3_bucket_name: data.s3_bucket_name || "",
        s3_region: data.s3_region || "",
        s3_access_key_id: data.s3_access_key_id || "",
        s3_secret_access_key: data.s3_secret_access_key || undefined,
        s3_endpoint_url: data.s3_endpoint_url || "",
        s3_custom_domain: data.s3_custom_domain || "",
        gcs_bucket_name: data.gcs_bucket_name || "",
        gcs_project_id: data.gcs_project_id || "",
        azure_container_name: data.azure_container_name || "",
        azure_account_name: data.azure_account_name || "",
        azure_account_key: data.azure_account_key || undefined,
        max_file_size_mb: data.max_file_size_mb,
        allowed_extensions: data.allowed_extensions || "",
      });
      
      toast.success("Storage settings have been updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus("idle");
    try {
      const result = await testStorageConnection();
      
      if (result.success) {
        setConnectionStatus("success");
        toast.success(result.message || "Storage backend is properly configured and accessible.");
      } else {
        setConnectionStatus("error");
        toast.error(result.message || "Could not connect to storage backend.");
      }
    } catch (error) {
      setConnectionStatus("error");
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Alert>
          <AlertDescription>
            Storage settings are typically configured via environment variables for security.
            Changes made here will override environment settings. Ensure you test the connection before saving.
          </AlertDescription>
        </Alert>

        {/* Storage Backend Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Storage Backend</h3>
          <SelectField
            name="storage_backend"
            label="Storage Type"
            options={STORAGE_BACKEND_OPTIONS}
          />
          
          {storageBackend === "local" && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Files will be stored on the local server filesystem.</span>
            </div>
          )}
        </div>

        {/* S3 Settings */}
        {storageBackend === "s3" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">S3 / S3-Compatible Storage</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Works with Amazon S3, DigitalOcean Spaces, MinIO, and other S3-compatible services.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="s3_bucket_name"
                label="Bucket Name"
                placeholder="my-lms-bucket"
              />
              <SelectField
                name="s3_region"
                label="Region"
                options={S3_REGION_OPTIONS}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="s3_access_key_id"
                label="Access Key ID"
                placeholder="AKIAIOSFODNN7EXAMPLE"
              />
              <FormField
                name="s3_secret_access_key"
                label="Secret Access Key"
                type="password"
                placeholder="Enter secret key"
              />
            </div>

            <FormField
              name="s3_endpoint_url"
              label="Custom Endpoint URL (Optional)"
              placeholder="https://nyc3.digitaloceanspaces.com"
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Leave empty for Amazon S3. Required for S3-compatible services.
            </p>

            <FormField
              name="s3_custom_domain"
              label="Custom Domain / CDN (Optional)"
              placeholder="cdn.example.com"
            />
          </div>
        )}

        {/* GCS Settings */}
        {storageBackend === "gcs" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Google Cloud Storage</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="gcs_bucket_name"
                label="Bucket Name"
                placeholder="my-lms-bucket"
              />
              <FormField
                name="gcs_project_id"
                label="Project ID"
                placeholder="my-gcp-project"
              />
            </div>

            <Alert>
              <AlertDescription>
                Google Cloud Storage requires a service account JSON key file. This should be configured
                via the GOOGLE_APPLICATION_CREDENTIALS environment variable.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Azure Settings */}
        {storageBackend === "azure" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Azure Blob Storage</h3>
            </div>
            
            <FormField
              name="azure_container_name"
              label="Container Name"
              placeholder="lms-files"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="azure_account_name"
                label="Storage Account Name"
                placeholder="mystorageaccount"
              />
              <FormField
                name="azure_account_key"
                label="Account Key"
                type="password"
                placeholder="Enter account key"
              />
            </div>
          </div>
        )}

        {/* General File Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">File Upload Settings</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              name="max_file_size_mb"
              label="Max File Size (MB)"
              type="number"
            />
            <FormField
              name="allowed_extensions"
              label="Allowed File Extensions"
              placeholder="pdf,doc,jpg,mp4"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Comma-separated list of allowed file extensions (without dots).
          </p>
        </div>

        {/* Test Connection */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Test Configuration</h3>
          
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || storageBackend === "local"}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              Test Connection
            </Button>
            
            {connectionStatus === "success" && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            )}
            {connectionStatus === "error" && (
              <Badge variant="destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                Failed
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Storage Settings
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
