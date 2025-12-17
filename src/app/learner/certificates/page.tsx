"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageWrapper } from "@/components/layouts/PageWrapper";
import { CertificateCard } from "@/components/features/certificates/CertificateCard"; // Needs creation
import { fetchCertificates } from "@/lib/api"; // Assume API function exists
import { QUERY_KEYS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Award, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Certificate } from "@/lib/types"; // Define Certificate type

export default function MyCertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: certificatesData,
    isLoading,
    isError,
  } = useQuery<{ results: Certificate[] }>({
    // Assuming non-paginated for now
    queryKey: [QUERY_KEYS.CERTIFICATES], // Define key
    queryFn: () => fetchCertificates(), // API function
  });

  // Filter certificates based on search query
  const filteredCertificates = certificatesData?.results?.filter((certificate) =>
    certificate.course_title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderSkeletons = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col space-y-3 border rounded-lg p-4"
      >
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-9 w-28 mt-2" />
      </div>
    ));

  return (
    <PageWrapper title="My Certificates" description="View and download certificates earned from completed courses.">
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSkeletons()}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Certificates</AlertTitle>
          <AlertDescription>
            Could not fetch your certificates. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && certificatesData?.results?.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-card">
          <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You haven&apos;t earned any certificates yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete courses to earn certificates!
          </p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        certificatesData?.results &&
        certificatesData.results.length > 0 && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by course title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {filteredCertificates.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                  No certificates match your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCertificates.map((certificate) => (
                  <CertificateCard key={certificate.id} certificate={certificate} />
                ))}
              </div>
            )}
          </div>
        )}
    </PageWrapper>
  );
}
