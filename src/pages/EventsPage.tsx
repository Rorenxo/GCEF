"use client"

import { useState } from "react"
import { useEvents } from "@/hooks/useEvents"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, Eye } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Event, Department } from "@/types"

const departmentColors: Record<Department, string> = {
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
}

export default function EventsPage() {
  const { events, loading, deleteEvent } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!selectedEvent) return

    setDeletingId(selectedEvent.id)
    try {
      await deleteEvent(selectedEvent.id)
      setDeleteDialogOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Failed to delete event:", error)
      alert("Failed to delete event. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Events</h1>
          <p className="text-zinc-600 p-1" >Manage all GCEF events</p>
        </div>
      </div>

      <Card className="border-zinc-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-900">All Events ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-zinc-500">No events found. Create your first event!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-200 bg-white shadow-lg">
                    <TableHead className="text-zinc-600">Event</TableHead>
                    <TableHead className="text-zinc-600">Department</TableHead>
                    <TableHead className="text-zinc-600">Date</TableHead>
                    <TableHead className="text-zinc-600">Location</TableHead>
                    <TableHead className="text-zinc-600">Professor</TableHead>
                    <TableHead className="text-right text-zinc-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="border-zinc-200 hover:bg-zinc-200">
                      <TableCell className="font-medium text-black">{event.eventName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${departmentColors[event.department]}`} />
                          <span className="text-zinc-900">{event.department}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-700">{formatDateTime(event.startDate)}</TableCell>
                      <TableCell className="text-zinc-700">{event.location}</TableCell>
                      <TableCell className="text-zinc-700">{event.professor}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEvent(event)
                              setViewDialogOpen(true)
                            }}
                            className="text-zinc-500 hover:bg-zinc-200 hover:text-white"
                          >
                            <Eye className="h-4 w-4 text-zinc-900 hover:text-800" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedEvent(event)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-zinc-500 hover:bg-zinc-200 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Event Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="border-zinc-200 bg-white text-zinc-900 shadow-xl w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.eventName}</DialogTitle>
            <DialogDescription className="text-zinc-600">Event details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 p-4 pt-0">
              {selectedEvent.imageUrl && (
                <img
                  src={selectedEvent.imageUrl || "/placeholder.svg"}
                  alt={selectedEvent.eventName}
                  className="h-48 w-full rounded-lg object-cover"
                />
              )}
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Description</p>
                  <p className="text-zinc-800">{selectedEvent.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Start Date</p>
                    <p className="text-zinc-800">{formatDateTime(selectedEvent.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">End Date</p>
                    <p className="text-zinc-800">{formatDateTime(selectedEvent.endDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Location</p>
                    <p className="text-zinc-800">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Professor</p>
                    <p className="text-zinc-800">{selectedEvent.professor}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Department</p>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${departmentColors[selectedEvent.department]}`} />
                    <p className="text-zinc-800">{selectedEvent.department}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-zinc-300 bg-white text-zinc-700">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{selectedEvent?.eventName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-200 bg-white text-zinc-900 shadow-xl w-full max-w-sm hover:bg-700"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={!!deletingId} className="bg-red-600 text-white hover:bg-red-700">
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
