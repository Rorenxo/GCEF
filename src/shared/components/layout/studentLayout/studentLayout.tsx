"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "@/shared/components/StudentSidebar";

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
        <StudentSidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* The Student page (feed) will render here */}
        <Outlet />
      </div>
    </div>
  );
}
