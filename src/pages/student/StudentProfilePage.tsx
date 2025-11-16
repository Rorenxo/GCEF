"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import QRCode from "react-qr-code"
import { Button } from "@/shared/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

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

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 bg-red-200 hover:bg-red-500 hover:text-white-600 shadow-md"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-6 w-5" />
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">Student Profile</h1>
          </div>
          <p className="text-gray-500 mt-2 ml-16">View your student profile information.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 sticky top-8 shadow-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {`${profile?.firstName || ''} ${profile?.middleName ? `${profile.middleName.charAt(0)}. ` : ''}${profile?.lastName || ''}${profile?.suffix ? `, ${profile.suffix}` : ''}`}
                </h2>
                <p className="text-green-600 text-sm font-semibold mt-2">{profile?.email}</p>
              </div>
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <QRCode value={profile?.studentNumber || ""} size={200} level="H" />
                </div>
              </div>
              <p className="text-center text-gray-500 font-mono text-sm mb-6">{profile?.studentNumber}</p>
              <Link to="/student/settings" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-9 shadow-sm">
              {/* Personal Information Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <ProfileDetail label="First Name" value={profile?.firstName} />
                  <ProfileDetail label="Last Name" value={profile?.lastName} />
                  <ProfileDetail label="Middle Name" value={profile?.middleName} />
                  <ProfileDetail label="Suffix" value={profile?.suffix} />
                </div>
              </div>

              {/* Academic Information Section */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:col-span-2"> 
                    <ProfileDetail label="Student Number" value={profile?.studentNumber} />
                    <ProfileDetail label="Email" value={profile?.email} />
                  </div>
                  <ProfileDetail label="Department" value={profile?.department} />
                  <ProfileDetail label="Course" value={profile?.course} />
                  <ProfileDetail label="Year Level" value={profile?.yearLevel} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <label className="block text-gray-500 text-xs font-medium mb-1">{label}</label>
      <p className="text-gray-900 font-bold text-base">{value || "N/A"}</p>
    </div>
  );
}
