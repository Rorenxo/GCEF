"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import Calendar from "@/shared/components/calendar/Calendar";
import EventModal from "@/shared/components/calendar/EventModal";
import type { Event } from "@/types";

export default function StudentCalendar() {
  const { events, loading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Calendar</h1>
          <p className="text-zinc-500">View campus events by date</p>
        </div>
      </div>

      {/* Calendar component */}
      <Calendar
        events={events}
        onEventClick={handleEventClick}
      />

      {/* Modal for event details */}
      <EventModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
