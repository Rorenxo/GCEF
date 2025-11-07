"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { db, auth } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Calendar, Activity, FileDown } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function StatisticsPage() {
  const analyticsRef = useRef<HTMLDivElement>(null)
  const [dateTime, setDateTime] = useState("")
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventsThisWeek: 0,
    eventsThisMonth: 0,
    chartData: [] as { month: string; events: number }[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    setDateTime(now.toLocaleString())

    const fetchStats = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          console.warn("No user logged in")
          setLoading(false)
          return
        }

        const eventsRef = collection(db, "events")
        const eventsQuery = query(eventsRef, where("createdBy", "==", user.uid))
        const snapshot = await getDocs(eventsQuery)
        const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const currentDate = new Date()
        const currentWeekStart = new Date(currentDate)
        currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const currentMonth = currentDate.getMonth()

        const eventsThisWeek = events.filter((e: any) => {
          const date = e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate)
          return date >= currentWeekStart
        })

        const eventsThisMonth = events.filter((e: any) => {
          const date = e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate)
          return date.getMonth() === currentMonth
        })

        const monthlyCounts: Record<string, number> = {}
        events.forEach((e: any) => {
          const date = e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate)
          const month = date.toLocaleString("default", { month: "short" })
          monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
        })

        const chartData = Object.entries(monthlyCounts).map(([month, count]) => ({
          month,
          events: count,
        }))

        setStats({
          totalEvents: events.length,
          eventsThisWeek: eventsThisWeek.length,
          eventsThisMonth: eventsThisMonth.length,
          chartData,
        })
      } catch (error) {
        console.error("Error fetching organizer stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleDownloadPDF = async () => {
    if (!analyticsRef.current) return
    const canvas = await html2canvas(analyticsRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    })
    const imgData = canvas.toDataURL("image/png", 1.0)
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const xOffset = (pageWidth - imgWidth) / 2
    const yOffset = 25
    pdf.setFontSize(18)
    pdf.text("Organizer Analytics Report", pageWidth / 2, 15, { align: "center" })
    pdf.setFontSize(11)
    pdf.text(`Generated on ${dateTime}`, pageWidth / 2, 22, { align: "center" })
    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight, "", "FAST")
    pdf.save("Organizer_Analytics_Report.pdf", { returnPromise: true })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium text-gray-700">
        Loading statistics...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Analytics Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-1">Overview of your event statistics</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-green-700 transition"
        >
          <FileDown className="w-4 h-4" /> Download Report (PDF)
        </motion.button>
      </div>

      {/* Analytics section */}
      <div ref={analyticsRef} className="space-y-6">
        <motion.h1
          className="text-3xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Organizer Statistics
        </motion.h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<Calendar className="text-green-600" />}
            delay={0.1}
          />
          <StatCard
            title="Events This Week"
            value={stats.eventsThisWeek}
            icon={<Activity className="text-blue-600" />}
            delay={0.2}
          />
          <StatCard
            title="Events This Month"
            value={stats.eventsThisMonth}
            icon={<Activity className="text-purple-600" />}
            delay={0.3}
          />
        </div>

        {/* Chart */}
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Trends</h2>
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="events" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">No data available</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  delay = 0,
}: {
  title: string
  value: number
  icon: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </motion.div>
  )
}
