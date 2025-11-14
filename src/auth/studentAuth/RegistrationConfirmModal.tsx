"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "react-qr-code"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { X, Download } from "lucide-react"

interface RegistrationConfirmModalProps {
  isOpen: boolean
  registeredData: {
    firstName: string
    lastName: string
    email: string
    studentNumber: string
    department: string
    course: string
    yearLevel: string
  } | null
  onConfirm: () => void
  onEdit: () => void
}

export default function RegistrationConfirmModal({
  isOpen,
  registeredData,
  onConfirm,
  onEdit,
}: RegistrationConfirmModalProps) {
  const [copied, setCopied] = useState(false)

  if (!registeredData) return null

  const handleCopyStudentNumber = () => {
    navigator.clipboard.writeText(registeredData.studentNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const svgContainer = document.getElementById("qr-code-container")
    const svg = svgContainer?.querySelector("svg")
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `${registeredData.studentNumber}_QR.png`
      link.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="border-zinc-800 bg-zinc-100/95 relative shadow-2xl">
              <button
                onClick={onEdit}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-200 rounded-lg transition-colors z-10"
                aria-label="close modal"
              >
                <X className="h-5 w-5 text-zinc-600" />
              </button>

              <CardHeader className="space-y-2 text-center pb-4">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Registration Successful! ✓
                </CardTitle>
                <CardDescription className="text-zinc-700">
                  Review your details and save your QR code
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* QR Code Section */}
                <div id="qr-code-container" className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-green-200 shadow-sm">
                  <div id="qr-code-svg" className="mb-4">
                    <QRCode
                      value={registeredData.studentNumber}
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="font-mono text-sm font-bold text-zinc-800 mb-3">
                    {registeredData.studentNumber}
                  </p>
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={handleCopyStudentNumber}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      {copied ? "Copied!" : "Copy ID"}
                    </Button>
                    <Button
                      onClick={handleDownloadQR}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" /> Save QR
                    </Button>
                  </div>
                </div>

                {/* Student Details Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200 space-y-4">
                  <h3 className="font-bold text-lg text-zinc-900 mb-3">
                    Student Information
                  </h3>

                  <div className="space-y-3">
                    {/* Full Name */}
                    <div className="flex justify-between items-center pb-3 border-b border-green-200">
                      <span className="text-sm font-medium text-zinc-600">
                        Full Name
                      </span>
                      <span className="font-semibold text-zinc-900 text-right">
                        {registeredData.firstName} {registeredData.lastName}
                      </span>
                    </div>

                    {/* Email */}
                    <div className="flex justify-between items-center pb-3 border-b border-green-200">
                      <span className="text-sm font-medium text-zinc-600">
                        Email
                      </span>
                      <span className="font-semibold text-zinc-900 text-right text-xs break-all">
                        {registeredData.email}
                      </span>
                    </div>

                    {/* Department & Year Level */}
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-green-200">
                      <div>
                        <p className="text-xs text-zinc-600 mb-1">Department</p>
                        <p className="font-bold text-green-700">
                          {registeredData.department}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 mb-1">Year Level</p>
                        <p className="font-bold text-green-700">
                          {registeredData.yearLevel}
                        </p>
                      </div>
                    </div>

                    {/* Course */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-zinc-600">
                        Course
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {registeredData.course}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={onConfirm}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all"
                  >
                    Confirmed, Go to Login
                  </Button>
                  <Button
                    onClick={onEdit}
                    variant="outline"
                    className="w-full border-2 border-zinc-400 text-zinc-700 font-semibold py-2 rounded-lg hover:bg-zinc-100 transition-all"
                  >
                    Edit Details
                  </Button>
                </div>

                <p className="text-center text-xs text-zinc-500 pt-2">
                  💡 Save your QR code for easy event check-ins
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}