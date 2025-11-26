"use client";

import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, Settings, LogOut, Search } from "lucide-react";
import StudentSidebar from "@/shared/components/layout/studentLayout/StudentSidebar";
import { NotificationCenter } from "@/shared/components/NotificationCenter";
import { auth } from "@/lib/firebase";
import useAuth from "@/shared/components/useStudentAuth";

export default function StudentLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/student-login");
  };

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
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white px-4 md:px-8 py-4 shadow-lg sticky top-0 z-30 ">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden" aria-label="Open sidebar">
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            <div className="flex-1 hidden lg:block">
              {/* This space can be used for a logo or title if needed in the future */}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              {location.pathname === '/student' && (
                <div className="relative flex items-center w-40 sm:w-64">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-300 text-sm h-9"
                  />
                </div>
              )}
              <NotificationCenter />
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setShowProfileDropdown(prev => !prev)}
                  className="h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors ring-1 ring-blue-500 flex items-center justify-center overflow-hidden"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-green-800">
                      {user?.displayName ? user.displayName[0].toUpperCase() : <User className="h-5 w-5" />}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-4 w-48 bg-white rounded-lg border border-gray-200 shadow-2xl z-20 overflow-hidden"
                    >
                      <div className="p-2">
                        <Link to="/student/profile" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-gray-200 rounded-md transition-colors">
                          <User className="h-4 w-4" /> My  Account
                        </Link>
                        <Link to="/student/settings" onClick={() => setShowProfileDropdown(false)} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-gray-200 rounded-md transition-colors">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <button onClick={() => {
                          setShowProfileDropdown(false);
                          setIsLogoutConfirmOpen(true);
                        }} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-gray-200 rounded-md transition-colors">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        <Outlet context={{ searchQuery, setSearchQuery }} />
      </main>

      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-600 mt-2">Are you sure you want to log out of your account?</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function useStudentLayoutContext() {
  return useOutletContext<{ searchQuery: string; setSearchQuery: React.Dispatch<React.SetStateAction<string>> }>();
}
