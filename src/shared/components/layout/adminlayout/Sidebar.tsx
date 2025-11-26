"use client"

  import { NavLink } from "react-router-dom"
  import { Calendar, CalendarPlus, LayoutDashboard, List, Plus, UserCheck, ChartNoAxesCombined } from "lucide-react" 
  import { useAuth } from "@/hooks/useAuth"
  import { Button } from "@/shared/components/ui/button"
  import { cn } from "@/lib/utils"
  import gcef1 from '@/assets/gcef1.png';


  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Calendar", href: "/admin/calendar", icon: Calendar },
    { name: "Events", href: "/admin/events", icon: List },
    { name: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
    { name: "Pending Organizers", href: "/admin/pending-organizers", icon: UserCheck },
    { name: "Add Event", href: "/admin/add-event", icon: CalendarPlus },
  ]

  interface AdminSidebarProps {
    closeSidebar?: () => void;
  }

  export default function Sidebar({ closeSidebar }: AdminSidebarProps) {

    return (
      <div
        className="flex h-screen w-60 flex-col 
                  bg-[#7cb93c]/95
                  shadow-lg"
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-center gap-3 px-6 py-4">
          <img
            src={gcef1}
            alt="GCEF Logo"
            className="h-14 w-14 object-contain rounded-full bg-white p-1"
          />
          <div>
            <h1 className="text-lg font-bold text-white">Admin</h1>
            <p className="text-xs text-white">Campus Feed</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/admin"}
              onClick={closeSidebar}
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
        <div className="border-t border-green-900/50 p-4">
          <p className="text-white text-center text-xs mt-4">GCEF v2.0.0</p>
        </div>
      </div>
    )
  }