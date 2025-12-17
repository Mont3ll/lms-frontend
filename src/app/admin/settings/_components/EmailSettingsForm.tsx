"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { CheckboxField } from "@/components/forms/CheckboxField";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateEmailSettings, sendTestEmail, getApiErrorMessage } from "@/lib/api";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emailSettingsSchema = z.object({
  smtp_host: z.string().min(1, "SMTP host is required"),
  smtp_port: z.coerce.number().min(1).max(65535, "Invalid port number"),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_use_tls: z.boolean(),
  smtp_use_ssl: z.boolean(),
  default_from_email: z.string().email("Invalid email address"),
  default_from_name: z.string().min(1, "From name is required"),
  email_timeout: z.coerce.number().min(5).max(120),
});

type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;

const COMMON_SMTP_PRESETS = [
  { value: "custom", label: "Custom SMTP Server" },
  { value: "gmail", label: "Gmail (smtp.gmail.com:587)" },
  { value: "sendgrid", label: "SendGrid (smtp.sendgrid.net:587)" },
  { value: "mailgun", label: "Mailgun (smtp.mailgun.org:587)" },
  { value: "ses", label: "Amazon SES (email-smtp.*.amazonaws.com:587)" },
  { value: "outlook", label: "Outlook/Office 365 (smtp.office365.com:587)" },
];

interface EmailSettingsFormProps {
  initialData?: Partial<EmailSettingsFormData>;
}

export const EmailSettingsForm: React.FC<EmailSettingsFormProps> = ({
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");
  const [selectedPreset, setSelectedPreset] = React.useState("custom");

  const methods = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtp_host: initialData?.smtp_host ?? "",
      smtp_port: initialData?.smtp_port ?? 587,
      smtp_username: initialData?.smtp_username ?? "",
      smtp_password: initialData?.smtp_password ?? "",
      smtp_use_tls: initialData?.smtp_use_tls ?? true,
      smtp_use_ssl: initialData?.smtp_use_ssl ?? false,
      default_from_email: initialData?.default_from_email ?? "",
      default_from_name: initialData?.default_from_name ?? "",
      email_timeout: initialData?.email_timeout ?? 30,
    },
  });

  const { setValue, watch } = methods;
  const useTLS = watch("smtp_use_tls");
  const useSSL = watch("smtp_use_ssl");

  // Apply preset settings
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    
    switch (preset) {
      case "gmail":
        setValue("smtp_host", "smtp.gmail.com");
        setValue("smtp_port", 587);
        setValue("smtp_use_tls", true);
        setValue("smtp_use_ssl", false);
        break;
      case "sendgrid":
        setValue("smtp_host", "smtp.sendgrid.net");
        setValue("smtp_port", 587);
        setValue("smtp_use_tls", true);
        setValue("smtp_use_ssl", false);
        break;
      case "mailgun":
        setValue("smtp_host", "smtp.mailgun.org");
        setValue("smtp_port", 587);
        setValue("smtp_use_tls", true);
        setValue("smtp_use_ssl", false);
        break;
      case "ses":
        setValue("smtp_host", "email-smtp.us-east-1.amazonaws.com");
        setValue("smtp_port", 587);
        setValue("smtp_use_tls", true);
        setValue("smtp_use_ssl", false);
        break;
      case "outlook":
        setValue("smtp_host", "smtp.office365.com");
        setValue("smtp_port", 587);
        setValue("smtp_use_tls", true);
        setValue("smtp_use_ssl", false);
        break;
    }
  };

  // Ensure TLS and SSL are mutually exclusive
  React.useEffect(() => {
    if (useTLS && useSSL) {
      setValue("smtp_use_ssl", false);
    }
  }, [useTLS, setValue, useSSL]);

  React.useEffect(() => {
    if (useSSL && useTLS) {
      setValue("smtp_use_tls", false);
    }
  }, [useSSL, setValue, useTLS]);

  const onSubmit = async (data: EmailSettingsFormData) => {
    setIsSubmitting(true);
    try {
      await updateEmailSettings({
        smtp_host: data.smtp_host,
        smtp_port: data.smtp_port,
        smtp_username: data.smtp_username || "",
        smtp_password: data.smtp_password || undefined,
        smtp_use_tls: data.smtp_use_tls,
        smtp_use_ssl: data.smtp_use_ssl,
        default_from_email: data.default_from_email,
        default_from_name: data.default_from_name,
        email_timeout: data.email_timeout,
      });
      
      toast.success("Email settings have been updated successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address to send test to.");
      return;
    }

    setIsTesting(true);
    try {
      const result = await sendTestEmail({ recipient_email: testEmail });
      
      if (result.success) {
        toast.success(result.message || `A test email has been sent to ${testEmail}. Please check your inbox.`);
      } else {
        toast.error(result.message || "Failed to send test email.");
      }
    } catch (error) {
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
            Email settings are typically configured via environment variables for security.
            Changes made here will override environment settings.
          </AlertDescription>
        </Alert>

        {/* SMTP Preset */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Setup</h3>
          <div className="grid gap-2">
            <Label htmlFor="preset">Email Provider Preset</Label>
            <Select
              value={selectedPreset}
              onValueChange={setSelectedPreset}
            >
              <SelectTrigger id="preset">
                <SelectValue placeholder="Select a preset or use custom" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_SMTP_PRESETS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetChange(selectedPreset)}
          >
            Apply Preset
          </Button>
        </div>

        {/* SMTP Server Configuration */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">SMTP Server</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              name="smtp_host"
              label="SMTP Host"
              placeholder="smtp.example.com"
            />
            <FormField
              name="smtp_port"
              label="SMTP Port"
              type="number"
              placeholder="587"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              name="smtp_username"
              label="SMTP Username"
              placeholder="username or email"
            />
            <FormField
              name="smtp_password"
              label="SMTP Password"
              type="password"
              placeholder="Enter password"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <CheckboxField
              name="smtp_use_tls"
              label="Use TLS (STARTTLS)"
            />
            <CheckboxField
              name="smtp_use_ssl"
              label="Use SSL"
            />
          </div>

          <FormField
            name="email_timeout"
            label="Connection Timeout (seconds)"
            type="number"
            className="max-w-[200px]"
          />
        </div>

        {/* Sender Information */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Default Sender</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              name="default_from_name"
              label="From Name"
              placeholder="My Learning Platform"
            />
            <FormField
              name="default_from_email"
              label="From Email"
              type="email"
              placeholder="noreply@example.com"
            />
          </div>
        </div>

        {/* Test Email */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Test Configuration</h3>
          
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email to send test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleTestEmail}
              disabled={isTesting}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Test
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Email Settings
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
