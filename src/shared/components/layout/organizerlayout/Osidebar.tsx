    "use client"

    import { NavLink } from "react-router-dom"
    import { LayoutDashboard, Calendar, List, LogOut } from "lucide-react"
    import { Button } from "@/shared/components/ui/button"
    import { useAuth } from "@/hooks/useAuth"
    import { cn } from "@/lib/utils"
    import gcef1 from "@/assets/gcef1.png"

    const navigation = [
    { name: "Dashboard", href: "/organizer", icon: LayoutDashboard },
    { name: "My Events", href: "/organizer/events", icon: List },
    { name: "Calendar", href: "/organizer/calendar", icon: Calendar },
    ]

    export default function Sidebar() {
    const { signOut, user } = useAuth()

    const handleSignOut = async () => {
        try {
        await signOut()
        } catch (error) {
        console.error("Sign out failed:", error)
        }
    }

    return (
        <div
        className="flex h-screen w-64 flex-col border-r border-[#0C342C] 
                    bg-gradient-to-b from-[#076653] via-[#0C342C] to-[#06231D]"
        >
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
            <img
            src={gcef1}
            alt="GCEF Logo"
            className="mx-auto mb-4 h-14 w-14 object-contain"
            />
            <div>
            <h1 className="text-xl font-bold text-white">Organizer</h1>
            <p className="text-xs text-zinc-400">Event Management</p>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
            <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/organizer"}
                className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                    ? "bg-white text-black shadow-lg shadow-black/40"
                    : "text-white hover:bg-white/10"
                )
                }
            >
                <item.icon className="h-5 w-5" />
                {item.name}
            </NavLink>
            ))}
        </nav>

        <div className="border-t border-zinc-800 p-4">
            <div className="mb-3 rounded-lg bg-zinc-900 p-3">
            <p className="text-xs text-zinc-200">Signed in as</p>
            <p className="truncate text-sm font-medium text-zinc-200">
                {user?.email}
            </p>
            </div>
            <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full bg-red-700 text-white border-red-700 hover:bg-red-800 hover:text-white shadow-md transition-colors"
            >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
            </Button>
        </div>
        </div>
    )
    }
