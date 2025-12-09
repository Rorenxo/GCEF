import {
  collection,
  addDoc, getDocs, writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export type NotificationType = "event_created" | "event_updated" | "event_cancelled" | "pending_organizer" | "upcoming_event" | "personnel_added" | "event_reminder"

export interface Notification {
  id?: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: {
    eventId?: string
    eventName?: string
    organizerId?: string
    organizerName?: string
    startDate?: Timestamp
    location?: string
    changeDetails?: string
  }
  read: boolean
  createdAt: Timestamp
  expiresAt?: Timestamp
}

export async function sendNotification(notification: Omit<Notification, "id" | "createdAt">) {
  try {
    const notificationsRef = collection(db, "notifications")
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
    console.log("Notification sent:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
}

export async function sendBulkNotification(userIds: string[], notification: Omit<Notification, "id" | "createdAt" | "userId">) {
  try {
    const notificationsRef = collection(db, "notifications")
    const promises = userIds.map((userId) =>
      addDoc(notificationsRef, {
        ...notification,
        userId,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
    )
    await Promise.all(promises)
    console.log(`Bulk notification sent to ${userIds.length} users`)
  } catch (error) {
    console.error("Error sending bulk notification:", error)
    throw error
  }
}

/**
 * Subscribe to user's notifications in real-time
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = []
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        } as Notification)
      })
      callback(notifications)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error subscribing to notifications:", error)
    throw error
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notifRef = doc(db, "notifications", notificationId)
    await updateDoc(notifRef, { read: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const notifRef = doc(db, "notifications", notificationId)
    await deleteDoc(notifRef)
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

/**
 * Notify admins about new pending organizer
 */
export async function notifyAdminsAboutPendingOrganizer(
  organizerId: string,
  organizerEmail: string
) {
  try {
    // In production, fetch actual admin IDs from a config or collection
    // For now, we'll notify via a generic admin channel
    await sendNotification({
      userId: "admin", // This would be replaced with actual admin IDs
      type: "pending_organizer",
      title: "New Organizer Pending Approval",
      message: `A new organizer (${organizerEmail}) is awaiting approval`,
      data: {
        organizerId,
        organizerName: organizerEmail,
      },
      read: false,
    })
  } catch (error) {
    console.error("Error notifying admins:", error)
  }
}

export async function notifyEventCreation(
  userIds: string[],
  eventName: string,
  eventId: string,
  organizerName: string,
  startDate: Date
) {
  try {
    await sendBulkNotification(userIds, {
      type: "event_created",
      title: "New Event Created",
      message: `${organizerName} created a new event: ${eventName}`,
      data: {
        eventId,
        eventName,
        organizerName,
        startDate: Timestamp.fromDate(startDate),
      },
      read: false,
    })
  } catch (error) {
    console.error("Error notifying about event creation:", error)
  }
}

/**
 * Notify about event updates (date, location, personnel changes)
 */
export async function notifyEventUpdate(
  userIds: string[],
  eventId: string,
  eventName: string,
  organizerName: string,
  changeDetails: string
) {
  try {
    await sendBulkNotification(userIds, {
      type: "event_updated",
      title: "Event Updated",
      message: `${organizerName} updated "${eventName}": ${changeDetails}`,
      data: {
        eventId,
        eventName,
        organizerName,
        changeDetails,
      },
      read: false,
    })
  } catch (error) {
    console.error("Error notifying about event update:", error)
  }
}

/**
 * Notify about event cancellation
 */
export async function notifyEventCancellation(
  userIds: string[],
  eventId: string,
  eventName: string,
  organizerName: string
) {
  try {
    await sendBulkNotification(userIds, {
      type: "event_cancelled",
      title: "Event Cancelled",
      message: `"${eventName}" has been cancelled by ${organizerName}`,
      data: {
        eventId,
        eventName,
        organizerName,
      },
      read: false,
    })
  } catch (error) {
    console.error("Error notifying about event cancellation:", error)
  }
}

/**
 * Notify about upcoming event (1 hour before)
 */
export async function notifyUpcomingEvent(
  userIds: string[],
  eventId: string,
  eventName: string,
  location: string,
  startDate: Date
) {
  try {
    await sendBulkNotification(userIds, {
      type: "upcoming_event",
      title: "Event Starting Soon",
      message: `${eventName} starts in 1 hour at ${location}`,
      data: {
        eventId,
        eventName,
        location,
        startDate: Timestamp.fromDate(startDate),
      },
      read: false,
    })
  } catch (error) {
    console.error("Error notifying about upcoming event:", error)
  }
}

/**
 * Notify about personnel added to event
 */
export async function notifyPersonnelAdded(
  userIds: string[],
  eventId: string,
  eventName: string,
  addedPersonnel: string
) {
  try {
    await sendBulkNotification(userIds, {
      type: "personnel_added",
      title: "Personnel Added to Event",
      message: `${addedPersonnel} has been added to "${eventName}"`,
      data: {
        eventId,
        eventName,
        changeDetails: `Added: ${addedPersonnel}`,
      },
      read: false,
    })
  } catch (error) {
    console.error("Error notifying about personnel addition:", error)
  }
}

export async function checkUpcomingEvents() {
  try {
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const reminderWindow = new Date(now.getTime() + 61 * 60 * 1000) // 61 mins to avoid overlap

    const eventsRef = collection(db, "events")
    const q = query(
      eventsRef,
      where("startDate", ">=", oneHourFromNow),
      where("startDate", "<", reminderWindow)
    )

    const querySnapshot = await getDocs(q)

    for (const eventDoc of querySnapshot.docs) {
      const event = eventDoc.data()
      const userIdsToNotify = event.saves || []

      if (userIdsToNotify.length > 0) {
        // Check if a reminder was already sent recently for this event
        const reminderQuery = query(
          collection(db, "notifications"),
          where("type", "==", "event_reminder"),
          where("data.eventId", "==", eventDoc.id)
        )
        const existingReminders = await getDocs(reminderQuery)

        if (existingReminders.empty) {
          await notifyUpcomingEvent(
            userIdsToNotify,
            eventDoc.id,
            event.eventName,
            event.location || "TBA",
            event.startDate.toDate()
          )
        }
      }
    }
  } catch (error) {
    console.error("Error checking for upcoming events:", error)
  }
}

/**
 * Deletes notifications that have expired.
 */
export async function clearOldReminders() {
  const now = Timestamp.now()
  const q = query(collection(db, "notifications"), where("expiresAt", "<=", now))
  const snapshot = await getDocs(q)
  const batch = writeBatch(db)
  snapshot.docs.forEach(doc => batch.delete(doc.ref))
  await batch.commit()
}
