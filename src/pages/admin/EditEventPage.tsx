"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import EventForm from "@/shared/components/events/EventForm"
import type { EventFormData, Event } from "@/types"
import { uploadImage } from "@/lib/imageUpload"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import SuccessNotification from "@/shared/components/events/successNotif"

export default function AdminEditEventPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [eventData, setEventData] = useState<Event | undefined>(undefined)
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { updateEvent } = useEvents()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!eventId) return

    const fetchEvent = async () => {
      setIsLoading(true)
      try {
        const docRef = doc(db, "events", eventId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setEventData({
            id: docSnap.id,
            eventName: data.eventName || "Untitled Event",
            department: data.department || "Unknown Department",
            location: data.location || "No location specified",
            startDate: data.startDate?.toDate?.() || new Date(),
            endDate: data.endDate?.toDate?.() || new Date(),
            professor: data.professor || "Gordon College",
            description: data.description || "No description available.",
            imageUrl: data.imageUrl || "",
            imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : data.imageUrl ? [data.imageUrl] : [],
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as Event)
        } else {
          console.error("No such event!")
          alert("Event not found.")
          navigate("/admin/events")
        }
      } catch (error) {
        console.error("Error fetching event:", error)
        alert("Failed to load event data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, navigate])

  const handleSubmit = async (data: EventFormData) => {
    if (!eventId) return

    setIsLoading(true)
    try {
      const { images, ...eventDetails } = data
      let imageUrls: string[] = Array.isArray(eventData?.imageUrls) ? [...eventData.imageUrls] : []

      if (Array.isArray(images) && images.length > 0) {
        const newFiles = images.filter(img => img instanceof File) as File[]
        if (newFiles.length > 0) {
          const uploadedUrls = await Promise.all(
            newFiles.map(file => uploadImage(file, { folder: "events", maxSizeMB: 5 }))
          )
          imageUrls = [...imageUrls, ...uploadedUrls]
        }
      }

      await updateEvent(eventId, eventDetails, imageUrls)
      setShowSuccess(true)
      setTimeout(() => {
        navigate("/admin/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Failed to update event:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>{showSuccess && <SuccessNotification message="Event Updated Successfully!" />}</AnimatePresence>
      {!showSuccess && (
        <>{isLoading && !eventData ? <div className="flex justify-center items-center h-64"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" /></div> : <EventForm onSubmit={handleSubmit} isLoading={isLoading} initialData={eventData} />}</>
      )}
    </div>
  )
}