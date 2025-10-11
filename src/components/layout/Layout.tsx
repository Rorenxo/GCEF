import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function Layout() {
  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 bg-zinc-100">
        <Outlet />
      </main>
    </div>
  )
}
