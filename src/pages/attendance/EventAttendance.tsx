"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";

interface AttendanceRecord {
  id: string;
  studentNumber: string;
  studentName: string;
  organizerName: string;
  timestamp: any;
}

export default function EventAttendance() {
  const { eventId } = useParams<{ eventId: string }>();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    if (!eventId) return;
    const fetchEventName = async () => {
      try {
        const eventSnap = await getDoc(doc(db, "events", eventId));
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          setEventName(data.eventName || "");
        }
      } catch (err) {
        console.error("Error fetching event name:", err);
      }
    };

    fetchEventName();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const fetchAttendance = async () => {
      try {
        const attendanceRef = collection(db, "events", eventId, "attendance");
        const snapshot = await getDocs(attendanceRef);

        const records: AttendanceRecord[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // --- Fetch student name from "students" collection ---
            let studentName = "Unknown";
            try {
              const studentQuerySnap = await getDocs(
                collection(db, "students")
              );
              const studentDoc = studentQuerySnap.docs.find(
                (s) => s.data().studentNumber === data.studentNumber
              );
              if (studentDoc) {
                const studentData = studentDoc.data();
                studentName = `${studentData.firstName || ""} ${
                  studentData.lastName || ""
                }`.trim();
              }
            } catch (err) {
              console.error("Error fetching student name:", err);
            }

            // --- Fetch organizer name from "organizers" collection ---
            let organizerName = "Unknown";
            try {
              const orgDoc = await getDoc(doc(db, "organizers", data.organizerId));
              if (orgDoc.exists()) {
                const orgData = orgDoc.data();
                organizerName = orgData.name || orgData.organizerName || data.organizerId;
              }
            } catch (err) {
              console.error("Error fetching organizer name:", err);
            }

            return {
              id: docSnap.id,
              studentNumber: data.studentNumber,
              studentName,
              organizerName,
              timestamp: data.timestamp,
            };
          })
        );

        setAttendance(records);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [eventId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading attendance...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          to="/organizer"
          className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>

        <h1 className="text-2xl font-bold mb-4">
          Attendance for Event: {eventName || eventId}
        </h1>

        {attendance.length === 0 ? (
          <p className="text-gray-600">No attendees yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Student Number</th>
                  <th className="px-4 py-2 text-left">Student Name</th>
                  <th className="px-4 py-2 text-left">Organizer</th>
                  <th className="px-4 py-2 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((att) => (
                  <tr key={att.id} className="border-b">
                    <td className="px-4 py-2">{att.studentNumber}</td>
                    <td className="px-4 py-2">{att.studentName}</td>
                    <td className="px-4 py-2">{att.organizerName}</td>
                    <td className="px-4 py-2">
                      {att.timestamp?.toDate
                        ? att.timestamp.toDate().toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
