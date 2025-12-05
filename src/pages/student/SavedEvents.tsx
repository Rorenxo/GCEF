"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import useAuth from "@/shared/components/useStudentAuth"
import { Heart, MessageCircle, ArrowLeft, Eye, Bookmark, MapPin, Calendar } from "lucide-react"
import { format } from "date-fns"

type EventType = {
  id: string
  eventName?: string
  department?: string
  location?: string
  startDate: Date
  endDate: Date
  professor?: string
  description?: string
  imageUrl?: string
  hearts?: string[]
  saves?: string[]
  category?: 'School Event' | 'Seminar' | 'Activity' | 'Social'
  organizerName?: string
  organizerEmail?: string
  organizerPhotoURL?: string
  eventType?: string
  maxParticipants?: number
  speakers?: Array<{ name: string; title?: string }>
  registrationLinks?: Array<{ title: string; url: string }>
  images?: string[]
}

type CommentType = {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  text: string
  createdAt: Timestamp
}

export default function SavedEvents() {
  const [savedEvents, setSavedEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [expandedEvent, setExpandedEvent] = useState<EventType | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const q = query(collection(db, "events"), orderBy("startDate", "desc"))
    const unsub = onSnapshot(q, async (snap) => {
      const fetchOrganizerProfiles = async () => {
        const fetchedEvents = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data()
            let organizerPhotoURL = ""

            if (data.createdBy) {
              try {
                const orgDocRef = doc(db, "organizers", data.createdBy)
                const orgDocSnap = await getDoc(orgDocRef)
                if (orgDocSnap.exists()) {
                  organizerPhotoURL = orgDocSnap.data().photoURL || ""
                }
              } catch (error) {
                console.error("Error fetching organizer profile:", error)
              }
            }

            return {
              id: d.id,
              ...data,
              startDate: data.startDate?.toDate() ?? new Date(),
              endDate: data.endDate?.toDate() ?? new Date(),
              images: Array.isArray(data.imageUrls) && data.imageUrls.length > 0 ? data.imageUrls : data.imageUrl ? [data.imageUrl] : [],
              organizerPhotoURL,
            } as EventType
          })
        )

        const userSavedEvents = fetchedEvents.filter((event) => event.saves?.includes(user.uid))
        setSavedEvents(userSavedEvents)
        setLoading(false)
      }

      fetchOrganizerProfiles()
    })

    return () => unsub()
  }, [user])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-2">Please sign in to view saved events</p>
          <p className="text-sm text-muted-foreground">Sign in to start saving your favorite events!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-3 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 md:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Saved Events</h1>
          </div>
          <p className="text-sm text-gray-600">
            {savedEvents.length} {savedEvents.length === 1 ? "event" : "events"} saved
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : savedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-blue-50 rounded-full p-6 mb-6">
              <Bookmark className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No saved events yet</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Explore events and click the save button to add them to your collection
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((event) => (
              <motion.div
                key={event.id}
                layoutId={`saved-card-${event.id}`}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  onClick={() => setExpandedEvent(event)}
                  className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Header with Organizer Info */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white">
                        {event.organizerPhotoURL ? (
                          <img src={event.organizerPhotoURL} alt={event.organizerName || "Organizer"} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-white">{event.organizerName ? event.organizerName[0].toUpperCase() : "O"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{event.organizerName || "Organizer"}</h4>
                        <p className="text-xs text-gray-500">{event.organizerEmail || "organizer@email.com"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="w-full h-48 relative overflow-hidden bg-gray-200">
                    {event.images && event.images.length > 0 ? (
                      <img src={event.images[0]} alt={event.eventName || "Event"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Title & Description */}
                  <div className="px-4 py-3">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">{event.eventName || "Untitled Event"}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{event.description}</p>
                  </div>

                  {/* Event Info */}
                  <div className="px-4 py-2 space-y-2 text-sm text-gray-600">
                    {event.startDate && !isNaN(event.startDate.getTime()) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{format(event.startDate, "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="px-4 py-2 flex items-center gap-4 text-sm text-gray-600">

                  </div>

                  {/* View Button */}
                  <div className="px-4 py-3 border-t border-gray-200 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedEvent(event)
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      View Event
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Event Modal */}
      <AnimatePresence>
        {expandedEvent && (
          <SavedEventModal event={expandedEvent} onClose={() => setExpandedEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function EventCardSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg flex flex-col h-full p-4 space-y-4">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/80 to-transparent animate-[shimmer_1.5s_infinite]" />
      
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-grow space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200 rounded-lg" />

      {/* Title & Description Skeleton */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>

      {/* Event Info Skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Button Skeleton */}
      <div className="mt-auto pt-4">
        <div className="h-10 bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

function SavedEventModal({ event, onClose }: { event: EventType; onClose: () => void }) {
  const [comments, setComments] = useState<CommentType[]>([])
  const [[imagePage, imageDirection], setImagePage] = useState([0, 0])
  const { user } = useAuth()
  const images = event.images || []
  const imageIndex = images.length > 0 ? ((imagePage % images.length) + images.length) % images.length : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        layoutId={`saved-card-${event.id}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-gray-900">{event.eventName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Image */}
        {event.images && event.images.length > 0 && (
          <div className="w-full h-96 overflow-hidden">
            <img src={event.images[imageIndex]} alt={event.eventName} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Organizer Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-blue-100">
              {event.organizerPhotoURL ? (
                <img src={event.organizerPhotoURL} alt={event.organizerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-white">{event.organizerName ? event.organizerName[0].toUpperCase() : "O"}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{event.organizerName}</p>
              <p className="text-sm text-gray-600">{event.organizerEmail}</p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            {event.startDate && !isNaN(event.startDate.getTime()) && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {format(event.startDate, "PPP")}
                  <br />
                  {format(event.startDate, "p")}
                </p>
              </div>
            )}

            {event.location && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.location}</p>
              </div>
            )}

            {event.professor && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Professor/Coordinator</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.professor}</p>
              </div>
            )}

            {event.department && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Department</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.department}</p>
              </div>
            )}

            {event.eventType && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Event Type</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.eventType}</p>
              </div>
            )}

            {event.maxParticipants && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Max Participants</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.maxParticipants}</p>
              </div>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Speaker</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.speakers[0].name}</p>
              </div>
            )}
          </div>

          {/* Registration Links */}
          {event.registrationLinks && event.registrationLinks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Register</h3>
              <div className="space-y-2">
                {event.registrationLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

      </motion.div>
    </motion.div>
  )
}
