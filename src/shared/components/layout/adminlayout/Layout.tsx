import { useState } from "react"
import { Outlet } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar with Overlay and Animation */}
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
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-100 p-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-200 mb-4" aria-label="Open sidebar">
            <Menu className="h-6 w-6" />
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
 