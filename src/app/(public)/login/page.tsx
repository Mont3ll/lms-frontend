"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/AuthProvider";
import { loginUser, getApiErrorMessage, fetchSSOProviders, getSSOLoginUrl } from "@/lib/api";
import type { SSOProvider, SSOProviderType } from "@/lib/types";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// SSO Provider Icon components
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#00A4EF"/>
      <path d="M24 24H12.6V12.6H24V24z" fill="#FFB900"/>
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#F25022"/>
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#7FBA00"/>
    </svg>
  );
}

function SSOIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  );
}

function getProviderIcon(providerType: SSOProviderType) {
  switch (providerType) {
    case "OAUTH_GOOGLE":
      return <GoogleIcon className="h-5 w-5" />;
    case "OAUTH_MICROSOFT":
      return <MicrosoftIcon className="h-5 w-5" />;
    case "SAML":
    case "OAUTH_GENERIC":
    case "OIDC":
    default:
      return <SSOIcon className="h-5 w-5" />;
  }
}

function getProviderLabel(provider: SSOProvider): string {
  // Use provider name if set, otherwise generate a label from the type
  if (provider.name) return provider.name;
  
  switch (provider.type) {
    case "OAUTH_GOOGLE":
      return "Continue with Google";
    case "OAUTH_MICROSOFT":
      return "Continue with Microsoft";
    case "SAML":
      return "Continue with SSO";
    case "OIDC":
      return "Continue with OpenID";
    case "OAUTH_GENERIC":
    default:
      return "Continue with SSO";
  }
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoProviders, setSSOProviders] = useState<SSOProvider[]>([]);
  const [ssoLoading, setSSOLoading] = useState(true);
  const [ssoRedirecting, setSSORedirecting] = useState<string | null>(null);
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get("returnUrl") || "";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Fetch SSO providers on mount
  useEffect(() => {
    const loadSSOProviders = async () => {
      try {
        const response = await fetchSSOProviders();
        setSSOProviders(response.providers || []);
      } catch (err) {
        // SSO providers not available - not an error, just means no SSO configured
        console.debug("SSO providers not available:", err);
        setSSOProviders([]);
      } finally {
        setSSOLoading(false);
      }
    };
    loadSSOProviders();
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(data);
      console.log("Login API Response:", response);

      if (!response || !response.access || !response.refresh) {
        throw new Error("Invalid response received from server.");
      }

      await login(response.access, response.refresh);

      toast.success("Login Successful", {
        description: "Redirecting to your dashboard...",
        duration: 3000,
      });

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const errorMsg = getApiErrorMessage(err);
      setError(errorMsg);

      toast.error("Login Failed", {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = (provider: SSOProvider) => {
    setSSORedirecting(provider.id);
    const ssoUrl = getSSOLoginUrl(provider.id, provider.type, returnUrl || "/dashboard");
    // Redirect to SSO login URL
    window.location.href = ssoUrl;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!isAuthLoading && user) {
      if (returnUrl) {
        router.replace(returnUrl);
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, isAuthLoading, router, returnUrl]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
        <CardDescription>
          Log in to continue your learning journey.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          {/* SSO Providers */}
          {!ssoLoading && ssoProviders.length > 0 && (
            <>
              <div className="grid gap-2">
                {ssoProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSSOLogin(provider)}
                    disabled={isLoading || ssoRedirecting !== null}
                  >
                    {ssoRedirecting === provider.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <span className="mr-2">{getProviderIcon(provider.type)}</span>
                    )}
                    {getProviderLabel(provider)}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Display local form error if still needed */}
          {error && (
            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...form.register("email")}
              disabled={isLoading || ssoRedirecting !== null}
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...form.register("password")}
              disabled={isLoading || ssoRedirecting !== null}
              aria-invalid={!!form.formState.errors.password}
            />
            {form.formState.errors.password && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 mt-8">
          <Button type="submit" className="w-full" disabled={isLoading || ssoRedirecting !== null}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
