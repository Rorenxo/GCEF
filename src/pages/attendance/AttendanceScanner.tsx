"use client";

import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function AttendanceScanner() {
  const { eventId } = useParams();
  const { user } = useAuth(); // Logged-in organizer
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!eventId || !user) return;

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          alert("No camera detected on this device.");
          return;
        }

        const selectedCamera = cameras[0]; // first camera for desktop

        await html5QrCode.start(
          selectedCamera.id,
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            const studentNumber = decodedText.trim();
            setLastScanned(studentNumber);

            try {
              // --- Fetch student name ---
              let studentName = "Unknown";
              const studentsRef = collection(db, "students");
              const q = query(studentsRef, where("studentNumber", "==", studentNumber));
              const studentSnap = await getDocs(q);
              if (!studentSnap.empty) {
                const studentData = studentSnap.docs[0].data();
                studentName = `${studentData.firstName || ""} ${studentData.lastName || ""}`.trim();
              }

              // --- Fetch organizer name ---
              let organizerName = user.uid;
              const orgDoc = await getDoc(doc(db, "organizers", user.uid));
              if (orgDoc.exists()) {
                const orgData = orgDoc.data();
                organizerName = orgData.name || orgData.organizerName || user.uid;
              }

              // --- Save attendance (merge: true prevents permission issues on repeated scans) ---
              await setDoc(
                doc(db, "events", eventId, "attendance", studentNumber),
                {
                  eventId,
                  studentNumber,
                  studentName,
                  organizerId: user.uid,
                  organizerName,
                  timestamp: serverTimestamp(),
                },
                { merge: true }
              );

              setStatusMessage(`Attendance recorded: ${studentName}`);
            } catch (err: any) {
              console.error("Failed to record attendance:", err);
              setStatusMessage(`Error: ${err.message || err}`);
            }
          },
          (errorMessage) => {
            // minor scan errors can be ignored
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
        alert("Failed to access camera. Check permissions.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [eventId, user]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Scan QR for Event: {eventId}</h1>

<button
  onClick={() => window.history.back()}
  className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
>
  ← Back
</button>

      <div
        id="reader"
        style={{
          width: "350px",
          minHeight: "350px",
          background: "#f5f5f5",
          borderRadius: "12px",
        }}
      ></div>

      {lastScanned && (
        <p className="mt-4 text-green-700 font-semibold">
          Last scanned: {lastScanned}
        </p>
      )}

      {statusMessage && (
        <p className="mt-2 text-blue-700 font-medium">{statusMessage}</p>
      )}
    </div>
  );
}
