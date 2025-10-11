"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEvents } from "@/hooks/useEvents"
import Calendar from "@/components/calendar/Calendar"
import EventModal from "@/components/calendar/EventModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Event } from "@/types"

export default function CalendarPage() {
  const { events, loading } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleDateClick = (date: Date) => {
    navigate("/add-event")
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Calendar</h1>
          <p className="text-zinc-500">View and manage events by date</p>
        </div>
        <Button onClick={() => navigate("/add-event")} className="bg-white text-black hover:bg-zinc-200">
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <Calendar events={events} onDateClick={handleDateClick} onEventClick={handleEventClick} />

      <EventModal event={selectedEvent} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
