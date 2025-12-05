"use client"

import { useState, useEffect, Fragment } from "react"
import { Link, useNavigate } from "react-router-dom"
import QRCode from "react-qr-code"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updateProfile, User as FirebaseUser } from "firebase/auth"
import { db, auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { User, Save, Edit, X, Loader2, Camera, Settings, UserCheck, QrCode } from "lucide-react"
import { uploadImage } from "@/lib/imageUpload"

interface StudentProfile {
  firstName: string
  lastName: string
  email: string
  photoURL?: string
  studentNumber: string
  department: string
  course: string
  yearLevel: string
  role: string
  suffix?: string
}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Editable state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [suffix, setSuffix] = useState("")
  const [department, setDepartment] = useState("")
  const [course, setCourse] = useState("")
  const [yearLevel, setYearLevel] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      setLoading(true)
      try {
        const studentDocRef = doc(db, "students", user.uid)
        const docSnap = await getDoc(studentDocRef)
        if (docSnap.exists()) {
          const data = docSnap.data() as StudentProfile
          setProfile(data)
          setFirstName(data.firstName)
          setLastName(data.lastName)
          setSuffix(data.suffix || "")
          setDepartment(data.department)
          setCourse(data.course)
          setYearLevel(data.yearLevel)
          setImagePreview(data.photoURL || null)
        } else {
          setError("Student profile not found.")
        }
      } catch (error) {
        console.error("Error fetching student profile:", error)
        setError("Failed to fetch student profile.")
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

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    try {
      const studentDocRef = doc(db, "students", user.uid)
      const newDisplayName = `${firstName} ${lastName} ${suffix}`.trim()

      let newPhotoURL = profile?.photoURL

      if (imageFile) {
        newPhotoURL = await uploadImage(imageFile, { folder: `profile_pictures/${user.uid}` })
      }

      // Update Firestore document
      const updatedData = {
        firstName,
        lastName,
        suffix,
        department,
        course,
        yearLevel,
        photoURL: newPhotoURL,
      }
      await updateDoc(studentDocRef, updatedData)

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newDisplayName, photoURL: newPhotoURL })
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
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        Loading profile...
      </div>
    )
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
              <input id="profile-upload" type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
      </div>

      {/* Name and Role Section */}
      <div className="text-center mb-8">
        {isEditing ? (
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-input w-2/5 rounded-md border-gray-300 text-center text-2xl font-bold" placeholder="First Name" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-input w-2/5 rounded-md border-gray-300 text-center text-2xl font-bold" placeholder="Last Name" />
            <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} className="form-input w-1/5 rounded-md border-gray-300 text-center text-2xl font-bold" placeholder="Suffix" />
          </div>
        ) : (
          <h2 className="text-3xl font-bold text-gray-900">{`${profile?.firstName} ${profile?.lastName} ${profile?.suffix || ''}`.trim()}</h2>
        )}
        <p className="text-lg text-gray-500 capitalize mt-1">{profile?.role}</p>
      </div>

      {/* Details Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Student Number</span>
            <span className="font-bold text-gray-800 text-right">{profile?.studentNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-800 text-right">{profile?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Department</span>
            {isEditing ? (
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="form-input w-2/3 rounded-md border-gray-300 text-right" placeholder="Department" />
            ) : (
              <span className="font-bold text-gray-800 text-right">{profile?.department}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Course</span>
            {isEditing ? (
              <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="form-input w-2/3 rounded-md border-gray-300 text-right" placeholder="Course" />
            ) : (
              <span className="font-bold text-gray-800 text-right">{profile?.course}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Year Level</span>
            {isEditing ? (
              <input type="text" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className="form-input w-2/3 rounded-md border-gray-300 text-right" placeholder="Year Level" />
            ) : (
              <span className="font-bold text-gray-800 text-right">{profile?.yearLevel}</span>
            )}
          </div>
        </div>
      </div>

      {/* QR Code & Attendance Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Tools</h3>
          <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
            <QrCode className="w-4 h-4" /> {showQR ? "Hide" : "Show"} QR Code
          </button>
        </div>
        {showQR && (
          <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <QRCode value={profile?.studentNumber || ""} size={160} level="H" />
            </div>
            <p className="text-center text-gray-600 font-mono text-sm">{profile?.studentNumber}</p>
            <p className="text-xs text-gray-500 text-center">Present this QR code for event attendance scanning.</p>
          </div>
        )}
        <div className="mt-4">
          <Link to="/student/attendance">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              <UserCheck className="w-4 h-4" /> View My Attendance
            </button>
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto mt-6 flex justify-end">
        {isEditing ? (
          <div className="flex justify-end gap-4">
            <button onClick={() => {
                setIsEditing(false)
                setImageFile(null)
                // Reset form fields to original data
                if (profile) {
                  setFirstName(profile.firstName)
                  setLastName(profile.lastName)
                  setSuffix(profile.suffix || "")
                  setDepartment(profile.department)
                  setCourse(profile.course)
                  setYearLevel(profile.yearLevel)
                  setImagePreview(profile.photoURL || null)
                }
              }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>
    </div>
  )
}
