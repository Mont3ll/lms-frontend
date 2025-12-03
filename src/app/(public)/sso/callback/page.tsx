"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

function SSOCallbackContent() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const processCallback = async () => {
      // Extract tokens from URL query parameters
      const accessToken = searchParams.get("access");
      const refreshToken = searchParams.get("refresh");
      const relayState = searchParams.get("relay_state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Handle error from SSO provider
      if (errorParam) {
        const errorMessage = errorDescription || errorParam || "SSO authentication failed";
        setError(errorMessage);
        setIsProcessing(false);
        toast.error("SSO Login Failed", {
          description: errorMessage,
          duration: 5000,
        });
        return;
      }

      // Validate tokens
      if (!accessToken || !refreshToken) {
        const errorMessage = "Invalid SSO callback: missing authentication tokens";
        setError(errorMessage);
        setIsProcessing(false);
        toast.error("SSO Login Failed", {
          description: errorMessage,
          duration: 5000,
        });
        return;
      }

      try {
        // Use AuthProvider's login function to store tokens and fetch user profile
        await login(accessToken, refreshToken);

        toast.success("Login Successful", {
          description: "Redirecting...",
          duration: 3000,
        });

        // Redirect to relay_state or default to dashboard
        const redirectUrl = relayState || "/dashboard";
        router.replace(redirectUrl);
      } catch (err) {
        console.error("SSO callback processing failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to complete SSO login";
        setError(errorMessage);
        setIsProcessing(false);
        toast.error("SSO Login Failed", {
          description: errorMessage,
          duration: 5000,
        });
      }
    };

    processCallback();
  }, [searchParams, login, router]);

  // Error state
  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Failed</CardTitle>
          <CardDescription>
            There was a problem completing your sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center bg-destructive/10 p-3 rounded-md">
            {error}
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Back to Login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setError(null);
                setIsProcessing(true);
                processedRef.current = false;
                // Trigger reprocessing by re-rendering
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Processing/Loading state
  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Completing Sign In</CardTitle>
        <CardDescription>
          Please wait while we complete your authentication...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          {isProcessing ? "Verifying your credentials..." : "Redirecting..."}
        </p>
      </CardContent>
    </Card>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      }
    >
      <SSOCallbackContent />
    </Suspense>
  );
}
