"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEvents } from "@/hooks/useEvents"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

import { Trash2, Edit, Calendar, MapPin, User, BookOpen, Users, Loader2, Eye } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Event, Department } from "@/types"

const departmentColors: Record<Department, string> = {
  ALL: "bg-zinc-300",
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
}

export default function EventsPage() {
  const { events, loading, deleteEvent, updateEvent } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<Event | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isZoomed, setIsZoomed] = useState(false)


  const navigate = useNavigate()


  const handleDelete = async () => {
    if (!deleteConfirmEvent) return

    setDeletingId(deleteConfirmEvent.id)
    try {
      await deleteEvent(deleteConfirmEvent.id)
      setDeleteConfirmEvent(null)
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
    <div className=" space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Events</h1>
          <p className="text-zinc-600 p-1">Manage all GCEF events</p>
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
                    <TableHead className="text-zinc-600">Event / Organizer</TableHead>
                    <TableHead className="text-zinc-600">Date</TableHead>
                    <TableHead className="text-zinc-600">Start Time</TableHead>
                    <TableHead className="text-zinc-600">End Time</TableHead>
                    <TableHead className="text-zinc-600">Location</TableHead>
                    <TableHead className="text-zinc-600">Department / Type</TableHead>
                    <TableHead className="text-right text-zinc-600">Tools</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.id}
                      className="border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                      onClick={() => {
                        setSelectedEvent(event)
                        setViewDialogOpen(true)
                        const images = (event as any).imageUrls || [];
                        if (images.length > 0) {
                          setImageUrls(images);
                        } else if (event.imageUrl) {
                          setImageUrls([event.imageUrl]);
                        } else {
                          setImageUrls([]);
                        }
                        setImageUrls(images.length > 0 ? images : event.imageUrl ? [event.imageUrl] : []);
                      }}
                    >
                      <TableCell className="font-medium text-black">
                        <div>{event.eventName}</div>
                        <div className="text-xs text-gray-500">{event.professor}</div>
                      </TableCell>
                      <TableCell className="text-zinc-700">{new Date(event.startDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-zinc-700">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell className="text-zinc-700">{new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell className="text-zinc-700">{event.location}</TableCell>
                      <TableCell className="text-zinc-700">{event.department} / {event.eventType || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/admin/edit-event/${event.id}`)
                            }}
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button onClick={(e) => { e.stopPropagation(); setDeleteConfirmEvent(event); }} variant="ghost" size="icon" className="text-red-600 hover:bg-red-600 hover:text-white">
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="p-0 border-none bg-white text-zinc-900 shadow-xl w-full max-w-4xl h-[90vh] flex flex-row overflow-hidden">
          {selectedEvent && (
            <>

              <div className="w-full md:w-1/2 h-auto md:h-full bg-gray-100 flex-shrink-0 flex flex-col overflow-hidden">
                {/* Main Image */}
                <div className="relative w-full h-64 md:flex-1">
                  {imageUrls.length > 0 ? (
                    <img src={imageUrls[0]} alt={selectedEvent.eventName} className={`w-full h-full transition-all duration-300 ${isZoomed ? 'object-contain' : 'object-cover'}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">N/A</div>
                  )}
                  {imageUrls.length > 0 && (
                    <button
                      onClick={() => setIsZoomed(prev => !prev)}
                      className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all z-10"
                      title={isZoomed ? "Zoom out" : "Zoom in"}
                    >
                      <Eye className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>
                {/* Thumbnails row */}
                <div className="flex-shrink-0 p-2 bg-gray-50">
                  <div className="flex gap-2">
                    {imageUrls.length > 1 && imageUrls.slice(1, 5).map((u, i) => (
                      <div key={i} className="w-1/4 h-20 overflow-hidden rounded-md bg-gray-200">
                        <img src={u} alt={`${selectedEvent.eventName}-${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.eventName || 'N/A'}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedEvent.organizerName || selectedEvent.professor || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description || 'N/A'}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Date & Time</p>
                        <p className="text-sm text-gray-600">{formatDateTime(selectedEvent.startDate) || 'N/A'} to {formatDateTime(selectedEvent.endDate) || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Location</p>
                        <p className="text-sm text-gray-600">{selectedEvent.location || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Organizer / Professor</p>
                        <p className="text-sm text-gray-600">{selectedEvent.professor || selectedEvent.organizerName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{selectedEvent.organizerEmail || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Department</p>
                        <p className="text-sm text-gray-600">{selectedEvent.department || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Event Type</p>
                        <p className="text-sm text-gray-600">{selectedEvent.eventType || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Max Participants</p>
                        <p className="text-sm text-gray-600">{selectedEvent.maxParticipants ?? 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Speakers</p>
                        <p className="text-sm text-gray-600">{(selectedEvent.speakers && selectedEvent.speakers.length > 0) ? selectedEvent.speakers.map(s => s.name).join(', ') : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Registration Links</p>
                        <div className="text-sm text-gray-600">
                          {(selectedEvent.registrationLinks && selectedEvent.registrationLinks.length > 0) ? (
                            <ul className="list-disc pl-5">
                              {selectedEvent.registrationLinks.map((r, idx) => (
                                <li key={idx}><a className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a></li>
                              ))}
                            </ul>
                          ) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {deleteConfirmEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete the event "{deleteConfirmEvent.eventName}"? This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setDeleteConfirmEvent(null)} className="hover:bg-gray-200">Cancel</Button>
                <Button
                  onClick={() => {
                    if (deleteConfirmEvent) {
                      handleDelete()
                    }
                  }}
                  disabled={!!deletingId}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {deletingId ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}