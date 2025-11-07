"use client"

import React, { useEffect, useMemo, useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { CreditCard, Users, Calendar, FileDown } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

type StudentDoc = {
  id?: string
  name?: string
  department?: string
  [k: string]: any
}

type EventDoc = {
  id?: string
  eventName?: string
  department?: string
  organizerId?: string
  [k: string]: any
}

type OrganizerDoc = {
  id?: string
  name?: string
  [k: string]: any
}

const SummaryCard: React.FC<{
  title: string
  value: number | string
  icon?: React.ReactNode
  className?: string
}> = ({ title, value, icon, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className={cn(
      "rounded-2xl p-4 shadow-sm border bg-white flex items-center justify-between",
      className
    )}
  >
    <div>
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
    <div className="ml-4 text-zinc-500">{icon}</div>
  </motion.div>
)

const DEPARTMENT_COLORS: Record<string, string> = {
  CCS: "#f97316",
  CEAS: "#3b82f6",
  CAHS: "#ef4444",
  CHTM: "#ec4899",
  CBA: "#f59e0b",
  ALL: "#9ca3af",
}

const DEFAULT_COLORS = Object.values(DEPARTMENT_COLORS)

export default function Dashboard() {
  const [students, setStudents] = useState<StudentDoc[]>([])
  const [events, setEvents] = useState<EventDoc[]>([])
  const [organizers, setOrganizers] = useState<OrganizerDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [dateTime, setDateTime] = useState<string>("")
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      setDateTime(formatted)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

useEffect(() => {
  setLoading(true)
  const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
    const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as StudentDoc) }))
    setStudents(arr)
  })

  const unsubEvents = onSnapshot(collection(db, "events"), (snap) => {
    const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as EventDoc) }))
    setEvents(arr)
  })

  const unsubOrganizers = onSnapshot(collection(db, "organizers"), (snap) => {
    const arr = snap.docs.map((d) => {
      const data = d.data() as OrganizerDoc
      return { id: d.id, uid: data.uid ?? d.id, ...data }
    })
    setOrganizers(arr)
  })

  const t = setTimeout(() => setLoading(false), 600)
  return () => {
    unsubStudents()
    unsubEvents()
    unsubOrganizers()
    clearTimeout(t)
  }
}, [])



  const totalStudents = students.length
  const totalEvents = events.length
  const totalOrganizers = organizers.length

  const eventsPerDepartment = useMemo(() => {
    const map = new Map<string, number>()
    events.forEach((ev) => {
      const dept = ev.department ?? "Unknown"
      map.set(dept, (map.get(dept) ?? 0) + 1)
    })
    const arr = Array.from(map.entries()).map(([department, count]) => ({
      department,
      count,
    }))
    arr.sort((a, b) => b.count - a.count)
    return arr
  }, [events])

const organizerActivity = useMemo(() => {
  const map = new Map<string, number>()

  events.forEach((ev) => {
    if (ev.createdBy) {
      map.set(ev.createdBy, (map.get(ev.createdBy) ?? 0) + 1)
    }
  })

  const arr = Array.from(map.entries()).map(([organizerUid, count]) => {
    const org = organizers.find((o: any) => o.uid === organizerUid )
    const fullName = org
      ? `${org.firstName ?? ""} ${org.lastName ?? ""}`.trim() || org.email
      : `Unknown Organizer`
    return { organizerUid, name: fullName, count }
  })

  arr.sort((a, b) => b.count - a.count)

  return arr
}, [events, organizers])

const topOrganizersPie = useMemo(() => {
  if (organizerActivity.length === 0)
    return [{ name: "No data", value: 0 }]

  const top = organizerActivity.slice(0, 5)
  const others = organizerActivity.slice(5).reduce((s, x) => s + x.count, 0)
  const data = top.map((t) => ({ name: t.name, value: t.count }))

  if (others > 0) data.push({ name: "Others", value: others })
  return data
}, [organizerActivity])

  const deptChartData = useMemo(() => {
    if (eventsPerDepartment.length === 0)
      return [{ department: "No data", count: 0 }]
    return eventsPerDepartment.map((d) => ({
      department: d.department,
      count: d.count,
    }))
  }, [eventsPerDepartment])

  // 🧾 PDF Download
  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    })

    const imgData = canvas.toDataURL("image/png", 1.0)
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.setFontSize(16)
    pdf.text("Analytics Dashboard Report", pageWidth / 2, 12, { align: "center" })
    pdf.setFontSize(10)
    pdf.text(`Generated on ${dateTime}`, pageWidth / 2, 18, { align: "center" })

    pdf.setFontSize(11)
    pdf.text("Generated by The Administrator", pageWidth / 2, pageHeight - 10, {
      align: "center",
    })

    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const xOffset = (pageWidth - imgWidth) / 2
    const yOffset = 25
    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight, "", "FAST")

    pdf.save("GCEF_Analytics_Report.pdf")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Analytics Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-1">{dateTime}</p>
          <p className="text-sm text-zinc-500 mt-1">
            Overview of students, events, and organizers
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPDF}
          className="no-print flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-green-700 transition"
        >
          <FileDown className="w-4 h-4" /> Download Report (PDF)
        </motion.button>
      </div>

      <div ref={dashboardRef} id="dashboard-export" className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3">
          <SummaryCard
            title="Total Students"
            value={loading ? "…" : totalStudents}
            icon={<Users className="h-6 w-6 text-zinc-400" />}
          />
          <SummaryCard
            title="Total Events"
            value={loading ? "…" : totalEvents}
            icon={<Calendar className="h-6 w-6 text-zinc-400" />}
          />
          <SummaryCard
            title="Total Organizers"
            value={loading ? "…" : totalOrganizers}
            icon={<CreditCard className="h-6 w-6 text-zinc-400" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Events per Department */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Events per Department</h3>
              <div className="text-xs text-zinc-500">By department</div>
            </div>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {deptChartData.map((entry: any, idx: number) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={
                          DEPARTMENT_COLORS[entry.department] ||
                          DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Most Active Organizer */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Most Active Organizer</h3>
              <div className="text-xs text-zinc-500">
                Ranked by number of created events
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div style={{ width: 240, height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topOrganizersPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={4}
                      label={(entry: any) =>
                        entry.value > 0 ? `${entry.name} (${entry.value})` : ""
                      }
                    >
                      {topOrganizersPie.map((entry, index) => (
                        <Cell
                          key={`slice-${index}`}
                          fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 min-w-0">
                <div className="space-y-3">
                  {organizerActivity.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No organizers or event data yet.
                    </p>
                  ) : (
                    organizerActivity.slice(0, 6).map((o, idx) => (
                      <div
                        key={o.organizerUid}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 flex items-center justify-center rounded-md text-white font-semibold"
                            style={{
                              background:
                                DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                            }}
                          >
                            {o.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate mb-1.5">
                              {o.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              Total Events: {o.count}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm text-zinc-700">
                          #{idx + 1}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
        
      <style >{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
