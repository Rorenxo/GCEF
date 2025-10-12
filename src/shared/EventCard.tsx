"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import useAuth from "@/shared/components/useStudentAuth";
import { Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";

type EventType = {
  id: string;
  eventName?: string;
  description?: string;
  department?: string;
  location?: string;
  startDate?: any;
  imageUrl?: string | null;
  professor?: string;
  likes?: string[];
};

type CommentType = {
  id?: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt?: any;
};

const departmentColors: Record<string, string> = {
  CCS: "bg-orange-500",
  CEAS: "bg-blue-500",
  CAHS: "bg-red-500",
  CHTM: "bg-pink-500",
  CBA: "bg-yellow-500",
};

export default function EventCard({ event }: { event: EventType }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [likes, setLikes] = useState<string[]>(event.likes ?? []);
  const [liked, setLiked] = useState<boolean>(!!(uid && likes.includes(uid)));
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    setLikes(event.likes ?? []);
    setLiked(!!(uid && (event.likes ?? []).includes(uid)));
  }, [event.likes, uid]);

  useEffect(() => {
    const commentsRef = collection(db, "events", event.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setComments(arr);
    });
    return () => unsub();
  }, [event.id]);

  const toggleLike = async () => {
    if (!user) return alert("Please sign in to like");

    const docRef = doc(db, "events", event.id);
    try {
      if (liked) {
        await updateDoc(docRef, { likes: arrayRemove(user.uid) });
        setLiked(false);
        setLikes((prev) => prev.filter((id) => id !== user.uid));
      } else {
        await updateDoc(docRef, { likes: arrayUnion(user.uid) });
        setLiked(true);
        setLikes((prev) => [...prev, user.uid]);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to comment");
    if (!commentText.trim()) return;

    setSavingComment(true);
    try {
      const commentsRef = collection(db, "events", event.id, "comments");
      await addDoc(commentsRef, {
        authorId: user.uid,
        authorName: user.displayName || user.email || "Student",
        text: commentText.trim(),
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Posting comment failed.");
    } finally {
      setSavingComment(false);
    }
  };

  const dateStr = (() => {
    try {
      const d = event.startDate?.toDate?.() ?? new Date(event.startDate);
      return isNaN(d as any) ? "Unknown date" : format(d, "PPP p");
    } catch {
      return "Unknown date";
    }
  })();

  const deptColor = departmentColors[event.department ?? "CCS"] ?? "bg-zinc-400";

  return (
    <article className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition p-5">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`h-3 w-3 mt-1 rounded-full ${deptColor}`} />
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              {event.eventName || "Untitled Event"}
            </h3>
            <div className="text-xs text-zinc-500">
              {dateStr} • {event.location || "No location"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleLike} className="flex items-center gap-2 text-sm">
            <Heart
              className={`h-5 w-5 ${
                liked ? "text-rose-500 fill-rose-500" : "text-zinc-400"
              }`}
            />
            <span className="text-sm text-zinc-700">{likes.length}</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <MessageCircle className="h-5 w-5" />
            <span>{comments.length}</span>
          </div>
        </div>
      </header>

      {/* IMAGE */}
      {event.imageUrl && (
        <div className="mt-3">
          <img
            src={event.imageUrl}
            alt={event.eventName}
            className="w-full rounded-lg object-cover max-h-64"
          />
        </div>
      )}

      {/* DESCRIPTION */}
      <p className="mt-3 text-sm text-zinc-700 whitespace-pre-wrap">
        {event.description || "No description provided."}
      </p>

      {/* COMMENTS */}
      <div className="mt-4 space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-900">{c.authorName}</div>
              <div className="text-xs text-zinc-500">
                {c.createdAt?.toDate ? format(c.createdAt.toDate(), "PPP p") : ""}
              </div>
            </div>
            <div className="text-sm text-zinc-700 mt-1">{c.text}</div>
          </div>
        ))}
      </div>

      {/* ADD COMMENT */}
      <form
        onSubmit={submitComment}
        className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-200"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="
            flex-1 rounded-lg border border-zinc-300 bg-white text-zinc-900
            px-3 py-2 text-sm placeholder-zinc-500
            focus:outline-none focus:ring-2 focus:ring-cyan-500 transition
          "
        />
        <button
          type="submit"
          disabled={savingComment}
          className="px-3 py-2 bg-cyan-600 text-white rounded-md text-sm hover:bg-cyan-700 disabled:opacity-50 transition"
        >
          {savingComment ? "Posting..." : "Send"}
        </button>
      </form>
    </article>
  );
}
