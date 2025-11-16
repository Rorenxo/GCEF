"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface SuccessNotificationProps {
  message: string
}

export default function SuccessNotification({ message }: SuccessNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-50 grid place-items-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center gap-4 border-t-4 border-green-500 text-center w-full max-w-md">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}>
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </motion.div>
        <p className="text-lg font-semibold text-zinc-800">{message}</p>
      </div>
    </motion.div>
  )
}