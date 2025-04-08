"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { apiClient } from "@/lib/api"; // API function
import { API_ROUTES } from "@/lib/constants";

// Validation Schema
const registerSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    // tenantId: z.string().uuid().optional(), // Depending on registration flow
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Extract data for API call
    const apiData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: data.password,
      password2: data.confirmPassword,
      // TODO: Determine tenant ID based on subdomain or another mechanism
      // tenant: 'your-tenant-detection-logic'
    };

    try {
      // Replace with your actual registration API call
      await apiClient.post(API_ROUTES.REGISTER, apiData);

      setSuccess(
        "Registration successful! Please check your email for verification or proceed to login.",
      );
      // Optionally redirect after a delay or prompt user
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      console.error("Registration failed:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        "Registration failed. Please try again.";
      setError(errorMsg);
      // Optionally set field-specific errors
      // if (err.response?.data?.email) form.setError("email", { message: err.response.data.email[0] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        {/* Add Logo Here */}
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Start your learning journey with us.</CardDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                disabled={isLoading}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                disabled={isLoading}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...form.register("password")}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register("confirmPassword")}
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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
