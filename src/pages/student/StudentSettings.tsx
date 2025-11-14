"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { ArrowLeft, Check } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

interface StudentProfile {
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  email: string
  studentNumber: string
  department: string
  course: string
  yearLevel: string
}

export default function StudentSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      setLoading(true)
      try {
        const docRef = doc(db, "students", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            middleName: data.middleName || "",
            suffix: data.suffix || "",
            email: data.email || "",
            studentNumber: data.studentNumber || "",
            department: data.department || "",
            course: data.course || "",
            yearLevel: data.yearLevel || "",
          })
        } else {
          console.log("No such document!")
        }
      } catch (error) {
        console.error("Error fetching student profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    if (profile) {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          [field]: value,
        }
      })
      setHasChanges(true)
      setSaved(false)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 3000)

    if (user && profile) {
      const docRef = doc(db, "students", user.uid)
      updateDoc(docRef, {
        ...profile,
      }).catch((error) => {
        console.error("Error updating profile:", error)
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-1 bg-red-200 hover:bg-red-500 hover:text-white-600 shadow-md" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-500 mt-2 ml-16">Manage your profile and preferences</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-green-800">Profile updated successfully</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">First Name</label>
              <Input value={profile?.firstName || ""} onChange={(e) => handleInputChange("firstName", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Last Name</label>
              <Input value={profile?.lastName || ""} onChange={(e) => handleInputChange("lastName", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Middle Name</label>
              <Input value={profile?.middleName || ""} onChange={(e) => handleInputChange("middleName", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Suffix</label>
              <Input value={profile?.suffix || ""} onChange={(e) => handleInputChange("suffix", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Department</label>
              <Input value={profile?.department || ""} onChange={(e) => handleInputChange("department", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Course</label>
              <Input value={profile?.course || ""} onChange={(e) => handleInputChange("course", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Year Level</label>
              <Input value={profile?.yearLevel || ""} onChange={(e) => handleInputChange("yearLevel", e.target.value)} className="bg-gray-50 border-gray-300 text-gray-900" />
            </div>
          </div>
          {hasChanges && (
            <div className="mt-8 flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
                Save Changes
              </Button>
              <Button onClick={() => setHasChanges(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
