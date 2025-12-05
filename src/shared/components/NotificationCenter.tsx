"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from "lucide-react"
import { subscribeToNotifications, markNotificationAsRead, deleteNotification, Notification } from "@/lib/notificationService"
import useAuth from "@/shared/components/useStudentAuth"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n) => !n.read).length)
    })

    return () => unsubscribe()
  }, [user?.uid])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_created":
      case "event_updated":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "pending_organizer":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "upcoming_event":
        return <Clock className="w-4 h-4 text-orange-600" />
      case "personnel_added":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <div className="space-y-0">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleMarkAsRead(notif.id!)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notif.id!)
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatTime(timestamp: any): string {
  try {
    const date = timestamp.toDate?.() || new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  } catch {
    return "recently"
  }
}
