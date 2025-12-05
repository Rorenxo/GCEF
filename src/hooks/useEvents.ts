"use client"

import { useState, useEffect } from "react"
import {collection,query,orderBy,where,onSnapshot,addDoc,updateDoc,deleteDoc,doc,getDoc,Timestamp,} from "firebase/firestore"
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
          const adminDocRef = doc(db, "admins", user.uid)
          const studentDocRef = doc(db, "students", user.uid)
          const [adminDoc, studentDoc] = await Promise.all([getDoc(adminDocRef), getDoc(studentDocRef)])

          if (adminDoc.exists() || studentDoc.exists()) {
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
      }

      const newEvent = await addDoc(collection(db, "events"), {
        eventName: eventData.eventName || null,
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        description: eventData.description || null,
        location: eventData.location || null,
        professor: eventData.professor || null,
        department: eventData.department || null,
        eventType: eventData.eventType || "Conference",
        eventTypeCustom: eventData.eventTypeCustom || null,
        speakers: eventData.speakers || [],
        maxParticipants: eventData.maxParticipants || null,
        registrationLinks: eventData.registrationLinks || [],
        attendanceInfo: eventData.attendanceInfo || { persons: [], locations: [] },
        imageUrls: imageUrls ?? [],
        organizerName: organizerName || null,
        organizerEmail: organizerEmail || null,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
      })

      try {
        const { notifyEventCreation } = await import("@/lib/notificationService")

        console.log("Event created:", newEvent.id)
      } catch (error) {
        console.error("Error sending event creation notification:", error)
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
        updatedAt: Timestamp.now()
      }

      if (eventData.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(eventData.startDate))
      }
      if (eventData.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(eventData.endDate))
      }
      if ('imageUrls' in updateData) {
        updateData.imageUrls = imageUrls ?? []
      }
      if ('eventType' in updateData) {
        updateData.eventType = eventData.eventType || "Conference"
      }
      if ('eventTypeCustom' in updateData) {
        updateData.eventTypeCustom = eventData.eventTypeCustom || null
      }
      if ('speakers' in updateData) {
        updateData.speakers = eventData.speakers || []
      }
      if (eventData.maxParticipants !== undefined) {
        updateData.maxParticipants = eventData.maxParticipants || null
      }
      if ('registrationLinks' in updateData) {
        updateData.registrationLinks = eventData.registrationLinks || []
      }
      if ('attendanceInfo' in updateData) {
        updateData.attendanceInfo = eventData.attendanceInfo || { persons: [], locations: [] }
      }
      
      await updateDoc(eventRef, updateData)
      try {
        const { notifyEventUpdate } = await import("@/lib/notificationService")
        const currentEvent = await getDoc(eventRef)
        if (currentEvent.exists()) {
          const eventData = currentEvent.data()
          const changeDetails = Object.keys(updateData)
            .filter((k) => k !== "updatedAt")
            .join(", ")
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
