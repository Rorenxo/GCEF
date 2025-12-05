"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updateProfile, sendPasswordResetEmail } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { User, Save, Edit, X, Loader2, Camera, Key, CheckCircle } from "lucide-react"
import { uploadImage } from "@/lib/imageUpload"

interface AdminProfile {
  name: string
  email: string
  photoURL?: string
  role: string
}

export default function AdminProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Editable state
  const [name, setName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      setLoading(true)
      try {
        const adminDocRef = doc(db, "admins", user.uid)
        const docSnap = await getDoc(adminDocRef)
        if (docSnap.exists()) {
          const data = docSnap.data() as AdminProfile
          setProfile(data)
          setName(data.name || user.displayName || "")
          setImagePreview(data.photoURL || user.photoURL || null)
        } else {
          const fallbackProfile: AdminProfile = {
            name: user.displayName || "Admin User",
            email: user.email || "",
            photoURL: user.photoURL || "",
            role: "admin",
          }
          setProfile(fallbackProfile)
          setName(fallbackProfile.name)
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error)
        setError("Failed to fetch admin profile.")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
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
        setTimeout(() => setResetEmailSent(false), 5000)
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
      const adminDocRef = doc(db, "admins", user.uid)
      let newPhotoURL = profile?.photoURL

      if (imageFile) {
        newPhotoURL = await uploadImage(imageFile, { folder: `profile_pictures/${user.uid}` })
      }

      const updatedData = { name, photoURL: newPhotoURL }
      await updateDoc(adminDocRef, updatedData)

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name, photoURL: newPhotoURL })
      }

      setProfile((prev) => (prev ? { ...prev, ...updatedData } : null))
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
    return <div className="flex h-screen items-center justify-center">Loading profile...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Admin Profile</h1>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            {isEditing && (
              <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                <Camera className="w-5 h-5" />
                <input id="profile-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Name</span>
            {isEditing ? (
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input w-2/3 rounded-md border-gray-300 text-right" placeholder="Admin Name" />
            ) : (
              <span className="font-bold text-gray-800 text-right">{profile?.name}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-800 text-right">{profile?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Role</span>
            <span className="font-bold text-gray-800 text-right capitalize">{profile?.role}</span>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
          <button onClick={handlePasswordReset} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
            <Key className="w-4 h-4" /> Change Password
          </button>
          {resetEmailSent && (
            <p className="text-sm text-green-600 flex items-center gap-2 mt-2">
              <CheckCircle className="w-4 h-4" /> Password reset link sent!
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          {isEditing ? (
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}