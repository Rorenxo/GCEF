"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCheck } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { Link } from "react-router-dom"

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, loading, markAllAsRead } = useNotifications({ limit: 20 })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const handleToggle = () => {
    setIsOpen(prev => !prev)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-lg border border-gray-200 shadow-2xl z-20"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                 <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Mark all as read
                 </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-center text-gray-500">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="p-4 text-sm text-center text-gray-500">No notifications yet.</p>
              ) : (
                notifications.map(notif => (
                  <Link
                    to={`/student/event/${notif.data.eventId}`}
                    key={notif.id}
                    onClick={() => setIsOpen(false)}
                    className={`block p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notif.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-gray-800">{notif.title}</p>
                      {!notif.read && (
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0 ml-2"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                    </p>
                  </Link>
                ))
              )}
            </div>
            <div className="p-2 text-center border-t border-gray-200">
                <Link to="/student/notifications" onClick={() => setIsOpen(false)} className="text-sm font-medium text-blue-600 hover:underline">
                    View all
                </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}