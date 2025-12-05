"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { ChevronLeft, ChevronRight, Calendar, MapPin, User, BookOpen, Users, Eye } from "lucide-react";
import { isSameDay, format } from "date-fns";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import type { Event } from "@/types";

const departmentColors: Record<string, string> = {
  CCS: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  CEAS: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  CAHS: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  CHTM: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
  CBA: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  ALL: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
};

export default function StudentCalendar() {
  const { events, loading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const navigate = useNavigate();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
    const images = (event as any).imageUrls || [];
    if (images.length > 0) {
      setImageUrls(images);
    } else if (event.imageUrl) {
      setImageUrls([event.imageUrl]);
    } else {
      setImageUrls([]);
    }
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust to make Monday the first day (0)
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((event) => isSameDay(event.startDate, date));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Calendar</h1>
          <p className="text-zinc-500">View and manage events by date</p>
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center py-3 text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 min-h-[70vh]">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-gray-100" />
          ))}
          {days.map((day) => {
            const eventsOnDay = getEventsForDay(day);
            return (
              <div key={day} className="relative p-2 border-r border-b border-gray-100 flex flex-col gap-1">
                <span className="font-medium text-gray-700 text-sm">{day}</span>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {eventsOnDay.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`w-full text-left p-1.5 rounded-md text-xs font-medium truncate transition-colors ${
                        departmentColors[event.department] || departmentColors.ALL
                      }`}
                    >
                      {event.eventName}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="p-0 border-none bg-white text-zinc-900 shadow-xl w-full max-w-4xl h-[90vh] flex flex-col md:flex-row overflow-hidden">
          {selectedEvent && (
            <>
              {/* Left Side: Image grid */}
              <div className="w-full md:w-1/2 h-auto md:h-full bg-gray-100 flex-shrink-0 flex flex-col overflow-hidden">
                <div className="relative w-full h-64 md:flex-1">
                  {imageUrls.length > 0 ? (
                    <img src={imageUrls[0]} alt={selectedEvent.eventName} className={`w-full h-full transition-all duration-300 ${isZoomed ? 'object-contain' : 'object-cover'}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">No Image</div>
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
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description || 'N/A'}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <DetailItem icon={Calendar} label="Date & Time" value={`${format(selectedEvent.startDate, "MMM d, yyyy, h:mm a")} to ${format(selectedEvent.endDate, "MMM d, yyyy, h:mm a")}`} />
                    <DetailItem icon={MapPin} label="Location" value={selectedEvent.location} />
                    <DetailItem icon={User} label="Organizer / Professor" value={selectedEvent.professor || selectedEvent.organizerName} subValue={selectedEvent.organizerEmail} />
                    <DetailItem icon={Users} label="Department" value={selectedEvent.department} />
                    <DetailItem icon={BookOpen} label="Event Type" value={selectedEvent.eventType} />
                    <DetailItem icon={Users} label="Max Participants" value={selectedEvent.maxParticipants?.toString()} />
                    
                    {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                      <DetailItem icon={User} label="Speakers" value={selectedEvent.speakers.map(s => s.name).join(', ')} />
                    )}

                    {selectedEvent.registrationLinks && selectedEvent.registrationLinks.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Registration Links</p>
                          <div className="text-sm text-gray-600">
                            <ul className="list-disc pl-5">
                              {selectedEvent.registrationLinks.map((r, idx) => (
                                <li key={idx}><a className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a></li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DetailItem = ({ icon: Icon, label, value, subValue }: { icon: React.ElementType, label: string, value?: string | null, subValue?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-600">{value || 'N/A'}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
};
