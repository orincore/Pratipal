"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Register is now handled inside the unified login page (mode=register)
export default function RegisterPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login?mode=register");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
