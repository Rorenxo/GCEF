"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

interface Event {
  id: string
  eventName: string
  department: string
  startDate: Date
  endDate: Date
  location: string
  description: string
  imageUrls: string[]
  professor?: string
}

export default function EventDetails() {
  const { organizerId, eventId } = useParams<{ organizerId: string; eventId: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!organizerId || !eventId) return

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", eventId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          const images =
            Array.isArray(data.imageUrls) && data.imageUrls.length > 0
              ? data.imageUrls
              : [data.imageUrl || "/placeholder.jpg"]

          setEvent({
            id: docSnap.id,
            eventName: data.eventName || "Untitled Event",
            department: data.department || "Unknown Department",
            startDate: data.startDate?.toDate?.() || new Date(),
            endDate: data.endDate?.toDate?.() || new Date(),
            location: data.location || "No location specified",
            description: data.description || "No description available.",
            imageUrls: images,
            professor: data.professor || "Gordon College",
          })
        } else {
          setEvent(null)
        }
      } catch (error) {
        console.error("Error fetching event:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [organizerId, eventId])

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading event details...
      </div>
    )

  if (!event)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <p className="mb-4 text-lg font-medium">Event not found.</p>
        <Link
          to="/organizer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Back to events
        </Link>
      </div>
    )

  const hasMultipleImages = event.imageUrls.length > 1

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link
          to="/organizer"
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
        </Link>
      </div>

      {/* Event Layout */}
      {hasMultipleImages ? (
        <div className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 h-[70vh]">
            {event.imageUrls.slice(0, 2).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${event.eventName}-${index}`}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 bg-white/95 backdrop-blur-md text-gray-900 p-8 sm:p-10 w-full sm:w-2/3 rounded-tr-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              {event.eventName}
            </h1>
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {event.department}
              </span>
              <span>📍 {event.location}</span>
              <span>
                🗓 {format(event.startDate, "MMM d, yyyy")} -{" "}
                {format(event.endDate, "MMM d, yyyy")}
              </span>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {event.description}
            </p>
            <p className="text-sm font-medium">
              <strong>Organizer:</strong> {event.professor}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-500">
          <div className="w-full lg:w-1/2">
            <img
              src={event.imageUrls[0]}
              alt={event.eventName}
              className="w-full h-[400px] lg:h-full object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {event.eventName}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {event.department}
              </span>
              <span>📍 {event.location}</span>
              <span>
                🗓 {format(event.startDate, "MMM d, yyyy")} -{" "}
                {format(event.endDate, "MMM d, yyyy")}
              </span>
            </div>

            <p className="text-gray-700 leading-relaxed mb-8">
              {event.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-gray-800">Organizer</p>
                <p className="text-gray-600">{event.professor}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Department</p>
                <p className="text-gray-600">{event.department}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
