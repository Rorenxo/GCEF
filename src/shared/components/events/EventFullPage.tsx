import { Button } from "@/shared/components/ui/button"
import { format } from "date-fns"
import { ArrowLeft, Calendar, MapPin, User, Users, BookOpen, Map, Mic } from "lucide-react"
import type { Event } from "@/types"
import { useEventComments } from "@/hooks/useEventComments"

interface EventFullPageProps {
  event: Event
  onBack: () => void
}

export default function EventFullPage({ event, onBack }: EventFullPageProps) {
  const { comments, likes, loading } = useEventComments(event.id)
  const start = event.startDate instanceof Date ? event.startDate : new Date(event.startDate)

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-end">
          <Button onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Event Image */}
          <div className="lg:col-span-1">
            {event.imageUrl && (
              <div className="rounded-xl overflow-hidden h-[800px]">
                <img
                  src={event.imageUrl}
                  alt={event.eventName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Right Side - All Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Event Title & Department */}
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">{event.eventName}</h1>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-100">
                {event.department}
              </div>
            </div>

            {/* Event Details */}
            <div className="grid gap-4 text-zinc-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{format(start, "EEEE, MMMM d, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Professor {event.professor}</span>
              </div>

              {/* EVENT TYPE */}
              {event.eventType && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Type: {event.eventType === "other" ? event.eventTypeCustom : event.eventType}</span>
                </div>
              )}

              {/* MAX PARTICIPANTS */}
              {event.maxParticipants && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Max Capacity: {event.maxParticipants} participants</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-3">About this Event</h2>
              <p className="text-zinc-600 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* SPEAKERS SECTION */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Speakers
                </h3>
                <div className="space-y-2">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-zinc-900">{speaker.name}</p>
                      {speaker.title && <p className="text-zinc-600">{speaker.title}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REGISTRATION LINKS SECTION */}
            {event.registrationLinks && event.registrationLinks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h3 className="font-semibold mb-3">Registration Links</h3>
                <div className="space-y-2">
                  {event.registrationLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-sm"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ATTENDANCE INFO SECTION */}
            {event.attendanceInfo && (event.attendanceInfo.persons?.length || event.attendanceInfo.locations?.length) && (
              <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Attendance Information
                </h3>
                
                {/* Personnel */}
                {event.attendanceInfo.persons && event.attendanceInfo.persons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-zinc-600 font-semibold">Personnel In Attendance:</p>
                    <div className="space-y-1 pl-4">
                      {event.attendanceInfo.persons.map((person, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-zinc-900">{index + 1}. {person.name}</p>
                          {person.role && <p className="text-zinc-600 text-xs">{person.role}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations */}
                {event.attendanceInfo.locations && event.attendanceInfo.locations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-zinc-600 font-semibold">Check-in Locations:</p>
                    <div className="space-y-1 pl-4">
                      {event.attendanceInfo.locations.map((location, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-zinc-900">{index + 1}. {location.name}</p>
                          {location.description && <p className="text-zinc-600 text-xs">{location.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Likes Card */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold mb-2">Event Stats</h3>
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Likes</span>
                <span className="font-medium">{likes.length}</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold mb-4">
                Comments {!loading && `(${comments.length})`}
              </h3>

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-zinc-800 border-t-zinc-400 rounded-full mx-auto" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-zinc-500 py-4">No comments yet</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {comment.authorName || comment.authorEmail || "Anonymous"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <p className="text-zinc-600">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}