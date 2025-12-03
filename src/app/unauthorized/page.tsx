import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-6">
        You do not have the necessary permissions to access this page.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
