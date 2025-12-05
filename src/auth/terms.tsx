"use client"
import termsBg from '@/assets/termsbg.jpg';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import React, { useState, useEffect } from "react"
import termsbg from '@/assets/termsbg.jpg';
function Terms() {
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateDate = () => {
      const today = new Date()
      const formattedDate = today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      setCurrentDate(formattedDate)
    }
    updateDate()
    const intervalId = setInterval(updateDate, 1000 * 60 * 60 * 24)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 relative"
      style={{
        backgroundImage: `url(${termsbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <Card className="relative max-w-3xl bg-white/90 backdrop-blur-md text-zinc-900 shadow-2xl border border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-green-700">
            Terms of Use & Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to the <strong>Gordon College Event Feed (GCEF)</strong>.  By using our platform, you agree
            to comply with the following Terms and Conditions & Privacy Policy.
          </p>

          <h2 className="font-semibold">1. Terms of Use</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              Use your official <strong>@gordoncollege.edu.ph</strong> account to login and register. (for student)
            </li>
            <li>
              Use your official <strong>@gcorganizer.edu.ph</strong> account to login and register . (for organizer)
            </li>
            <li>
              Use your official <strong>@gcadmin.edu.ph</strong> account to login and register. (for administrator)
            </li>
            <li>Do not share login credentials with anyone.</li>
            <li>
              The platform is intended solely for official school-related event management and participation.
            </li>
          </ul>

          <h2 className="font-semibold">2. Privacy Policy</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>
              We collect personal data such as your name, email, and usage information solely for managing school events.
            </li>
            <li>Your data is stored securely and used only for official Gordon College purposes.</li>
            <li>
              We do not share or sell your personal information to third parties without your explicit consent.
            </li>
            <li>Activity logs may be monitored to ensure system integrity and compliance with school IT policies.</li>
          </ul>

          <div className="mt-12 text-center text-gray-700 text-sm">
            This Terms and Privacy Policy is updated up to this date:{" "}
            <span className="font-semibold text-green-700">{currentDate}</span>
          </div>

          <div className="flex justify-center mt-8">
            <a
              href="/"
              className="inline-block px-6 py-3 border-2 border-green-600 text-green-700 font-medium rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300"
            >
              Return to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Terms
