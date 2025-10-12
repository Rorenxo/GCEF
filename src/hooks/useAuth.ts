"use client"

import { useState, useEffect } from "react"
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User
} from "firebase/auth"
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
      console.error("Login failed:", err)
      setError(err.message || "Failed to sign in.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      if (!email.endsWith("@gordoncollege.edu.ph")) {
        throw new Error("Please use your official gordoncollege.edu.ph email.")
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const createdUser = userCredential.user

      await updateProfile(createdUser, {
        displayName: `${firstName} ${lastName}`,
      })

      setUser({
        ...createdUser,
        displayName: `${firstName} ${lastName}`,
      })
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message || "Failed to create account.")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (err: any) {
      console.error("Sign out failed:", err)
      setError(err.message || "Failed to sign out.")
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }
}
