"use client"

import { useState, useEffect } from "react"
import { useEvents } from "@/hooks/useEvents"
import { useAuth } from "@/hooks/useAuth"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isSameDay, format } from "date-fns"

const departmentColors: Record<string, string> = {
  CCS: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  CEAS: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  CAHS: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  CHTM: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
  CBA: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  ALL: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
}

export default function OrganizerCalendar() {
  const { user } = useAuth()
  const { events, loading } = useEvents({ scope: "organizer", organizerId: user?.uid })
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1 // Adjust to make Monday the first day (0)
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter((event) => isSameDay(event.startDate, date))
  }

  const eventsForSelectedDay = selectedDay
    ? events.filter((event) => isSameDay(event.startDate, selectedDay))
    : []

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">My Calendar</h1>
          <p className="text-zinc-500">View your events by date</p>
        </div>
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-900 text-xl hidden sm:block">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-lg">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center py-3 text-sm font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-gray-100" />
            ))}
            {days.map((day) => {
              const eventsOnDay = getEventsForDay(day)
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`relative p-2 border-r border-b border-gray-100 flex flex-col gap-1 h-36 ${isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), selectedDay || new Date()) ? 'bg-blue-50' : ''}`}
                >
                  <span className="font-medium text-gray-700 text-sm">{day}</span>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {eventsOnDay.map((event) => (
                      <div
                        key={event.id}
                        className={`w-full text-left p-1.5 rounded-md text-xs font-medium truncate transition-colors ${departmentColors[event.department] || departmentColors.ALL}`}
                      >
                        {event.eventName}
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedDay ? `Events on ${format(selectedDay, "MMMM d, yyyy")}` : "Select a date"}
          </h3>
          {eventsForSelectedDay.length > 0 ? (
            <div className="space-y-3">
              {eventsForSelectedDay.map((event) => (
                <div key={event.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                  <p className="font-medium text-gray-900">{event.eventName}</p>
                  <p className="text-xs text-gray-500">{event.department} • {event.location}</p>
                </div>
              ))}
            </div>
          ) : (<p className="text-sm text-gray-500">No events on this day.</p>)}
        </div>
      </div>
    </div>
  )
}