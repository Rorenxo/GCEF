"use client";

import { useState, useRef, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, User, Settings, Calendar } from "lucide-react";
import StudentSidebar from "@/shared/components/layout/studentLayout/StudentSidebar";

export default function StudentLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <StudentSidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-[998] lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed top-0 left-0 h-full z-[999] lg:hidden"
            >
              <StudentSidebar closeSidebar={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="" aria-label="Open sidebar">
            <Menu className="h-6 w-6 text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <Link to="/student/calendar" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Calendar className="h-5 w-5" />
            </Link>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border z-10 p-2">
                  <Link
                    to="/student/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-green-100 rounded-md"
                  >
                    <User className="h-4 w-4" /> View Profile
                  </Link>
                  <Link
                    to="/student/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-green-100 rounded-md"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
