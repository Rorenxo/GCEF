"use client";

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Calendar,
  List,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { Button } from "@/shared/components/ui/button";
import gcef1 from "@/assets/gcef1.png";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Feed", href: "/student", icon: Home },
  { name: "Calendar", href: "/student/calendar", icon: Calendar },
];

export default function StudentSidebar() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/student-login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      className="flex h-screen w-64 flex-col border-r border-[#0C342C]
                 bg-gradient-to-b from-[#076653] via-[#0C342C] to-[#06231D]
                 shadow-lg"
    >
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#094235]">
        <img
          src={gcef1}
          alt="GCEF Logo"
          className="h-12 w-12 object-contain rounded-full bg-white p-1"
        />
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">
            GCEF Student
          </h1>
          <p className="text-xs text-zinc-300">Campus Feed</p>
        </div>
      </div>

      {/* ---------- Navigation ---------- */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/student"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-black shadow-lg shadow-black/40"
                  : "text-white hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* ---------- Footer ---------- */}
      <div className="border-t border-[#0E4A3C] p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full bg-red-700 text-white border-red-700 
                     hover:bg-red-800 hover:text-white shadow-md transition-all"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
