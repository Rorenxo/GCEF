"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"
import { createContext, useContext, useState, useCallback } from "react"

type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((message: string, type: NotificationType, duration = 3000) => {
    const id = Date.now().toString()
    const notification: Notification = { id, message, type, duration }

    setNotifications((prev) => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer notifications={notifications} setNotifications={setNotifications} />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return context
}

function NotificationContainer({
  notifications,
  setNotifications,
}: {
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
}) {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification
  onRemove: () => void
}) {
  const baseStyles = "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md pointer-events-auto"

  const variants = {
    success: "bg-green-50 border border-green-200",
    error: "bg-red-50 border border-red-200",
    warning: "bg-yellow-50 border border-yellow-200",
    info: "bg-blue-50 border border-blue-200",
  }

  const textVariants = {
    success: "text-green-800",
    error: "text-red-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  }

  const iconVariants = {
    success: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`${baseStyles} ${variants[notification.type]}`}
    >
      {iconVariants[notification.type]}
      <p className={`text-sm font-medium ${textVariants[notification.type]} flex-grow`}>
        {notification.message}
      </p>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
