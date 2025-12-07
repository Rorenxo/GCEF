"use client"

import { Link } from "react-router-dom"
import { useNotifications } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { Bell, ArrowLeft } from "lucide-react"

export default function AllNotificationsPage() {
  const { notifications, loading, error } = useNotifications()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-gray-800" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
              <p className="text-gray-500">A complete history of all event notifications.</p>
            </div>
          </div>
          <Link
            to="/student"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
        </div>

        {loading && <p className="text-center text-gray-500">Loading notifications...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-gray-500">You have no notifications.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map(notif => (
                  <li key={notif.id}>
                    <Link
                      to={`/student/event/${notif.data.eventId}`}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !notif.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800">{notif.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 flex-shrink-0 ml-4"></span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}