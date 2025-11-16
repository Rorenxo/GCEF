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

export default function EditEventPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [eventData, setEventData] = useState<Event | undefined>(undefined)
  const navigate = useNavigate()
  const { eventId } = useParams<{ eventId: string }>()
  const { updateEvent } = useEvents()

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
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
          } as Event)
        } else {
          console.error("No such event!")
          alert("Event not found.")
          navigate("/organizer")
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
      console.log("EditEventPage: submitting data:", data)
      let finalImageUrl: string | undefined = eventData?.imageUrl
      if (data.image instanceof File) {
        const url = await uploadImage(data.image, { folder: "events", maxSizeMB: 5 })
        finalImageUrl = url
      }

     
      const { image, ...restOfData } = data

      // Log the payload we will send to updateEvent
      console.log("EditEventPage: update payload:", { id: eventId, ...restOfData, imageUrl: finalImageUrl })

      await updateEvent(eventId, restOfData, finalImageUrl)

      // Verify update by fetching the document and logging it
      try {
        const updatedDoc = await getDoc(doc(db, "events", eventId))
        if (updatedDoc.exists()) {
          console.log("EditEventPage: updated event doc:", updatedDoc.id, updatedDoc.data())
        } else {
          console.warn("EditEventPage: updated doc not found after update")
        }
      } catch (err) {
        console.warn("EditEventPage: failed to fetch updated doc:", err)
      }
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigate("/organizer")
      }, 2000) // Wait 2 seconds before navigating
    } catch (error: any) {
      console.error("Failed to update event:", error)
      alert(error.message || "Failed to update event.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <AnimatePresence>
        {showSuccess && <SuccessNotification message="Event Updated Successfully!" />}
      </AnimatePresence>
      {!showSuccess && (
        <>
          <div>
            <h1 className="text-3xl font-bold text-black">Edit Event</h1>
            <p className="text-zinc-700">Update the details for your event.</p>
          </div>
          {isLoading && !eventData ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          ) : eventData ? (
            <EventForm onSubmit={handleSubmit} isLoading={isLoading} initialData={eventData} />
          ) : null}
        </>
      )}
    </div>
  )
}