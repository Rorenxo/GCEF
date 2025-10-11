"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Event, EventFormData } from "@/types"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startDate", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as Event
        })
        setEvents(eventsData)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const addEvent = async (eventData: EventFormData, imageUrl?: string) => {
    try {
      const now = Timestamp.now()
      await addDoc(collection(db, "events"), {
        eventName: eventData.eventName,
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: Timestamp.fromDate(new Date(eventData.endDate)),
        description: eventData.description,
        location: eventData.location,
        professor: eventData.professor,
        department: eventData.department,
        imageUrl: imageUrl || null,
        createdAt: now,
        updatedAt: now,
      })
    } catch (err: any) {
      throw new Error(err.message || "Failed to add event")
    }
  }

  const updateEvent = async (id: string, eventData: Partial<EventFormData>, imageUrl?: string) => {
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
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl
      }

      await updateDoc(eventRef, updateData)
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
