"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { formatDateTime } from "@/lib/utils"
import type { Event, Department } from "@/types"
import { MapPin, User, CalendarIcon } from "lucide-react"

interface EventModalProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const departmentColors: Record<Department, string> = {
  ALL: "#000000",
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
}

export default function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-zinc-800 bg-white text-black">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`mt-1 h-3 w-3 rounded-full ${departmentColors[event.department]}`} />
            <div className="flex-1">
              <DialogTitle className="text-2xl">{event.eventName}</DialogTitle>
              <p className="text-sm text-zinc-600">{event.department}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {event.imageUrl && (
            <img
              src={event.imageUrl || "/placeholder.svg"}
              alt={event.eventName}
              className="h-64 w-full rounded-lg object-cover"
            />
          )}

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-700">Description</h3>
              <p className="leading-relaxed text-zinc-700">{event.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg- whi p-4">
                <CalendarIcon className="mt-0.5 h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Start Date</p>
                  <p className="font-medium text-white">{formatDateTime(event.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <CalendarIcon className="mt-0.5 h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">End Date</p>
                  <p className="font-medium text-white">{formatDateTime(event.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Location</p>
                  <p className="font-medium text-white">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <User className="mt-0.5 h-5 w-5 text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-500">Professor</p>
                  <p className="font-medium text-white">{event.professor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
