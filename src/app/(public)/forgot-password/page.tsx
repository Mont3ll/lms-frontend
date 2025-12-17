"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import { requestPasswordReset, getApiErrorMessage } from "@/lib/api";

// Validation Schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await requestPasswordReset({ email: data.email });
      setSuccess(
        "If an account exists for this email, a password reset link has been sent.",
      );
      form.reset();
    } catch (err: unknown) {
      // The backend always returns success to prevent email enumeration,
      // but we handle errors just in case (network issues, etc.)
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address below to receive instructions on how to reset
          your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          {error && (
            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-green-600 bg-green-100 p-2 rounded-md">
              {success}
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
              disabled={isLoading || !!success} // Disable if successful
              aria-invalid={!!form.formState.errors.email}
            />
            {form.formState.errors.email && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !!success}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="underline text-primary hover:text-primary/80"
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
