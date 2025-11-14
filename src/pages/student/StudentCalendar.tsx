"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import type { Event } from "@/types";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import notificationSound from "@/assets/notification.mp3";
import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { isSameDay, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

const departmentColors: Record<string, string> = {
  CCS: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  CEAS: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  CAHS: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  CHTM: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
  CBA: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  ALL: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
};
export default function StudentCalendar() {
  const { events, loading } = useEvents({ scope: "all" })
  const { user } = useAuth()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch saved events for the current student
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "students", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSavedEvents(docSnap.data().savedEvents || []);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Check for upcoming saved events for notifications
  useEffect(() => {
    if (savedEvents.length === 0 || events.length === 0) return;

    const checkUpcomingEvents = () => {
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;

      savedEvents.forEach(eventId => {
        const event = events.find(e => e.id === eventId);
        if (event) {
          const eventTime = event.startDate.getTime();
          // @ts-ignore
          const diff = eventTime - now;

          if (diff > 0 && diff <= oneHour) {
            const notificationKey = `notif-${eventId}`;
            const alreadyNotified = sessionStorage.getItem(notificationKey);

            if (!alreadyNotified) {
              // Play sound and show alert
              const audio = new Audio(notificationSound);
              audio.play().catch(e => console.warn("Audio playback failed.", e));
              alert(`Reminder: "${event.eventName}" starts in less than an hour!`);
              sessionStorage.setItem(notificationKey, "true");
            }
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingEvents, 60000);
    return () => clearInterval(interval);
  }, [savedEvents, events]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalOpen(true);
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
  const toggleSaveEvent = async (eventId: string) => {
    if (!user) {
      alert("You must be logged in to save events.");
      return;
    }

    const userDocRef = doc(db, "students", user.uid);
    const isSaved = savedEvents.includes(eventId);

    await updateDoc(userDocRef, {
      savedEvents: isSaved ? arrayRemove(eventId) : arrayUnion(eventId),
    });
    
    alert(isSaved ? "Event removed from your list." : "Event added to your saved events!");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
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

        <div className="grid grid-cols-7">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-gray-100" />
          ))}
          {days.map((day) => {
            const eventsOnDay = getEventsForDay(day);
            return (
              <div key={day} className="relative p-2 border-r border-b border-gray-100 flex flex-col gap-1 h-36">
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
        <DialogContent className="max-w-2xl p-0 border-none bg-white">
          {selectedEvent && (
            <div>
              <img
                src={selectedEvent.imageUrl || "/placeholder.jpg"}
                alt={selectedEvent.eventName}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-gray-900">{selectedEvent.eventName}</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    {selectedEvent.department} • {selectedEvent.location}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Description</h4>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                  {/* Other details... */}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => toggleSaveEvent(selectedEvent.id)}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    {savedEvents.includes(selectedEvent.id) ? "Unsave Event" : "Save Event"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
