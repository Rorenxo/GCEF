"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { collectionGroup, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ArrowLeft, CheckCircle, UserCheck } from "lucide-react"
import { format } from "date-fns"

interface AttendanceRecord {
  id: string  
  eventId: string
  eventName: string
  organizerName: string
  timestamp: Date
}

export default function StudentAttendancePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) {
        console.warn("No user found, cannot fetch attendance")
        setLoading(false)
        return
      }

      try {
        // 1. Get student number from student's profile
        const studentDocRef = doc(db, "students", user.uid);
        const studentDocSnap = await getDoc(studentDocRef);

        if (!studentDocSnap.exists()) {
          console.warn("Student profile not found for UID:", user.uid);
          setLoading(false);
          return;
        }

        const studentData = studentDocSnap.data();
        const studentNumber = studentData.studentNumber;

        if (!studentNumber) {
          console.warn("Student number not found in profile for UID:", user.uid);
          setLoading(false);
          return;
        }

        const attendanceQuery = query(
          collectionGroup(db, "attendance"),
          where("studentNumber", "==", studentNumber)
        )
        const querySnapshot = await getDocs(attendanceQuery)

        // 3. Process attendance records
        const records: AttendanceRecord[] = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data()

            // Fetch event name for each record
            let eventName = "Unknown Event"
            try {
              const eventDocRef = doc(db, "events", data.eventId)
              const eventDocSnap = await getDoc(eventDocRef)
              if (eventDocSnap.exists()) {
                eventName = eventDocSnap.data().eventName || "Untitled Event"
              } else {
                console.warn("⚠️ Event document not found for eventId:", data.eventId)
              }
            } catch (e) {
              console.error("❌ Error fetching event name:", e)
            }

            return {
              id: docSnap.id,
              eventId: data.eventId,
              eventName: eventName,
              organizerName: data.organizerName || "Unknown Organizer",
              timestamp: data.timestamp?.toDate() || new Date(),
            }
          })
        )

        records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        setAttendance(records)
      } catch (error) {
        console.error("❌ Error fetching attendance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-1 bg-red-200 hover:bg-red-500 hover:text-white shadow-md" onClick={() => navigate("/student")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">My Attendance</h1>
          </div>
          <p className="text-gray-500 mt-2 ml-16">A record of all events you've attended.</p>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700">No Attendance Records Found</h3>
            <p className="text-gray-500 mt-2">Attend events by having your QR code scanned!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendance.map((record) => (
              <Card key={record.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">{record.eventName}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Attended On</p>
                      <p className="font-semibold text-gray-800">{format(record.timestamp, "PPP p")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <UserCheck className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Checked by</p>
                      <p className="font-semibold text-gray-800">{record.organizerName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}