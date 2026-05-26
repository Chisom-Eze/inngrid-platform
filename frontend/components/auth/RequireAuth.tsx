"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, router, user]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading InnGrid...</div>;
  }

  return children;
}
