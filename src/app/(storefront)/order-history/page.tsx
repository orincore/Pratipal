"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrderHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the comprehensive account orders page
    router.replace("/account/orders");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your order history...</p>
      </div>
    </div>
  );
}
