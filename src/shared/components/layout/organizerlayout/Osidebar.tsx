    "use client"

    import { NavLink } from "react-router-dom"
    import { House,  LogOut, CalendarPlus,ChartNoAxesCombined } from "lucide-react"
    import { Button } from "@/shared/components/ui/button"
    import { useAuth } from "@/hooks/useAuth"
    import { cn } from "@/lib/utils"
    import gcef1 from "@/assets/gcef1.png"

    const navigation = [
    { name: "Home", href: "/organizer", icon: House },
    { name: "Add Event", href: "/organizer/add-event", icon: CalendarPlus, },
    { name: "Statistics", href: "/organizer/statistics", icon: ChartNoAxesCombined },
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
        className="flex h-screen w-60 flex-col rounded-tr-xl rounded-br-xl
                 bg-[#7cb93c]/95
                 shadow-lg"
        >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-green-900/50">
            <img
            src={gcef1}
            alt="GCEF Logo"
            className="h-12 w-12 object-contain rounded-full bg-white p-1"
            />
            <div>
            <h1 className="text-lg font-bold text-white leading-tight">Organizer</h1>
            <p className="text-xs text-zinc-300">Event Management</p>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
            <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/organizer"}
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

        <div className="border-t border-green-900/50 p-4">
            <p className="text-white text-center text-xs">
            GCEF v2.0.0
            </p>
        </div>
        </div>
    )
    }
