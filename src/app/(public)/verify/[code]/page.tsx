"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Calendar, GraduationCap, User, Award } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { verifyCertificate, getApiErrorMessage } from "@/lib/api";

interface CertificateVerificationResult {
  valid: boolean;
  learner_name?: string;
  course_title?: string;
  issued_at?: string;
  expires_at?: string;
  status?: string;
  description?: string;
  detail?: string;
}

export default function CertificateVerifyPage() {
  const params = useParams();
  const code = params.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        setError("No verification code provided");
        setIsLoading(false);
        return;
      }

      try {
        const data = await verifyCertificate(code);
        setResult(data);
      } catch (err) {
        // Check if it's a 404 (not found) or 400 (invalid format)
        const errorMessage = getApiErrorMessage(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [code]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verifying certificate...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state (network error, not a verification failure)
  if (error && !result) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Verification Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Please check the verification code and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Valid certificate
  if (result?.valid) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-2xl">Certificate Verified</CardTitle>
          <CardDescription>This certificate is valid and authentic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Awarded to</p>
                <p className="font-semibold">{result.learner_name}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-semibold">{result.course_title}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Issued on</p>
                <p className="font-semibold">{formatDate(result.issued_at) || "N/A"}</p>
              </div>
            </div>

            {result.expires_at && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valid until</p>
                    <p className="font-semibold">{formatDate(result.expires_at)}</p>
                  </div>
                </div>
              </>
            )}

            {result.description && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{result.description}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Status: {result.status || "ISSUED"}
            </Badge>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Verification code: {code}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Invalid certificate (revoked, expired, or not found)
  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Certificate Invalid</CardTitle>
        <CardDescription>{result?.detail || "This certificate could not be verified"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(result?.learner_name || result?.course_title) && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            {result.learner_name && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Originally awarded to</p>
                  <p className="font-semibold">{result.learner_name}</p>
                </div>
              </div>
            )}
            
            {result.learner_name && result.course_title && <Separator />}
            
            {result.course_title && (
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-semibold">{result.course_title}</p>
                </div>
              </div>
            )}

            {result.issued_at && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Originally issued on</p>
                    <p className="font-semibold">{formatDate(result.issued_at)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {result?.status && (
          <div className="flex justify-center">
            <Badge variant="destructive">
              Status: {result.status}
            </Badge>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Verification code: {code}
        </p>
      </CardContent>
    </Card>
  );
}
