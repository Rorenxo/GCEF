"use client"

import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
          <p className="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const email = user.email || ""
  const path = location.pathname

  if (path.startsWith("/admin") && !email.endsWith("@gcadmin.edu.ph")) {
    return <Navigate to="/" replace />
  }
  if (path.startsWith("/organizer") && !email.endsWith("@gcorganizer.edu.ph")) {
    return <Navigate to="/" replace />
  }
  if (path.startsWith("/student-login") && !email.endsWith("@gordoncollege.edu.ph")) {
    return <Navigate to="/" replace />  
  }

  return <>{children}</>
}
