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
import { doc, setDoc, getFirestore, deleteDoc } from "firebase/firestore" // 🆕 Added deleteDoc
import { useNavigate } from "react-router-dom"

const db = getFirestore()
const TOKEN_KEY = "gcef_token"
const TOKEN_EXPIRY_KEY = "gcef_token_expiry"
const TOKEN_DURATION = 60 * 60 * 1000 // 1 hour token

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
      if (user && expiry && Date.now() < Number(expiry)) {
        setUser(user)
      } else {
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const loggedInUser = userCredential.user

      // tokens
      localStorage.setItem(TOKEN_KEY, loggedInUser.uid)
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + TOKEN_DURATION))


      if (email.endsWith("@gcadmin.edu.ph")) {
        navigate("/admin")
      } else if (email.endsWith("@gcorganizer.edu.ph")){
        navigate("/org")
      } else if (email.endsWith("@gordoncollege.edu.ph")) {
        navigate("/student") // for student
      } else {
        setError("Invalid email domain.")
        await firebaseSignOut(auth)
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
        return
      }

      setUser(loggedInUser)
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

      let role = ""
      let collection = ""
      let isOrganizer = false // 🆕 New flag

      if (email.endsWith("@gcadmin.edu.ph")) {
        role = "admin"
        collection = "admins"
      } else if (email.endsWith("@gcorganizer.edu.ph")){
        role = "organizer"
        collection = "organizers"
        isOrganizer = true // 🆕 Set flag
      } else if (email.endsWith("@gordoncollege.edu.ph")) {
        role = "student"
        collection = "students"
      } else {
        throw new Error("Please use your official school email.")
      }
      
      // 🛑 ORGANIZER PENDING LOGIC 🛑
      if (isOrganizer) {
         // Save to a temporary collection and exit. 
         // The Auth user will be created later by an admin.
         await setDoc(doc(db, "pendingOrganizers", email), {
            firstName,
            lastName,
            email,
            password, 
            role,
            createdAt: new Date().toISOString(), // Use ISO string for easy Firestore handling
            status: "pending" 
         })
         
         // Throw a specific error that OrgLogin.tsx can catch and handle
         throw new Error("Your organizer account is pending admin approval. You will be notified when approved.")
      }
      // ⬆️ END ORGANIZER PENDING LOGIC ⬆️


      // ******* EXISTING LOGIC FOR ADMINS AND STUDENTS *******
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const createdUser = userCredential.user

      await updateProfile(createdUser, {
        displayName: `${firstName} ${lastName}`,
      })

      // 🟢 Save to Firestore by role
      await setDoc(doc(db, collection, createdUser.uid), {
        uid: createdUser.uid,
        firstName,
        lastName,
        email,
        role,
        createdAt: new Date()
      })

      setUser(createdUser)

      if (role === "admin") navigate("/admin")
      else if (role === "organizer") navigate("/organizer")
      else if (role === "student") navigate("/student")

      localStorage.setItem(TOKEN_KEY, createdUser.uid)
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + TOKEN_DURATION))

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
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    } catch (err: any) {
      console.error("Sign out failed:", err)
      setError(err.message || "Failed to sign out.")
    }
  }
  
  // 🆕 ADMIN APPROVAL FUNCTIONS 🆕

  interface PendingOrganizer {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
  }

  const approveOrganizer = async (pendingOrg: PendingOrganizer) => {
      try {
          const { email, password, firstName, lastName, role } = pendingOrg;
          
          // 1. Create the Firebase Auth user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const approvedUser = userCredential.user;

          await updateProfile(approvedUser, {
              displayName: `${firstName} ${lastName}`,
          });

          // 2. Save to the active 'organizers' collection
          await setDoc(doc(db, "organizers", approvedUser.uid), {
              uid: approvedUser.uid,
              firstName,
              lastName,
              email,
              role,
              createdAt: pendingOrg.createdAt,
              approvedAt: new Date().toISOString()
          });

          // 3. Delete from the pending collection
          await deleteDoc(doc(db, "pendingOrganizers", email)); 
          
          return true;
      } catch (err: any) {
          console.error("Organizer approval failed:", err);
          throw new Error(err.message || "Failed to approve organizer.");
      }
  };

  const rejectOrganizer = async (email: string) => {
    try {
        await deleteDoc(doc(db, "pendingOrganizers", email)); 
        return true;
    } catch (err: any) {
        console.error("Organizer rejection failed:", err);
        throw new Error(err.message || "Failed to reject organizer.");
    }
  }


  return {
    user,
    loading,
    error,
    setError,
    signIn,
    signUp,
    signOut,
    approveOrganizer, // 🆕 EXPORT NEW FUNCTION
    rejectOrganizer,  // 🆕 EXPORT NEW FUNCTION
  }
}