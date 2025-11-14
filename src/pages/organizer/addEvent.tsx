"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import EventForm from "@/shared/components/events/EventForm"
import type { EventFormData } from "@/types"
import { uploadImage } from "@/lib/imageUpload"
import { auth } from "@/lib/firebase"

export default function OrgEventPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { addEvent } = useEvents() 

  const handleSubmit = async (data: EventFormData) => {
    const user = auth.currentUser
    if (!user) {
      alert("Organizer not logged in.")
      return
    }

    setIsLoading(true)
    try {
      let imageUrl: string | undefined
      if (data.image instanceof File) {
        imageUrl = await uploadImage(data.image, { folder: "events", maxSizeMB: 5 })
      }

      await addEvent(data, imageUrl)
      alert("Event created successfully!")
      navigate("/organizer") 
    } catch (error: any) {
      console.error("Failed to add event:", error)
      alert(error.message || "Failed to add event.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-black">Add New Event</h1>
        <p className="text-zinc-700">Create a new event for your department.</p>
      </div>
      <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}
