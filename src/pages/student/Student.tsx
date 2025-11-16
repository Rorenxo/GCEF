"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import {collection,query,orderBy,onSnapshot,doc,updateDoc,arrayUnion,arrayRemove,addDoc,serverTimestamp,deleteDoc} from "firebase/firestore"
import { db } from "@/lib/firebase"
import useAuth from "@/shared/components/useStudentAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {Calendar,MapPin,Heart,MessageCircle,Send,ChevronLeft,ChevronRight,Search,Bell,User,ArrowRight,ChevronDown,Eye,Settings, X, MoreHorizontal, ZoomIn, ZoomOut} from "lucide-react"
import { format, isSameDay } from "date-fns"
import { Timestamp } from "firebase/firestore"
import welcomeBg from '@/assets/studs.png'

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
}

type CommentType = {
  id: string
  authorId: string
  authorName: string
  text: string
  createdAt: Timestamp
}

// colors 
const departmentLabels: Record<string, string> = {
  ALL: "All Departments",
  CCS: "Computer Studies",
  CEAS: "Education & Arts",
  CAHS: "Allied Health",
  CHTM: "Hospitality",
  CBA: "Business",
}

const departmentColors: Record<string, string> = { //100 or 200 try lang
  ALL: "bg-gray-200",
  CCS: "bg-orange-100",
  CEAS: "bg-blue-100",
  CAHS: "bg-red-100",
  CHTM: "bg-pink-100",
  CBA: "bg-yellow-100",
};

const departmentTextColors: Record<string, string> = {
  ALL: "text-gray-800",
  CCS: "text-orange-800",
  CEAS: "text-blue-800",
  CAHS: "text-red-800",
  CHTM: "text-pink-800",
  CBA: "text-yellow-800",
};


export default function StudentFeed() {
  const [events, setEvents] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDept, setSelectedDept] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const { user } = useAuth()
  const [commentModalEvent, setCommentModalEvent] = useState<EventType | null>(null)

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startDate", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      const fetchedEvents = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          startDate: data.startDate?.toDate() ?? new Date(),
          endDate: data.endDate?.toDate() ?? new Date(),
        } as EventType
      })
      setEvents(fetchedEvents)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileDropdownRef])


  const toggleLike = async (eventId: string) => {
    if (!user) return alert("Please sign in to like posts")
      
    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === eventId) {
          const currentHearts = event.hearts || []
          const isLiked = currentHearts.includes(user.uid)
          const newHearts = isLiked
            ? currentHearts.filter(uid => uid !== user.uid)
            : [...currentHearts, user.uid]
          return { ...event, hearts: newHearts }
        }
        return event
      })
    )

    const eventRef = doc(db, "events", eventId)
    const eventToUpdate = events.find(e => e.id === eventId)
    const alreadyLiked = eventToUpdate?.hearts?.includes(user.uid)
    await updateDoc(eventRef, { hearts: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) })
  }

  const addComment = async (eventId: string, text: string) => {
    if (!user) return alert("Please sign in to comment")
    if (!text.trim()) return
    try {
      const commentsRef = collection(db, "events", eventId, "comments")
      await addDoc(commentsRef, {
        authorId: user.uid,
        authorName: user.displayName || user.email || "Student",
        text: text.trim(),
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      console.error("Error adding comment:", err)
      alert("Failed to post comment.")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i)
  const monthName = format(currentDate, "MMMM yyyy")

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((event) => isSameDay(event.startDate, date));
  }

  const eventsForSelectedDay = selectedDay
    ? events.filter((event) => isSameDay(event.startDate, selectedDay))
    : []

  const filteredEvents = selectedDept === "ALL" ? events : events.filter((event) => event.department === selectedDept)
  const searchFilteredEvents = filteredEvents.filter(
    (event) =>
      event.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(today.getDate() + 7)

  const todaysEvents = searchFilteredEvents.filter(event => event.startDate >= today && event.startDate <= endOfToday);

  const upcomingEvents = searchFilteredEvents.filter(event => event.startDate > endOfToday && event.startDate <= sevenDaysFromNow);

  const pastEvents = searchFilteredEvents.filter(event => event.startDate < today);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Main Feed */}
      <main className="flex-1 flex flex-col overflow-hidden pt-4">
        <div className="bg-card px-4 md:px-8 py-4 shadow-sm relative">
          <div className="hidden lg:flex gap-2 overflow-x-auto pb-2">
            {["ALL", "CCS", "CEAS", "CAHS", "CHTM", "CBA"].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  selectedDept === dept
                    ? `${departmentColors[dept]} ${departmentTextColors[dept]} shadow-lg`
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {departmentLabels[dept as keyof typeof departmentLabels]}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center gap-4 lg:hidden">
            <div className="relative flex items-center flex-1">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm h-9"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Filter
            </button>
          </div>
          <AnimatePresence>
          {showMobileFilters && (
            <div className="lg:hidden absolute right-4 mt-2 w-48 bg-white border rounded-md shadow-lg z-10 p-2 space-y-1">
              {["ALL", "CCS", "CEAS", "CAHS", "CHTM", "CBA"].map((dept) => (
                <button
                  key={`mobile-${dept}`}
                  onClick={() => { setSelectedDept(dept); setShowMobileFilters(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedDept === dept
                      ? `${departmentColors[dept]} ${departmentTextColors[dept]}`
                      : "text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {departmentLabels[dept as keyof typeof departmentLabels]}
                </button>
              ))}
            </div>
          )}
          </AnimatePresence>
        </div>

        {/* Events Content */}
        <section className="flex-1 overflow-y-auto space-y-6 p-4 md:p-8">
          <div className="group relative rounded-2xl overflow-hidden h-auto md:h-56 border border-border shadow-lg text-white">
            <img 
              src={welcomeBg} 
              alt="Welcome background" 
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/15 flex flex-col justify-center items-center text-center p-6 md:p-10">
              <h4 className="text-5xl md:text-4xl font-extrabold mb-2 leading-tight text-balance">
                Welcome, {user?.displayName || "Student"}!
              </h4>
              <p className="text-white/90 text-base md:text-lg font-light  max-w-md">
                Explore upcoming events and stay connected with your campus community.
              </p>
            </div>
          </div>

          {/* Events Section */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {searchQuery ? `Search Results` : ""}
            </h3>

            {searchFilteredEvents.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center shadow-sm">
                <p className="text-muted-foreground text-lg">
                  {searchQuery
                    ? "No events match your search."
                    : "No events available for this department."}
                </p>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <EventSection title="Upcoming Events (Next 7 Days)">
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onLike={toggleLike}
                        onComment={addComment}
                        currentUser={user}
                        onCommentClick={(event) => setCommentModalEvent(event)}
                      />
                    ))}
                  </EventSection>
                )}
                {/* Today's Events */}
                {todaysEvents.length > 0 && (
                  <EventSection title="Today's Events">
                    {todaysEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onLike={toggleLike}
                        onComment={addComment}
                        currentUser={user}
                        onCommentClick={(event) => setCommentModalEvent(event)}
                      />
                    ))}
                  </EventSection>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                  <EventSection title="Past Events">
                    {pastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onLike={toggleLike}
                        onComment={addComment}
                        currentUser={user}
                        onCommentClick={(event) => setCommentModalEvent(event)}
                      />
                    ))}
                  </EventSection>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {commentModalEvent && (
          <ExpandedEventCard
            event={commentModalEvent}
            onClose={() => setCommentModalEvent(null)}
            onLike={toggleLike}
            onComment={addComment}
            currentUser={user}
          />
        )}
      </AnimatePresence>


      <aside className="hidden lg:flex w-96 bg-card overflow-y-auto flex-col gap-6 p-6">
        {/* Sidebar Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm h-9"
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border color-gray z-10 p-2">
                  <Link
                    to="/student/profile"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-blue-100 rounded-md"
                  >
                    <User className="h-4 w-4" /> View Profile
                  </Link>
                  <Link
                    to="/student/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-blue-100 rounded-md"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
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

          <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-gray-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center py-2">
                {day}
              </div>
            ))}
          </div>

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
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedDay ? `Events on ${format(selectedDay, "MMMM d, yyyy")}` : "Select a date"}
          </h3> 
          {selectedDay ? (
            eventsForSelectedDay.length > 0 ? (
              <div className="space-y-3">
                {eventsForSelectedDay.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
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
      </aside>
    </div>
  )
}

function EventSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h4 className="text-xl   font-semibold text-foreground">{title}</h4>
        <div className="flex-1 border-b border-gray-400"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </section>
  )
}

function EventCard({ 
  event,
  onLike,
  onComment,
  onCommentClick,
}: {
  event: EventType;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void
  onCommentClick: (event: EventType) => void
  currentUser: any
}) {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<CommentType[]>([])
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    const q = query(collection(db, "events", event.id, "comments"), orderBy("createdAt", "asc"))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setComments(arr)
    })
    return () => unsub()
  }, [event.id])

  const hearts = event.hearts ?? []
  const { user } = useAuth()
  const liked = user && user.uid && hearts.includes(user.uid)

  let dateStr = "Invalid Date"
  if (event.startDate && !isNaN(event.startDate.getTime())) dateStr = format(event.startDate, "PPP")

  return (
    <motion.div layoutId={`card-container-${event.id}`}>
    <Card className="bg-card border-border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer" onClick={() => onCommentClick(event)}>
      <div className="relative h-40 md:h-48 overflow-hidden bg-muted">
        {event.imageUrl && (
          <img
            src={event.imageUrl || "/placeholder.svg"}
            alt={event.eventName || "Event"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {event.department && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full">
            <span className="text-xs font-semibold text-primary-foreground">{event.department}</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 pt-4 flex-shrink-0">
        <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
          {event.eventName || "Untitled Event"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 flex-shrink-0">
          {event.description || "No description provided."}
        </p>

        {/* Event Details */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="line-clamp-1 font-medium text-foreground">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="line-clamp-1">{event.location || "No location"}</span>
          </div>
          {event.professor && <p className="text-sm italic text-muted-foreground/70">By {event.professor}</p>}
        </div>

        <div className="flex items-center gap-2 pt-3 mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(event.id); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group/like hover:bg-muted/40"
          >
            <motion.div
              whileTap={{ scale: 1.5 }}
              transition={{ duration: 0.2 }}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  liked
                    ? "text-red-500 fill-red-500"
                    : "text-muted-foreground group-hover/like:text-red-400"
                }`}
              />
            </motion.div>
            <span className={`${liked ? "text-primary font-semibold" : "text-muted-foreground"}`}>{hearts.length}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCommentClick(event); }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-muted/40 transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{comments.length}</span>
          </button>
        </div>

      </CardContent>
    </Card>
    </motion.div>
  )
}

function ExpandedEventCard({ event, onClose, onLike, onComment, currentUser }: { event: EventType, onClose: () => void, onLike: (id: string) => void, onComment: (id: string, text: string) => void, currentUser: any }) { // eslint-disable-line
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<CommentType[]>([])
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null)
  const [openCommentMenu, setOpenCommentMenu] = useState<string | null>(null)
  const [scale, setScale] = useState(1);
  const [fitType, setFitType] = useState<'cover' | 'contain'>('cover');

  const { user } = useAuth() // We can use this or the passed currentUser
  useEffect(() => {
    const q = query(collection(db, "events", event.id, "comments"), orderBy("createdAt", "asc"))
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setComments(arr)
    })
    return () => unsub()
  }, [event.id])

  const hearts = event.hearts ?? []
  const liked = user && user.uid && hearts.includes(user.uid)

  let dateStr = "Invalid Date"
  if (event.startDate && !isNaN(event.startDate.getTime())) dateStr = format(event.startDate, "PPP")

  const modalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleUpdateComment = async () => {
    if (!editingComment || !editingComment.text.trim()) return;
    const { id, text } = editingComment;
    setEditingComment(null); // Exit editing mode immediately for better UX

    const commentRef = doc(db, "events", event.id, "comments", id);
    try {
      await updateDoc(commentRef, { text: text.trim() });
    } catch (error) {
      console.error("Error updating comment: ", error);
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to remove this comment?")) {
      return;
    }
    
    const commentRef = doc(db, "events", event.id, "comments", commentId);
    try {
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment: ", error);
      alert("Failed to remove comment. Please check permissions or try again.");
    }
  }

  const toggleFitType = () => {
    setFitType(prev => prev === 'cover' ? 'contain' : 'cover');
    setScale(1); // Reset zoom when changing fit type
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50"
      >
        <X className="h-8 w-8" />
      </button>
      <motion.div
        layoutId={`card-container-${event.id}`}
        className="w-full max-w-7xl max-h-[90vh] flex flex-col md:flex-row"
      >
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {event.imageUrl ? (
            <>
              <motion.img
                src={event.imageUrl}
                alt={event.eventName || "Event"}
                className={`h-full w-full transition-all duration-300 ${fitType === 'cover' ? 'object-cover' : 'object-contain'}`}
                style={{ scale: scale, cursor: scale > 1 ? 'grab' : 'auto' }}
                whileDrag={{ cursor: 'grabbing' }}
                drag={scale > 1}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              />
              <div className="absolute bottom-4 right-4 flex gap-2 bg-black/30 backdrop-blur-sm rounded-lg p-1">
                <button onClick={toggleFitType} className="p-2 text-white/80 hover:text-white transition-colors">
                  {fitType === 'cover' ? <Eye className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <div className="w-px bg-white/20"></div>
                <button onClick={() => setScale(s => Math.min(s * 1.2, 3))} className="p-2 text-white/80 hover:text-white transition-colors" disabled={fitType === 'contain'}>
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button onClick={() => setScale(s => Math.max(s / 1.2, 1))} disabled={scale <= 1 || fitType === 'contain'} className="p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ZoomOut className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-white/50 text-center p-8">
              <p>No image for this event.</p>
            </div>
          )}
        </div>
        <Card className="bg-white w-full md:w-1/2 flex-1 flex flex-col overflow-hidden rounded-none">
          <div className="flex-1 flex flex-col overflow-y-auto">
            <CardHeader className="p-6 flex-shrink-0">
              <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                {event.eventName || "Untitled Event"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-none">
                {event.description || "No description provided."}
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground pt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="line-clamp-1 font-medium text-foreground">{dateStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="line-clamp-1">{event.location || "No location"}</span>
                </div>
                {event.professor && <p className="text-sm italic text-muted-foreground/70">By {event.professor}</p>}
              </div>
              <div className="flex items-center gap-2 pt-3">
                <button
                  onClick={() => onLike(event.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group/like hover:bg-muted/40"
                >
                  <motion.div whileTap={{ scale: 1.5 }} transition={{ duration: 0.2 }}>
                    <Heart className={`h-4 w-4 transition-colors ${liked ? "text-red-500 fill-red-500" : "text-muted-foreground group-hover/like:text-red-400"}`} />
                  </motion.div>
                  <span className={`${liked ? "text-primary font-semibold" : "text-muted-foreground"}`}>{hearts.length}</span>
                </button>
                <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{comments.length} Comments</span>
                </div>
              </div>
            </CardContent>

            <div className="p-4 space-y-3 border-t border-border-gray-700 flex-1">
            {comments.length > 0 ? (
              comments.map((c) => (
                editingComment?.id === c.id ? (
                  <div key={c.id} className="p-3">
                    <input
                      type="text"
                      value={editingComment.text}
                      onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateComment()}
                    />
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <button onClick={handleUpdateComment} className="font-semibold text-primary hover:underline" disabled={!editingComment.text.trim()}>Save Changes</button>
                      <button onClick={() => setEditingComment(null)} className="text-muted-foreground hover:underline">Cancel</button>
                      <button onClick={() => handleDeleteComment(c.id)} className="ml-auto font-semibold text-destructive hover:underline">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div key={c.id} className="group/comment bg-gray-100 rounded-lg p-3 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{c.authorName}</p>
                      <p className="text-sm text-muted-foreground mt-1">{c.text}</p>
                    </div>
                    {currentUser?.uid === c.authorId && !editingComment && (
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenCommentMenu(openCommentMenu === c.id ? null : c.id); }}
                          className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openCommentMenu === c.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg border z-20 p-1">
                            <button onClick={() => { setEditingComment({ id: c.id, text: c.text }); setOpenCommentMenu(null); }} className="w-full text-left px-3 py-1.5 text-sm text-foreground hover:bg-muted rounded-md">Edit</button>
                            <button onClick={() => { handleDeleteComment(c.id); setOpenCommentMenu(null); }} className="w-full text-left px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md">Remove</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
            )}
          </div>
          </div>

          <div className="p-4 border-t border-border-gray-500 bg-white flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onComment(event.id, comment)
                setComment("")
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
