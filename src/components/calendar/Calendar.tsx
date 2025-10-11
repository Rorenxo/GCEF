"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Event, Department } from "@/types"

interface CalendarProps {
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

const departmentColors: Record<Department, string> = {
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function Calendar({ events, onDateClick, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getEventsForDate = (day: number) => {
    const date = new Date(year, month, day)
    return events.filter((event) => {
      const eventDate = new Date(event.startDate)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-xl shadow-black/30">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 shadow-md transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 shadow-md transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="mb-2 grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-zinc-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const dayEvents = getEventsForDate(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              onClick={() => onDateClick(new Date(year, month, day))}
              className={`group relative aspect-square rounded-lg border p-2 transition-colors ${
                today
                  ? "border-zinc-900 bg-zinc-200 shadow-inner"
                  : "border-zinc-300 bg-white hover:border-zinc-300 hover:bg-zinc-200"
              }`}
            >
              <div className="flex h-full flex-col">
                <span
                  className={`text-sm font-medium ${today ? "text-zinc-800" : "text-zinc-600 group-hover:text-zinc-800"}`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        className={`h-1.5 w-1.5 rounded-full ${departmentColors[event.department]} hover:scale-150 transition-transform`}
                        title={event.eventName}
                      />
                    ))}
                    {dayEvents.length > 3 && <span className="text-[10px] text-zinc-900">+{dayEvents.length - 3}</span>}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 border-t border-zinc-200 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-sm text-zinc-800">CCS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-sm text-zinc-800">CEAS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-zinc-800">CAHS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-pink-500" />
          <span className="text-sm text-zinc-800">CHTM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-zinc-800">CBA</span>
        </div>
      </div>
    </div>
  )
}
