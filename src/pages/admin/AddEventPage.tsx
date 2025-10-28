"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import EventForm from "@/shared/components/events/EventForm"
import type { EventFormData } from "@/types"
import { uploadImage } from "@/lib/imageUpload"

export default function AddEventPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { addEvent } = useEvents()
  const navigate = useNavigate()

  const handleSubmit = async (data: EventFormData) => {
    setIsLoading(true)
    try {
      let imageUrl: string | undefined

      if (data.image instanceof File) {
        imageUrl = await uploadImage(data.image, { folder: "events", maxSizeMB: 5 })
      }

      await addEvent(data, imageUrl)

      // SUCCESS: remain on the same page and show confirmation.
      // Avoid navigating to a public route which may trigger ProtectedRoute -> landing redirect.
      alert("Event created successfully. You will remain on this page.")
      // If you prefer to go to admin events list use the admin route:
      // navigate("/admin/events")
    } catch (error: any) {
      console.error("Failed to add event:", error)
      alert(error.message || "Failed to add event. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-black">Add New Event</h1>
        <p className="text-zinc-700">Create a new event for the GCEF system</p>
      </div>

      <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
