"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

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
import { confirmPasswordReset, getApiErrorMessage } from "@/lib/api";

// Validation Schema
const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    new_password2: z.string(),
  })
  .refine((data) => data.new_password === data.new_password2, {
    message: "Passwords do not match",
    path: ["new_password2"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const searchParams = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", new_password2: "" },
  });

  useEffect(() => {
    // Check if uid and token are present in the URL
    if (!uid || !token) {
      setInvalidLink(true);
    }
  }, [uid, token]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!uid || !token) {
      setError("Invalid password reset link.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: data.new_password,
        new_password2: data.new_password2,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err);
      // Handle specific error cases
      if (errorMsg.toLowerCase().includes("invalid") || errorMsg.toLowerCase().includes("expired")) {
        setError("This password reset link is invalid or has expired. Please request a new one.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state for invalid/missing link
  if (invalidLink) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or incomplete. Please request a
            new password reset.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request New Reset Link</Link>
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="underline text-primary hover:text-primary/80"
            >
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Show success state
  if (success) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been reset successfully. You can now log in with
            your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          {error && (
            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...form.register("new_password")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.new_password}
            />
            {form.formState.errors.new_password && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.new_password.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new_password2">Confirm New Password</Label>
            <Input
              id="new_password2"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...form.register("new_password2")}
              disabled={isLoading}
              aria-invalid={!!form.formState.errors.new_password2}
            />
            {form.formState.errors.new_password2 && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.new_password2.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="underline text-primary hover:text-primary/80"
            >
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
