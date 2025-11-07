"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { format } from "date-fns"
import { useEventComments } from "@/hooks/useEventComments"

interface EventModalProps {
  event: any
  onClose: () => void
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { likes, comments, loading } = useEventComments(event?.id || null)

  if (!event) return null

  const startDate =
    event.startDate && event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate || Date.now())

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-primary/20"> {/* Added subtle primary border for color pop */}
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-card-foreground">{event.eventName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="close">
            <X className="h-6 w-6 text-primary" /> {/* Made close icon primary-colored */}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="w-full h-64 overflow-hidden rounded-lg bg-muted">
            <img src={event.imageUrl || "/placeholder.svg"} alt={event.eventName} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {format(startDate, "PPP p")}
              </div>
              <div>
                <Button variant="ghost" onClick={() => setIsFavorite((v) => !v)} className="hover:bg-primary/10 text-primary"> {/* Added primary hover for color */}
                  {isFavorite ? "Unfavorite" : "Favorite"}
                </Button>
              </div>
            </div>

            <p className="text-card-foreground">{event.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-muted-foreground">Location</h4>
                <div className="font-medium text-primary">{event.location}</div> {/* Made location text primary-colored */}
              </div>
              <div>
                <h4 className="text-xs text-muted-foreground">Professor</h4>
                <div className="font-medium text-primary">{event.professor}</div> {/* Made professor text primary-colored */}
              </div>
            </div>

            {/* Likes & Comments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded border border-primary/20 p-3 bg-primary/5"> {/* Added primary border and background for color */}
                <div className="text-sm text-muted-foreground">Likes</div>
                <div className="text-xl font-semibold text-primary">{likes?.length ?? 0}</div> {/* Made likes count primary-colored */}
              </div>

              <div className="rounded border border-primary/20 p-3 max-h-48 overflow-auto bg-primary/5"> {/* Added primary border and background for color */}
                <div className="text-sm text-muted-foreground mb-2">Comments {loading ? "…" : `(${comments.length})`}</div>
                {!loading && comments.length === 0 && <div className="text-xs text-muted-foreground">No comments yet.</div>}
                {!loading &&
                  comments.map((c: any) => (
                    <div key={c.id} className="mb-3">
                      <div className="text-sm font-medium text-primary">{c.authorName || c.authorEmail || "Student"}</div> {/* Made author primary-colored */}
                      <div className="text-xs text-muted-foreground">{format(new Date(c.createdAt), "PPP p")}</div>
                      <div className="text-card-foreground">{c.text}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}