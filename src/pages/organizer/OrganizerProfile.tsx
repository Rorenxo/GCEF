"use client"

import { useState, useEffect, Fragment } from "react"
import { doc, getDoc, updateDoc, collection, query, where, Timestamp, onSnapshot } from "firebase/firestore"
import { updateProfile, User as FirebaseUser, sendPasswordResetEmail } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { User, Mail, Save, Edit, X, Loader2, Building, Camera, Key, History, CheckCircle } from "lucide-react"
import { uploadImage } from "@/lib/imageUpload"

interface OrganizerData {
  firstName: string
  lastName: string
  organizerName: string
  photoURL?: string
  email: string
  role: string
}

interface RecentEvent {
  id: string
  eventName: string
  createdAt: string
}
interface ActivityStats {
  lastLogin: string | null
  eventsThisWeek: number
  recentEvents: RecentEvent[]
}

export default function OrganizerProfile() {
  const { user } = useAuth()
  const [organizerData, setOrganizerData] = useState<OrganizerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [organizerName, setOrganizerName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [authProfile, setAuthProfile] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setAuthProfile(user)

    const fetchOrganizerData = async () => {
      try {
        setLoading(true)
        const organizerDocRef = doc(db, "organizers", user.uid)
        const docSnap = await getDoc(organizerDocRef)

        if (docSnap.exists()) {
          const data = docSnap.data() as OrganizerData
          setOrganizerData(data)
          setFirstName(data.firstName)
          setLastName(data.lastName)
          setOrganizerName(data.organizerName)
          setImagePreview(data.photoURL || null)
        } else {
          setError("Organizer profile not found.")
        }
      } catch (err) {
        setError("Failed to fetch organizer data.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const setupActivityListener = () => {
      // Last Login
      const lastLoginTime = user.metadata.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleString()
        : "N/A"

      // Real-time listener for Recent Activity
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo)

      const eventsRef = collection(db, "events")
      const q = query(
        eventsRef,
        where("createdBy", "==", user.uid),
        where("createdAt", ">=", oneWeekAgoTimestamp),
      )

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsThisWeek = querySnapshot.size
        const recentEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          eventName: doc.data().eventName,
          createdAt: doc.data().createdAt
            ? doc.data().createdAt.toDate().toLocaleDateString()
            : "No date",
        }))

        setActivityStats({
          lastLogin: lastLoginTime,
          eventsThisWeek: eventsThisWeek,
          recentEvents: recentEvents,
        })
      })

      return unsubscribe
    }

    fetchOrganizerData()
    const unsubscribeActivity = setupActivityListener()

    return () => {
      if (unsubscribeActivity) {
        unsubscribeActivity()
      }
    }
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) {
      alert("Could not send password reset. User email not found.")
      return
    }
    if (confirm("Are you sure you want to send a password reset link to your email?")) {
      try {
        await sendPasswordResetEmail(auth, user.email)
        setResetEmailSent(true)
        setTimeout(() => setResetEmailSent(false), 5000) // Hide message after 5s
      } catch (error) {
        alert("Failed to send password reset email. Please try again later.")
        console.error("Password reset error:", error)
      }
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    try {
      const organizerDocRef = doc(db, "organizers", user.uid)
      const newDisplayName = `${firstName} ${lastName}`

      let newPhotoURL = organizerData?.photoURL

      if (imageFile) {
        newPhotoURL = await uploadImage(imageFile, { folder: `profile_pictures/${user.uid}` })
      }

      // Update Firestore document
      await updateDoc(organizerDocRef, {
        firstName,
        lastName,
        organizerName,
        photoURL: newPhotoURL,
      })

      // Update Firebase Auth profile's displayName
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName, photoURL: newPhotoURL })
      }

      setOrganizerData((prev) => (prev ? { ...prev, firstName, lastName, organizerName, photoURL: newPhotoURL } : null))
      setOrganizerData((prev) => {
        if (!prev) return null
        return {
          ...prev,
          firstName,
          lastName,
          organizerName,
          photoURL: newPhotoURL,
        }
      })
      setAuthProfile(auth.currentUser) // Refresh auth profile state
      setImageFile(null)
      setIsEditing(false)
    } catch (err) {
      setError("Failed to update profile.")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Profile</h1>
      
      {/* Profile Picture Section */}
      <div className="max-w-2xl mx-auto flex justify-center mb-6">
        <div className="relative">
          {imagePreview ? (
            <img src={imagePreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
          {isEditing && (
            <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-transform duration-200 hover:scale-110">
              <Camera className="w-5 h-5" />
              <input
                id="profile-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Name and Role Section */}
      <div className="text-center mb-8">
        {isEditing ? (
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-input w-full rounded-md border-gray-300 text-center text-2xl font-bold" placeholder="First Name" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-input w-full rounded-md border-gray-300 text-center text-2xl font-bold" placeholder="Last Name" />
          </div>
        ) : (
          <h2 className="text-3xl font-bold text-gray-900">{organizerData?.firstName} {organizerData?.lastName}</h2>
        )}
        <p className="text-lg text-gray-500 capitalize mt-1">{organizerData?.role}</p>
      </div>

      {/* Details Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="space-y-5">
          {/* --- Club/Org Name --- */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Club/Org Name</span>
            {isEditing ? (
              <input type="text" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} className="form-input w-2/3 rounded-md border-gray-300 text-right" placeholder="Organizer Name" />
            ) : (
              <span className="font-bold text-gray-800 text-right">{organizerData?.organizerName}</span>
            )}
          </div>
          {/* --- Email --- */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-800 text-right">{organizerData?.email}</span>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
        <div className="space-y-4">
          <button
            onClick={handlePasswordReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            <Key className="w-4 h-4" /> Change Password
          </button>
          {resetEmailSent && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Password reset link sent to your email!
            </p>
          )}
        </div>
      </div>

      {/* Activity Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Logs & Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-2"><History className="w-4 h-4" /> Last Login</span>
            <span className="font-medium text-gray-800">{activityStats?.lastLogin}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Events Created (This Week)</span>
            <span className="font-medium text-gray-800">{activityStats?.eventsThisWeek} events created this week</span>
          </div>
          {activityStats && activityStats.recentEvents.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recently Created Events:</h4>
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {activityStats.recentEvents.map(event => (
                  <li key={event.id} className="text-xs p-2 bg-gray-50 rounded-md flex justify-between">
                    <span className="font-medium text-gray-800">{event.eventName}</span>
                    <span className="text-gray-500">{event.createdAt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto mt-6 flex justify-end">
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button onClick={() => {
                setIsEditing(false)
                setImageFile(null)
                setImagePreview(organizerData?.photoURL || authProfile?.photoURL || null)
              }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>
    </div>
  )
}