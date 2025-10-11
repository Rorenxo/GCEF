"use client"

import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut(auth)
    } catch (err: any) {
      setError(err.message || "Failed to sign out")
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
  }
}
