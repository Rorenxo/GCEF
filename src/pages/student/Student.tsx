"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import useAuth from "@/shared/components/useStudentAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Calendar, MapPin, Users, Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";

type EventType = {
  id: string;
  eventName?: string;
  department?: string;
  location?: string;
  startDate?: any;
  professor?: string;
  description?: string;
  imageUrl?: string;
  likes?: string[];
};

type CommentType = {
  id: string;
  authorName: string;
  text: string;
  createdAt: any;
};

const departmentColors: Record<string, string> = {
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
};

const CARD_BG = "bg-white";
const CARD_BORDER = "border-zinc-200";
const DARK_TEXT = "text-zinc-900";
const SECONDARY_TEXT = "text-zinc-600";

export default function StudentFeed() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("startDate", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setEvents(arr);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleLike = async (eventId: string, likes: string[] = []) => {
    if (!user) return alert("Please sign in to like posts");
    const eventRef = doc(db, "events", eventId);
    const alreadyLiked = likes.includes(user.uid);
    await updateDoc(eventRef, {
      likes: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const addComment = async (eventId: string, text: string) => {
    if (!user) return alert("Please sign in to comment");
    if (!text.trim()) return;
    try {
      const commentsRef = collection(db, "events", eventId, "comments");
      await addDoc(commentsRef, {
        authorName: user.displayName || user.email || "Student",
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to post comment.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-cyan-500" />
          <p className="text-sm text-zinc-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-white px-6 py-6">
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3 shadow-sm">
        <h1 className={`text-2xl font-bold ${DARK_TEXT}`}>Campus Feed</h1>
        <p className={SECONDARY_TEXT}>See all events happening at GCEF</p>
      </header>

      <section className="flex-1 overflow-y-auto space-y-6 mt-6">
        {events.length === 0 ? (
          <Card className={`${CARD_BG} ${CARD_BORDER} p-6`}>
            <p className="text-center text-zinc-500">
              No events available yet.
            </p>
          </Card>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onLike={toggleLike}
              onComment={addComment}
              currentUser={user}
            />
          ))
        )}
      </section>
    </main>
  );
}

function EventCard({
  event,
  onLike,
  onComment,
  currentUser,
}: {
  event: EventType;
  onLike: (id: string, likes?: string[]) => void;
  onComment: (id: string, text: string) => void;
  currentUser: any;
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "events", event.id, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setComments(arr);
    });
    return () => unsub();
  }, [event.id]);

  const likes = event.likes ?? [];
  const liked = currentUser && likes.includes(currentUser.uid);
  const deptColor = departmentColors[event.department || ""] || "bg-zinc-400";

  let dateStr = "Invalid Date";
  try {
    const dateValue = event.startDate?.toDate?.() ?? new Date(event.startDate);
    if (!isNaN(dateValue)) dateStr = format(dateValue, "PPP");
  } catch {
    dateStr = "Invalid Date";
  }

  return (
    <Card
      className={`${CARD_BG} ${CARD_BORDER} shadow-sm hover:shadow-md transition-all`}
    >
      <CardHeader className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${deptColor}`} />
          <CardTitle className={`text-base font-semibold ${DARK_TEXT}`}>
            {event.eventName || "Untitled Event"}
          </CardTitle>
        </div>

        <button
          onClick={() => onLike(event.id, likes)}
          className="flex items-center gap-1 text-sm"
        >
          <Heart
            className={`h-5 w-5 ${
              liked ? "text-rose-500 fill-rose-500" : "text-zinc-400"
            }`}
          />
          <span className={`${SECONDARY_TEXT}`}>{likes.length}</span>
        </button>
      </CardHeader>

      <CardContent className="space-y-3">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.eventName || "Event image"}
            className="rounded-md w-full max-h-96 object-cover shadow-sm"
          />
        )}

        <p className={`text-sm leading-relaxed ${SECONDARY_TEXT}`}>
          {event.description || "No description provided."}
        </p>

        <div className={`flex flex-col gap-1 text-sm ${SECONDARY_TEXT}`}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location || "No location"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.department || "Unknown Department"}</span>
          </div>
          {event.professor && (
            <p className="text-xs italic text-zinc-500 mt-1">
              Hosted by {event.professor}
            </p>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1 text-sm text-zinc-500 mb-2">
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length} comments</span>
          </div>

          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-md bg-zinc-100 p-2 shadow-sm"
            >
              <div className="text-sm font-medium text-zinc-800">
                {c.authorName}
              </div>
              <div className="text-sm text-zinc-700">{c.text}</div>
            </div>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onComment(event.id, comment);
              setComment("");
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-cyan-600 text-white rounded-md text-sm hover:bg-cyan-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
