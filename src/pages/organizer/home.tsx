"use client"

import { useState, useEffect } from "react"
import { Search, Bell, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore" 
import { db, auth } from "@/lib/firebase"
import { Link } from "react-router-dom"
import { format, isSameDay } from "date-fns"
import { useAuth } from "@/hooks/useAuth"

interface Event {
  id: string
  eventName: string
  department: string
  startDate: Date
  endDate: Date
  location: string
  professor: string
  description: string
  imageUrl?: string
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const currentUser = auth.currentUser
        if (!currentUser) {
          console.warn("No organizer logged in")
          setLoading(false)
          return
        }

        const eventsRef = collection(db, "events")
        let q
//@ts-ignore
        if (user?.role === "admin") {
          q = query(eventsRef)
        } 
        else {
          q = query(eventsRef, where("createdBy", "==", currentUser.uid))
        }

        const snapshot = await getDocs(q)
        const fetchedEvents: Event[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            eventName: data.eventName || "Untitled Event",
            department: data.department || "Unknown",
            startDate: data.startDate?.toDate?.() || new Date(),
            endDate: data.endDate?.toDate?.() || new Date(),
            location: data.location || "Unknown Location",
            professor: data.professor || "N/A",
            description: data.description || "No description provided.",
            imageUrl: Array.isArray(data.imageUrls)
              ? data.imageUrls[0]
              : data.imageUrl || "/placeholder.jpg",
          }
        })

        setEvents(fetchedEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  // ✅ Search filtering
  const filteredEvents = events.filter((event) => {
    const term = search.trim().toLowerCase()
    return (
      !term ||
      event.eventName.toLowerCase().includes(term) ||
      event.department.toLowerCase().includes(term)
    )
  })

  // ✅ Department color styles
  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      CCS: "bg-orange-100 border-orange-300",
      CAHS: "bg-red-100 border-red-300",
      CHTM: "bg-pink-100 border-pink-300",
      CEAS: "bg-blue-100 border-blue-300",
      CBA: "bg-yellow-100 border-yellow-300",
    }
    return colors[dept] || "bg-gray-100 border-gray-300"
  }

  // ✅ Calendar setup
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter((event) => isSameDay(event.startDate, date))
  }

  const eventsForSelectedDay = selectedDay
    ? events.filter((event) => isSameDay(event.startDate, selectedDay))
    : []
  return (
    <div className="flex h-screen bg-gray-50 overflow-auto p-6">
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Events List */}
          
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === "admin" ? "All Events" : "My Events"}
            </h1>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}  
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Events..."
                className="pl-10 h-11 w-full border rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Events Display */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading Events...</div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/organizer/${user?.uid}/events/${event.id}`}
                    className="block"
                  >
                    <div
                      className={`rounded-2xl overflow-hidden border-2 ${getDepartmentColor(
                        event.department
                      )} hover:shadow-lg transition-all`}
                    >
                      {/* Event Image */}
                      <div className="h-40 w-full overflow-hidden">
                        <img
                          src={event.imageUrl || "/placeholder.jpg"}
                          alt={event.eventName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Event Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.eventName}</h3>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          📍 {event.location} • {event.department}
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>👨‍🏫 {event.professor}</span>
                          <ArrowRight className="h-4 w-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No Event Found</div>
            )}
          </div>

          {/* RIGHT: Notifications + Calendar */}
          <div className="space-y-6">
            {/* Notifications Section */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Recent updates & events</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-500">No new notifications.</p>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">{monthName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                    }
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                    }
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-gray-500">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="text-center py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {days.map((day) => {
                  const eventsOnDay = getEventsForDay(day)
                  const hasEvents = eventsOnDay.length > 0
                  return (
                    <button
                      key={day}
                      onClick={() =>
                        setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                      }
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors relative ${
                        hasEvents
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {day}
                      {hasEvents && (
                        <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Day Events */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDay ? `Events on ${format(selectedDay, "MMMM d, yyyy")}` : "Select a date"}
              </h3>
              {selectedDay ? (
                eventsForSelectedDay.length > 0 ? (
                  <div className="space-y-3">
                    {eventsForSelectedDay.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
                      >
                        <p className="font-medium text-gray-900">{event.eventName}</p>
                        <p className="text-xs text-gray-500">
                          {event.department} • {event.location}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No events on this day.</p>
                )
              ) : (
                <p className="text-sm text-gray-500">Click a date to view events.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
