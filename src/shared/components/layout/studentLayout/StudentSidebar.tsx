"use client";

import { NavLink } from "react-router-dom";
import { Home, Calendar, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function StudentSidebar() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/student-login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all 
     ${isActive
       ? "bg-cyan-600 text-white"
       : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
     }`;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* ---------- Top Section ---------- */}
      <div>
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-cyan-600 text-white font-bold">
            🎓
          </div>
          <h1 className="text-lg font-bold text-zinc-800 dark:text-white">GCEF Student</h1>
        </div>

        <nav className="space-y-1">
          <NavLink to="/student" end className={linkClass}>
            <Home className="h-4 w-4" />
            <span>Feed</span>
          </NavLink>

          <NavLink to="/student/events" className={linkClass}>
            <Calendar className="h-4 w-4" />
            <span>My Events</span>
          </NavLink>
        </nav>
      </div>

      {/* ---------- Bottom Section ---------- */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 
                     hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
