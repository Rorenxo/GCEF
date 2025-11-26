import { collection, query, where, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { notifyUpcomingEvent } from "./notificationService"

/**
 * Check for events starting in 1 hour and send notifications
 * Call this periodically (e.g., every 5 minutes) or on app start
 */
export async function checkUpcomingEvents() {
  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    // Query events where startDate is between now and 1 hour from now
    const eventsRef = collection(db, "events")
    const q = query(
      eventsRef,
      where("startDate", ">=", Timestamp.fromDate(now)),
      where("startDate", "<=", Timestamp.fromDate(oneHourFromNow))
    )

    const snapshot = await getDocs(q)
    const remindedEvents = await getRemindedEvents()

    snapshot.forEach(async (doc) => {
      const eventId = doc.id
      const eventData = doc.data()

      // Skip if we already sent a reminder for this event
      if (remindedEvents.has(eventId)) {
        return
      }

      const eventName = eventData.eventName
      const location = eventData.location
      const startDate = eventData.startDate?.toDate()

      // Get list of student IDs who saved/registered for this event
      const studentIds = eventData.saves || [] // Using saves as registered students

      if (studentIds.length > 0) {
        await notifyUpcomingEvent(studentIds, eventId, eventName, location, startDate)
        saveRemindedEvent(eventId)
        console.log(`Sent 1-hour reminder for event: ${eventName}`)
      }

      // Also notify the organizer
      if (eventData.createdBy) {
        await notifyUpcomingEvent([eventData.createdBy], eventId, eventName, location, startDate)
      }

      // Notify admins
      // You can fetch actual admin IDs from a config or hardcode them
      // await notifyUpcomingEvent(['admin1', 'admin2'], eventId, eventName, location, startDate)
    })
  } catch (error) {
    console.error("Error checking upcoming events:", error)
  }
}

/**
 * Store reminded events in localStorage to avoid duplicate reminders
 */
const REMINDED_EVENTS_KEY = "reminded_events"

function getRemindedEvents(): Set<string> {
  try {
    const stored = localStorage.getItem(REMINDED_EVENTS_KEY)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

function saveRemindedEvent(eventId: string) {
  try {
    const reminded = getRemindedEvents()
    reminded.add(eventId)
    localStorage.setItem(REMINDED_EVENTS_KEY, JSON.stringify(Array.from(reminded)))
  } catch (error) {
    console.error("Error saving reminded event:", error)
  }
}

/**
 * Clear old reminded events (older than 24 hours)
 */
export function clearOldReminders() {
  try {
    const reminded = getRemindedEvents()
    if (reminded.size > 100) {
      // Keep it manageable - clear all and start fresh
      localStorage.removeItem(REMINDED_EVENTS_KEY)
    }
  } catch (error) {
    console.error("Error clearing old reminders:", error)
  }
}
