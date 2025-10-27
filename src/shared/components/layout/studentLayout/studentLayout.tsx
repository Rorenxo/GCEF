"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "@/shared/components/layout/studentLayout/StudentSidebar";

export default function StudentLayout() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-4 bg-white">
        <Outlet />
      </main>
    </div>
  );
}
