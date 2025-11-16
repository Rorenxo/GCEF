"use client"

import React from "react"
import { Heart, MapPin, Users, Star, Eye } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Link } from "react-router-dom"

interface EventCardProps {
  event: {
    id: string
    eventName: string
    department: string
    location: string
    imageUrl?: string
    startDate?: Date | any
    description?: string
    professor?: string
    likes?: number
    maxParticipants?: number
    comments?: number
    eventType?: string
    speakers?: Array<{ name: string; title?: string }>
  }
  isFavorite: boolean
  onFavorite: () => void
  onView: () => void
  compact?: boolean
}

export default function EventCard({ event, isFavorite, onFavorite, onView, compact = false }: EventCardProps) {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border">
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 bg-muted">
        <img
          src={event.imageUrl || "/placeholder.svg"}
          alt={event.eventName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
          }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 transition-colors"
          aria-label="favorite"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>

        {/* Likes Badge (optional) */}
        {event.likes !== undefined && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-sm font-semibold">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            {event.likes}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-card-foreground line-clamp-2">{event.eventName}</h3>
          <p className="text-sm text-muted-foreground">{event.department}</p>
        </div>

        {!compact && (
          <>
            {/* Event Type Badge */}
            {event.eventType && (
              <div className="inline-block">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {event.eventType}
                </span>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-card-foreground mb-1">Speakers:</p>
                {event.speakers.slice(0, 2).map((speaker, index) => (
                  <p key={index} className="text-xs">
                    {speaker.name} {speaker.title && `- ${speaker.title}`}
                  </p>
                ))}
                {event.speakers.length > 2 && (
                  <p className="text-xs text-primary">+{event.speakers.length - 2} more</p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>{event.likes ?? 0} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span>{event.comments ?? 0} comments</span>
              </div>
              {event.maxParticipants && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{event.maxParticipants} spots</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Link to={`/organizer/events/${event.id}`} className="flex-1">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}