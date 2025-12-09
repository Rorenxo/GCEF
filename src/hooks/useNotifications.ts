"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  limit,
  getDocs,
  where,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  data: {
    eventId: string
    eventName: string
  }
}

export function useNotifications(options: { limit?: number } = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const notificationsRef = collection(db, "notifications")
    let q

    if (options.limit) {
      q = query(notificationsRef, orderBy("createdAt", "desc"), limit(options.limit))
    } else {
      q = query(notificationsRef, orderBy("createdAt", "desc"))
    }

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const notifs = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
          } as Notification
        })
        setNotifications(notifs)
        setLoading(false)
      },
      err => {
        console.error("Error fetching notifications:", err)
        setError("Failed to fetch notifications.")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [options.limit])

  const markAllAsRead = useCallback(async () => {
    const unreadNotifs = notifications.filter(n => !n.read)
    if (unreadNotifs.length === 0) return

    const batch = writeBatch(db)
    unreadNotifs.forEach(notif => {
      const notifRef = doc(db, "notifications", notif.id)
      batch.update(notifRef, { read: true })
    })

    await batch.commit()
  }, [notifications])

  return { notifications, loading, error, markAllAsRead }
}