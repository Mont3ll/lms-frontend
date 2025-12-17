"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { SelectField } from "@/components/forms/SelectField";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Key,
  Power,
  TestTube,
  Copy,
  Star,
  AlertCircle,
  Shield,
  Link as LinkIcon,
} from "lucide-react";
import {
  fetchLTIPlatforms,
  fetchLTIPlatformDetails,
  createLTIPlatform,
  updateLTIPlatform,
  deleteLTIPlatform,
  toggleLTIPlatformStatus,
  regenerateLTIPlatformKeys,
  fetchLTIPlatformJWKS,
  fetchSSOConfigurations,
  fetchSSOConfigurationDetails,
  createSSOConfiguration,
  updateSSOConfiguration,
  deleteSSOConfiguration,
  toggleSSOConfigurationStatus,
  setSSOConfigurationDefault,
  testSSOConfiguration,
  fetchSSOProviderTypes,
  fetchTenants,
  getApiErrorMessage,
} from "@/lib/api";
import type {
  LTIPlatform,
  LTIPlatformListItem,
  LTIPlatformCreate,
  SSOConfiguration,
  SSOConfigurationListItem,
  SSOProviderType,
} from "@/lib/types";

// ============================================
// LTI Platform Schema
// ============================================

const ltiPlatformSchema = z.object({
  tenant: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required").max(255),
  issuer: z.string().url("Must be a valid URL"),
  client_id: z.string().min(1, "Client ID is required"),
  deployment_id: z.string().optional(),
  auth_login_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  auth_token_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  keyset_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_active: z.boolean(),
  generate_keys: z.boolean(),
});

type LTIPlatformFormData = z.infer<typeof ltiPlatformSchema>;

// ============================================
// SSO Configuration Schema
// ============================================

const ssoConfigurationSchema = z.object({
  tenant: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required").max(255),
  provider_type: z.enum(["SAML", "OAUTH_GOOGLE", "OAUTH_MICROSOFT", "OAUTH_GENERIC", "OIDC"]),
  is_active: z.boolean(),
  is_default: z.boolean(),
  // SAML fields
  idp_entity_id: z.string().optional(),
  idp_sso_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  idp_slo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  idp_x509_cert: z.string().optional(),
  // OAuth fields
  oauth_client_id: z.string().optional(),
  oauth_client_secret: z.string().optional(),
  oauth_authorization_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  oauth_token_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  oauth_userinfo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  oauth_scopes: z.string().optional(),
});

type SSOConfigurationFormData = z.infer<typeof ssoConfigurationSchema>;

// ============================================
// LTI Platform Form Dialog
// ============================================

interface LTIPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  platform?: LTIPlatform | null;
  tenants: Array<{ value: string; label: string }>;
}

const LTIPlatformDialog: React.FC<LTIPlatformDialogProps> = ({
  open,
  onClose,
  platform,
  tenants,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!platform;

  const methods = useForm<LTIPlatformFormData>({
    resolver: zodResolver(ltiPlatformSchema),
    defaultValues: {
      tenant: platform?.tenant ?? "",
      name: platform?.name ?? "",
      issuer: platform?.issuer ?? "",
      client_id: platform?.client_id ?? "",
      deployment_id: platform?.deployment_id ?? "",
      auth_login_url: platform?.auth_login_url ?? "",
      auth_token_url: platform?.auth_token_url ?? "",
      keyset_url: platform?.keyset_url ?? "",
      is_active: platform?.is_active ?? true,
      generate_keys: !isEditing,
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
    reset,
  } = methods;

  const generateKeys = watch("generate_keys");

  React.useEffect(() => {
    if (open) {
      reset({
        tenant: platform?.tenant ?? "",
        name: platform?.name ?? "",
        issuer: platform?.issuer ?? "",
        client_id: platform?.client_id ?? "",
        deployment_id: platform?.deployment_id ?? "",
        auth_login_url: platform?.auth_login_url ?? "",
        auth_token_url: platform?.auth_token_url ?? "",
        keyset_url: platform?.keyset_url ?? "",
        is_active: platform?.is_active ?? true,
        generate_keys: !isEditing,
      });
    }
  }, [open, platform, isEditing, reset]);

  const createMutation = useMutation({
    mutationFn: createLTIPlatform,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ltiPlatforms"] });
      toast.success("LTI platform created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LTIPlatformCreate> }) =>
      updateLTIPlatform(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ltiPlatforms"] });
      toast.success("LTI platform updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const onSubmit = async (data: LTIPlatformFormData) => {
    const payload = {
      ...data,
      auth_login_url: data.auth_login_url || undefined,
      auth_token_url: data.auth_token_url || undefined,
      keyset_url: data.keyset_url || undefined,
    };

    if (isEditing && platform) {
      await updateMutation.mutateAsync({ id: platform.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload as LTIPlatformCreate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit LTI Platform" : "Add LTI Platform"}</DialogTitle>
          <DialogDescription>
            Configure an LTI 1.3 platform for integration with external learning tools.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <SelectField
              name="tenant"
              label="Tenant"
              options={tenants}
              placeholder="Select tenant"
              disabled={isEditing}
            />

            <FormField
              name="name"
              label="Platform Name"
              placeholder="e.g., Canvas, Blackboard, Moodle"
            />

            <FormField
              name="issuer"
              label="Issuer URL"
              type="url"
              placeholder="https://lms.example.com"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="client_id"
                label="Client ID"
                placeholder="Client ID from LMS"
              />
              <FormField
                name="deployment_id"
                label="Deployment ID (Optional)"
                placeholder="Deployment ID"
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">LMS Endpoints</h4>
              <FormField
                name="auth_login_url"
                label="OIDC Login URL"
                type="url"
                placeholder="https://lms.example.com/api/lti/authorize_redirect"
              />
              <FormField
                name="auth_token_url"
                label="OAuth2 Token URL"
                type="url"
                placeholder="https://lms.example.com/login/oauth2/token"
              />
              <FormField
                name="keyset_url"
                label="Platform Public Keyset URL"
                type="url"
                placeholder="https://lms.example.com/api/lti/security/jwks"
              />
            </div>

            {!isEditing && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Auto-generate RSA Keys</Label>
                  <p className="text-xs text-muted-foreground">
                    Generate RSA key pair for tool authentication
                  </p>
                </div>
                <Switch
                  checked={generateKeys}
                  onCheckedChange={(checked) => methods.setValue("generate_keys", checked)}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this platform for LTI launches
                </p>
              </div>
              <Switch
                checked={watch("is_active")}
                onCheckedChange={(checked) => methods.setValue("is_active", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Platform" : "Create Platform"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// SSO Configuration Form Dialog
// ============================================

interface SSOConfigurationDialogProps {
  open: boolean;
  onClose: () => void;
  config?: SSOConfiguration | null;
  tenants: Array<{ value: string; label: string }>;
  providerTypes: Array<{ value: string; label: string }>;
}

const SSOConfigurationDialog: React.FC<SSOConfigurationDialogProps> = ({
  open,
  onClose,
  config,
  tenants,
  providerTypes,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!config;

  const methods = useForm<SSOConfigurationFormData>({
    resolver: zodResolver(ssoConfigurationSchema),
    defaultValues: {
      tenant: config?.tenant ?? "",
      name: config?.name ?? "",
      provider_type: (config?.provider_type as SSOProviderType) ?? "SAML",
      is_active: config?.is_active ?? true,
      is_default: config?.is_default ?? false,
      idp_entity_id: config?.idp_entity_id ?? "",
      idp_sso_url: config?.idp_sso_url ?? "",
      idp_slo_url: config?.idp_slo_url ?? "",
      idp_x509_cert: config?.idp_x509_cert ?? "",
      oauth_client_id: config?.oauth_client_id ?? "",
      oauth_client_secret: "",
      oauth_authorization_url: config?.oauth_authorization_url ?? "",
      oauth_token_url: config?.oauth_token_url ?? "",
      oauth_userinfo_url: config?.oauth_userinfo_url ?? "",
      oauth_scopes: config?.oauth_scopes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
    reset,
  } = methods;

  const providerType = watch("provider_type");
  const isSAML = providerType === "SAML";
  const isOAuth = ["OAUTH_GOOGLE", "OAUTH_MICROSOFT", "OAUTH_GENERIC", "OIDC"].includes(providerType);

  React.useEffect(() => {
    if (open) {
      reset({
        tenant: config?.tenant ?? "",
        name: config?.name ?? "",
        provider_type: (config?.provider_type as SSOProviderType) ?? "SAML",
        is_active: config?.is_active ?? true,
        is_default: config?.is_default ?? false,
        idp_entity_id: config?.idp_entity_id ?? "",
        idp_sso_url: config?.idp_sso_url ?? "",
        idp_slo_url: config?.idp_slo_url ?? "",
        idp_x509_cert: config?.idp_x509_cert ?? "",
        oauth_client_id: config?.oauth_client_id ?? "",
        oauth_client_secret: "",
        oauth_authorization_url: config?.oauth_authorization_url ?? "",
        oauth_token_url: config?.oauth_token_url ?? "",
        oauth_userinfo_url: config?.oauth_userinfo_url ?? "",
        oauth_scopes: config?.oauth_scopes ?? "",
      });
    }
  }, [open, config, reset]);

  const createMutation = useMutation({
    mutationFn: createSSOConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoConfigurations"] });
      toast.success("SSO configuration created successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SSOConfigurationFormData> }) =>
      updateSSOConfiguration(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoConfigurations"] });
      toast.success("SSO configuration updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const onSubmit = async (data: SSOConfigurationFormData) => {
    // Clean up empty optional fields
    const payload: Partial<SSOConfigurationFormData> = { ...data };
    Object.keys(payload).forEach((key) => {
      const value = payload[key as keyof typeof payload];
      if (value === "" || value === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    // Keep required fields
    payload.tenant = data.tenant;
    payload.name = data.name;
    payload.provider_type = data.provider_type;
    payload.is_active = data.is_active;
    payload.is_default = data.is_default;

    if (isEditing && config) {
      await updateMutation.mutateAsync({ id: config.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload as Parameters<typeof createSSOConfiguration>[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit SSO Configuration" : "Add SSO Configuration"}
          </DialogTitle>
          <DialogDescription>
            Configure Single Sign-On with SAML or OAuth/OIDC providers.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <SelectField
                name="tenant"
                label="Tenant"
                options={tenants}
                placeholder="Select tenant"
                disabled={isEditing}
              />
              <SelectField
                name="provider_type"
                label="Provider Type"
                options={providerTypes}
                placeholder="Select provider"
              />
            </div>

            <FormField
              name="name"
              label="Configuration Name"
              placeholder="e.g., Company SSO, Google Login"
            />

            {/* SAML Configuration */}
            {isSAML && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  SAML Configuration
                </h4>
                <FormField
                  name="idp_entity_id"
                  label="IdP Entity ID"
                  placeholder="https://idp.example.com/entity"
                />
                <FormField
                  name="idp_sso_url"
                  label="IdP SSO URL"
                  type="url"
                  placeholder="https://idp.example.com/sso"
                />
                <FormField
                  name="idp_slo_url"
                  label="IdP SLO URL (Optional)"
                  type="url"
                  placeholder="https://idp.example.com/slo"
                />
                <div className="space-y-2">
                  <Label htmlFor="idp_x509_cert">IdP X.509 Certificate</Label>
                  <Textarea
                    id="idp_x509_cert"
                    {...register("idp_x509_cert")}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={4}
                    className="font-mono text-xs"
                  />
                  {config?.idp_x509_cert_set && (
                    <p className="text-xs text-muted-foreground">
                      Certificate is currently set. Leave empty to keep existing.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* OAuth/OIDC Configuration */}
            {isOAuth && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  OAuth/OIDC Configuration
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    name="oauth_client_id"
                    label="Client ID"
                    placeholder="OAuth Client ID"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="oauth_client_secret">Client Secret</Label>
                    <input
                      id="oauth_client_secret"
                      type="password"
                      {...register("oauth_client_secret")}
                      placeholder={config?.oauth_client_secret_set ? "******" : "Client Secret"}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    {config?.oauth_client_secret_set && (
                      <p className="text-xs text-muted-foreground">
                        Leave empty to keep existing secret.
                      </p>
                    )}
                  </div>
                </div>

                {["OAUTH_GENERIC", "OIDC"].includes(providerType) && (
                  <>
                    <FormField
                      name="oauth_authorization_url"
                      label="Authorization URL"
                      type="url"
                      placeholder="https://provider.example.com/oauth/authorize"
                    />
                    <FormField
                      name="oauth_token_url"
                      label="Token URL"
                      type="url"
                      placeholder="https://provider.example.com/oauth/token"
                    />
                    <FormField
                      name="oauth_userinfo_url"
                      label="User Info URL (Optional)"
                      type="url"
                      placeholder="https://provider.example.com/oauth/userinfo"
                    />
                  </>
                )}

                <FormField
                  name="oauth_scopes"
                  label="Scopes"
                  placeholder="openid profile email"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this SSO configuration
                </p>
              </div>
              <Switch
                checked={watch("is_active")}
                onCheckedChange={(checked) => methods.setValue("is_active", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Provider</Label>
                <p className="text-xs text-muted-foreground">
                  Use as default login method for this tenant
                </p>
              </div>
              <Switch
                checked={watch("is_default")}
                onCheckedChange={(checked) => methods.setValue("is_default", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Configuration" : "Create Configuration"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// Main Component
// ============================================

export const IntegrationsSettingsForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [ltiDialogOpen, setLtiDialogOpen] = useState(false);
  const [ssoDialogOpen, setSsoDialogOpen] = useState(false);
  const [selectedLtiPlatform, setSelectedLtiPlatform] = useState<LTIPlatform | null>(null);
  const [selectedSsoConfig, setSelectedSsoConfig] = useState<SSOConfiguration | null>(null);
  const [ltiDeleteDialogOpen, setLtiDeleteDialogOpen] = useState(false);
  const [ltiToDelete, setLtiToDelete] = useState<string | null>(null);
  const [ssoDeleteDialogOpen, setSsoDeleteDialogOpen] = useState(false);
  const [ssoToDelete, setSsoToDelete] = useState<string | null>(null);

  // Fetch tenants for select options
  const { data: tenantsData } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => fetchTenants({ page_size: 100 }),
  });

  const tenantOptions = React.useMemo(() => {
    return (tenantsData?.results ?? [])
      .filter((t) => t.id && t.name)
      .map((t) => ({
        value: t.id!,
        label: t.name,
      }));
  }, [tenantsData]);

  // Fetch SSO provider types
  const { data: providerTypesData } = useQuery({
    queryKey: ["ssoProviderTypes"],
    queryFn: fetchSSOProviderTypes,
  });

  const providerTypeOptions = React.useMemo(() => {
    return (providerTypesData ?? [])
      .filter((p) => p.value && p.label)
      .map((p) => ({
        value: p.value,
        label: p.label,
      }));
  }, [providerTypesData]);

  // Fetch LTI platforms
  const {
    data: ltiPlatformsData,
    isLoading: ltiLoading,
    error: ltiError,
  } = useQuery({
    queryKey: ["ltiPlatforms"],
    queryFn: () => fetchLTIPlatforms({ page_size: 50 }),
  });

  // Fetch SSO configurations
  const {
    data: ssoConfigsData,
    isLoading: ssoLoading,
    error: ssoError,
  } = useQuery({
    queryKey: ["ssoConfigurations"],
    queryFn: () => fetchSSOConfigurations({ page_size: 50 }),
  });

  // LTI Mutations
  const deleteLtiMutation = useMutation({
    mutationFn: deleteLTIPlatform,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ltiPlatforms"] });
      toast.success("LTI platform deleted");
      setLtiDeleteDialogOpen(false);
      setLtiToDelete(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const toggleLtiStatusMutation = useMutation({
    mutationFn: toggleLTIPlatformStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ltiPlatforms"] });
      toast.success("Platform status updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const regenerateKeysMutation = useMutation({
    mutationFn: regenerateLTIPlatformKeys,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ltiPlatforms"] });
      toast.success("RSA keys regenerated successfully");
      // Optionally show the new public key
      navigator.clipboard.writeText(data.public_key);
      toast.info("Public key copied to clipboard");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  // SSO Mutations
  const deleteSsoMutation = useMutation({
    mutationFn: deleteSSOConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoConfigurations"] });
      toast.success("SSO configuration deleted");
      setSsoDeleteDialogOpen(false);
      setSsoToDelete(null);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const toggleSsoStatusMutation = useMutation({
    mutationFn: toggleSSOConfigurationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoConfigurations"] });
      toast.success("Configuration status updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setDefaultMutation = useMutation({
    mutationFn: setSSOConfigurationDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ssoConfigurations"] });
      toast.success("Default provider updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const testSsoMutation = useMutation({
    mutationFn: testSSOConfiguration,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const handleEditLti = async (platform: LTIPlatformListItem) => {
    try {
      const fullPlatform = await fetchLTIPlatformDetails(platform.id);
      setSelectedLtiPlatform(fullPlatform);
      setLtiDialogOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleEditSso = async (config: SSOConfigurationListItem) => {
    try {
      const fullConfig = await fetchSSOConfigurationDetails(config.id);
      setSelectedSsoConfig(fullConfig);
      setSsoDialogOpen(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCopyJwks = async (platformId: string) => {
    try {
      const jwks = await fetchLTIPlatformJWKS(platformId);
      navigator.clipboard.writeText(JSON.stringify(jwks, null, 2));
      toast.success("JWKS copied to clipboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Tabs defaultValue="lti" className="space-y-4">
      <TabsList>
        <TabsTrigger value="lti">LTI Platforms</TabsTrigger>
        <TabsTrigger value="sso">SSO Configurations</TabsTrigger>
      </TabsList>

      {/* LTI Platforms Tab */}
      <TabsContent value="lti">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">LTI 1.3 Platforms</CardTitle>
              <CardDescription>
                Manage Learning Tools Interoperability platform configurations.
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setSelectedLtiPlatform(null);
                setLtiDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Platform
            </Button>
          </CardHeader>
          <CardContent>
            {ltiError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getApiErrorMessage(ltiError)}</AlertDescription>
              </Alert>
            )}

            {ltiLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (ltiPlatformsData?.results ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No LTI platforms configured yet.</p>
                <p className="text-sm">Add a platform to enable LTI tool launches.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ltiPlatformsData?.results ?? []).map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell className="font-medium">{platform.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {platform.issuer}
                      </TableCell>
                      <TableCell>{platform.tenant_name}</TableCell>
                      <TableCell>
                        <Badge variant={platform.is_active ? "default" : "secondary"}>
                          {platform.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditLti(platform)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleLtiStatusMutation.mutate(platform.id)}
                            >
                              <Power className="h-4 w-4 mr-2" />
                              {platform.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyJwks(platform.id)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy JWKS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => regenerateKeysMutation.mutate(platform.id)}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Regenerate Keys
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setLtiToDelete(platform.id);
                                setLtiDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* SSO Configurations Tab */}
      <TabsContent value="sso">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">SSO Configurations</CardTitle>
              <CardDescription>
                Manage Single Sign-On providers (SAML, OAuth, OIDC).
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setSelectedSsoConfig(null);
                setSsoDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </CardHeader>
          <CardContent>
            {ssoError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{getApiErrorMessage(ssoError)}</AlertDescription>
              </Alert>
            )}

            {ssoLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (ssoConfigsData?.results ?? []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No SSO configurations yet.</p>
                <p className="text-sm">Add a provider to enable Single Sign-On.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ssoConfigsData?.results ?? []).map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {config.name}
                          {config.is_default && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {config.provider_type_display || config.provider_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{config.tenant_name}</TableCell>
                      <TableCell>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSso(config)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleSsoStatusMutation.mutate(config.id)}
                            >
                              <Power className="h-4 w-4 mr-2" />
                              {config.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => testSsoMutation.mutate(config.id)}
                            >
                              <TestTube className="h-4 w-4 mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            {!config.is_default && (
                              <DropdownMenuItem
                                onClick={() => setDefaultMutation.mutate(config.id)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSsoToDelete(config.id);
                                setSsoDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Dialogs */}
      <LTIPlatformDialog
        open={ltiDialogOpen}
        onClose={() => {
          setLtiDialogOpen(false);
          setSelectedLtiPlatform(null);
        }}
        platform={selectedLtiPlatform}
        tenants={tenantOptions}
      />

      <SSOConfigurationDialog
        open={ssoDialogOpen}
        onClose={() => {
          setSsoDialogOpen(false);
          setSelectedSsoConfig(null);
        }}
        config={selectedSsoConfig}
        tenants={tenantOptions}
        providerTypes={providerTypeOptions}
      />

      <DeleteConfirmationModal
        isOpen={ltiDeleteDialogOpen}
        onClose={() => {
          setLtiDeleteDialogOpen(false);
          setLtiToDelete(null);
        }}
        onConfirm={() => {
          if (ltiToDelete) {
            deleteLtiMutation.mutate(ltiToDelete);
          }
        }}
        title="Delete LTI Platform"
        description="Are you sure you want to delete this LTI platform? This action cannot be undone."
        isLoading={deleteLtiMutation.isPending}
      />

      <DeleteConfirmationModal
        isOpen={ssoDeleteDialogOpen}
        onClose={() => {
          setSsoDeleteDialogOpen(false);
          setSsoToDelete(null);
        }}
        onConfirm={() => {
          if (ssoToDelete) {
            deleteSsoMutation.mutate(ssoToDelete);
          }
        }}
        title="Delete SSO Configuration"
        description="Are you sure you want to delete this SSO configuration? This action cannot be undone."
        isLoading={deleteSsoMutation.isPending}
      />
    </Tabs>
  );
};
