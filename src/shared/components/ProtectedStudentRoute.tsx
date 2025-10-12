"use client";

import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "@/shared/components/useStudentAuth";

interface ProtectedStudentRouteProps {
  children: React.ReactNode;
}

export function ProtectedStudentRoute({ children }: ProtectedStudentRouteProps) {
  const { user, loading } = useAuth(); // ✅ correctly calls your hook

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/student-login" replace />;
  }

  return <>{children}</>;
}
