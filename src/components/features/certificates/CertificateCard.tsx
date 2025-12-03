"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar } from "lucide-react";
import { Certificate } from "@/lib/types";
import { downloadCertificate } from "@/lib/api";

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const handleDownload = async () => {
    // Handle certificate download using the dedicated download endpoint
    if (certificate.file_url) {
      try {
        // Use the API client function which handles authentication automatically
        const blob = await downloadCertificate(certificate.id.toString());
        
        // Create a download link with the blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${certificate.course_title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading certificate:', error);
        // Fallback to opening in new tab if download fails
        const fullUrl = certificate.file_url.startsWith('http') 
          ? certificate.file_url 
          : `http://localhost:8000${certificate.file_url}`;
        window.open(fullUrl, '_blank');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Award className="h-6 w-6 text-primary" />
          <Badge variant={certificate.status === 'ISSUED' ? 'default' : 'secondary'}>
            {certificate.status}
          </Badge>
        </div>
        <CardTitle className="text-lg">{certificate.course_title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Issued: {certificate.issued_date ? formatDate(certificate.issued_date) : 'N/A'}</span>
          </div>
          
          {certificate.expiry_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Expires: {formatDate(certificate.expiry_date)}</span>
            </div>
          )}
          
          {certificate.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {certificate.description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleDownload}
          disabled={!certificate.file_url}
          className={`w-full ${certificate.file_url ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Certificate
        </Button>
      </CardFooter>
    </Card>
  );
}