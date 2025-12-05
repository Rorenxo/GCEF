"use client"

import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface SuccessNotificationProps {
  message: string
}

export default function SuccessNotification({ message }: SuccessNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-2xl border border-green-200"
    >
      <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
      <p className="text-xl font-semibold text-gray-800">{message}</p>
    </motion.div>
  )
}