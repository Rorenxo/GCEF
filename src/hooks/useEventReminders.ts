import { useEffect } from "react"
import { checkUpcomingEvents, clearOldReminders } from "@/lib/notificationService"

/**
 * Hook to set up event reminder checking
 * Call this once in a root component (e.g., App.tsx or a layout)
 */
export function useEventReminders() {
  useEffect(() => {
    // Check for upcoming events on mount
    checkUpcomingEvents()
    clearOldReminders()

    // Set up interval to check every 5 minutes
    const interval = setInterval(() => {
      checkUpcomingEvents()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])
}
