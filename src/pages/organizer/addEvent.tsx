"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import EventForm from "@/shared/components/events/EventForm"
import type { EventFormData } from "@/types"
import { uploadImage } from "@/lib/imageUpload"
import { auth } from "@/lib/firebase"
import SuccessNotification from "@/shared/components/events/successNotif"

export default function OrgEventPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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
      let imageUrls: string[] = []
      if (Array.isArray(data.images) && data.images.length > 0) {
        const files = data.images.filter((f) => f instanceof File) as File[]
        if (files.length > 0) {
          const uploaded = await Promise.all(
            files.map((file) => uploadImage(file, { folder: "events", maxSizeMB: 5 }))
          )
          imageUrls = uploaded
        }
      } else if (data.image instanceof File) {
        const url = await uploadImage(data.image, { folder: "events", maxSizeMB: 5 })
        imageUrls = [url]
      }

      await addEvent(data, imageUrls)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigate("/organizer")
      }, 2000) 
    } catch (error: any) {
      console.error("Failed to add event:", error)
      alert(error.message || "Failed to add event.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-8">
      <AnimatePresence>
        {showSuccess && <SuccessNotification message="Event Created Successfully!" />}
      </AnimatePresence>
      {!showSuccess && (
        <>
          <div>
            <h1 className="text-3xl font-bold text-black">Add New Event</h1>
            <p className="text-zinc-700">Create a new event for your department.</p>
          </div>
          <EventForm onSubmit={handleSubmit} isLoading={isLoading} />
        </>
      )}
    </div>
  )
}
