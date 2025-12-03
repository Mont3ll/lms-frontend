import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Certificate } from "@/lib/types"; // Import Certificate type
import { formatDate } from "@/lib/utils";
import { Download, CheckCheck } from "lucide-react";

interface CertificateCardProps {
  certificate: Certificate;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
}) => {
  // TODO: Construct verification URL based on backend route
  const verificationUrl = `/certificates/verify/${certificate.verification_code}`;
  // Use file_url from certificate
  const downloadUrl = certificate.file_url || "#";

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">
          {certificate.course_title || "Course Certificate"}
        </CardTitle>
        <CardDescription>
          Issued on: {certificate.issued_date ? formatDate(certificate.issued_date) : "N/A"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Verification Code:{" "}
          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
            {certificate.verification_code}
          </code>
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Verify
          </Link>
        </Button>
        {/* Enable download when URL available */}
        <Button
          variant="default"
          size="sm"
          disabled={!certificate.file_url}
          asChild
        >
          <a
            href={downloadUrl}
            download={`${certificate.course_title}_certificate.pdf`}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};
