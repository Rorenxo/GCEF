"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "@/lib/firebase"
import type { Event, EventFormData } from "@/types"

export function useEvents(options: { scope?: "all" | "user" } = {}) {
  const { scope = "user" } = options
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const user = auth.currentUser

    const fetchEvents = async () => {
      try {
        let q

        if (scope === "all") {
          q = query(collection(db, "events"), orderBy("startDate", "desc"))
        } else {
          if (!user) {
            setLoading(false)
            setError("User not authenticated for this scope.")
            return
          }
          const adminDoc = await getDoc(doc(db, "admins", user.uid))
          if (adminDoc.exists()) {
            q = query(collection(db, "events"), orderBy("startDate", "desc"))
          } else {
            q = query(
              collection(db, "events"),
              where("createdBy", "==", user.uid),
              orderBy("startDate", "desc")
            )
          }
        }

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const eventsData = snapshot.docs.map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                ...data,
                startDate: data.startDate?.toDate(),
                endDate: data.endDate?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
              } as Event
            })
            setEvents(eventsData)
            setLoading(false)
          },
          (err) => {
            setError(err.message)
            setLoading(false)
          }
        )

        return unsubscribe
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [scope])

  const addEvent = async (eventData: EventFormData, imageUrls?: string[]) => {
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error("User not authenticated")

      const now = Timestamp.now()

      // Get organizer info if available
      let organizerName: string | undefined
      let organizerEmail: string | undefined
      try {
        const orgDocRef = doc(db, "organizers", user.uid)
        const orgDocSnap = await getDoc(orgDocRef)
        if (orgDocSnap.exists()) {
          organizerName = orgDocSnap.data().organizerName
          organizerEmail = orgDocSnap.data().email
        }
      } catch {
        // If not an organizer, that's okay
      }

      const newEvent = await addDoc(collection(db, "events"), {
        eventName: eventData.eventName,
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        description: eventData.description,
        location: eventData.location,
        professor: eventData.professor,
        department: eventData.department,
        eventType: eventData.eventType || "Conference",
        eventTypeCustom: eventData.eventTypeCustom || null,
        speakers: eventData.speakers || [],
        maxParticipants: eventData.maxParticipants || null,
        registrationLinks: eventData.registrationLinks || [],
        attendanceInfo: eventData.attendanceInfo || { persons: [], locations: [] },
        imageUrls: imageUrls || [],
        organizerName: organizerName || null,
        organizerEmail: organizerEmail || null,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
      })

      // Send notifications about new event creation
      try {
        const { notifyEventCreation } = await import("@/lib/notificationService")
        // Notify all students (you may want to filter by department later)
        // For now, we'll just notify through the database structure
        // Admin notifications are typically done server-side or via a scheduled function
        console.log("Event created:", newEvent.id)
      } catch (error) {
        console.error("Error sending event creation notification:", error)
        // Don't throw - event was still created successfully
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to add event")
    }
  }

  const updateEvent = async (id: string, eventData: Partial<EventFormData>, imageUrls?: string[]) => {
    try {
      const eventRef = doc(db, "events", id)
      const updateData: any = {
        ...eventData,
        updatedAt: Timestamp.now(),
      }

      if (eventData.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(eventData.startDate))
      }
      if (eventData.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(eventData.endDate))
      }
      if (imageUrls !== undefined) {
        updateData.imageUrls = imageUrls
      }
      if (eventData.eventType !== undefined) {
        updateData.eventType = eventData.eventType
      }
      if (eventData.eventTypeCustom !== undefined) {
        updateData.eventTypeCustom = eventData.eventTypeCustom
      }
      if (eventData.speakers !== undefined) {
        updateData.speakers = eventData.speakers
      }
      if (eventData.maxParticipants !== undefined) {
        updateData.maxParticipants = eventData.maxParticipants
      }
      if (eventData.registrationLinks !== undefined) {
        updateData.registrationLinks = eventData.registrationLinks
      }
      if (eventData.attendanceInfo !== undefined) {
        updateData.attendanceInfo = eventData.attendanceInfo
      }

      await updateDoc(eventRef, updateData)

      // Send notifications about event update
      try {
        const { notifyEventUpdate } = await import("@/lib/notificationService")
        const currentEvent = await getDoc(eventRef)
        if (currentEvent.exists()) {
          const eventData = currentEvent.data()
          const changeDetails = Object.keys(updateData)
            .filter((k) => k !== "updatedAt")
            .join(", ")
          
          // Notify students who saved the event
          if (eventData.saves && eventData.saves.length > 0) {
            await notifyEventUpdate(
              eventData.saves,
              currentEvent.id,
              eventData.eventName,
              eventData.organizerName || "Event Organizer",
              `Updated: ${changeDetails}`
            )
          }
        }
      } catch (error) {
        console.error("Error sending event update notification:", error)
        // Don't throw - event was still updated successfully
      }
    } catch (err: any) {
      throw new Error(err.message || "Failed to update event")
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "events", id))
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete event")
    }
  }

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
  }
}
