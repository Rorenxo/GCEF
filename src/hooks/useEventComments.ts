"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface EventComment {
  id: string
  eventId: string
  text: string
  authorName?: string
  authorEmail?: string
  createdAt: Date
}

export interface EventLike {
  id: string
  eventId: string
  userId: string
  createdAt: Date
}

export function useEventComments(eventId: string | null) {
  const [comments, setComments] = useState<EventComment[]>([])
  const [likes, setLikes] = useState<EventLike[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }

    try {
      const commentsQuery = query(
        collection(db, "eventComments"),
        where("eventId", "==", eventId)
      )

      const unsubscribeComments = onSnapshot(
        commentsQuery,
        (snapshot) => {
          const commentsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as EventComment))
          setComments(commentsData)
        },
        (err) => {
          console.error("Error fetching comments:", err)
          setError(err.message)
        }
      )

      const likesQuery = query(
        collection(db, "eventLikes"),
        where("eventId", "==", eventId)
      )

      const unsubscribeLikes = onSnapshot(
        likesQuery,
        (snapshot) => {
          const likesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as EventLike))
          setLikes(likesData)
          setLoading(false)
        },
        (err) => {
          console.error("Error fetching likes:", err)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => {
        unsubscribeComments()
        unsubscribeLikes()
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }, [eventId])

  return {
    comments,
    likes,
    loading,
    error,
  }
}
