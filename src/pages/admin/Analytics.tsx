"use client"

import { addDays, startOfDay } from "date-fns"
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
  Sector,
  Cell,
} from "recharts"
import { collection, onSnapshot, query, where, Timestamp, getDocs } from "firebase/firestore"
import { Button } from "@/shared/components/ui/button"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { CreditCard, Users, Calendar, FileDown, ArrowDown, ArrowUp } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

type StudentDoc = {
  id?: string
  name?: string
  department?: string
  createdAt?: Timestamp
  [k: string]: any
}

type EventDoc = {
  id?: string
  eventName?: string
  department?: string
  organizerId?: string
  createdAt?: Timestamp
  [k: string]: any
}

type OrganizerDoc = {
  id?: string
  name?: string
  [k: string]: any
  createdAt?: Timestamp
}

const SummaryCard: React.FC<{
  title: string
  value: number | string
  icon?: React.ReactNode
  change?: number
  changeLabel?: string
  className?: string
}> = ({ title, value, icon, change, changeLabel, className = "" }) => (
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
      {change !== undefined && changeLabel && (
        <div className="flex items-center text-xs text-zinc-500 mt-1">
          {change > 0 ? (
            <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
          ) : change < 0 ? (
            <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
          ) : null}
          <span className={cn(change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "")}>
            {change > 0 ? "+" : ""}{change}
          </span>
          <span className="ml-1">{changeLabel}</span>
        </div>
      )}
    </div>
    <div className="text-zinc-500">{icon}</div>
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

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 6) * cos
  const sy = cy + (outerRadius + 6) * sin
  const mx = cx + (outerRadius + 20) * cos
  const my = cy + (outerRadius + 20) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 18
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  )
}
const DEFAULT_COLORS = Object.values(DEPARTMENT_COLORS)

export default function Dashboard() {
  const [students, setStudents] = useState<StudentDoc[]>([])
  const [events, setEvents] = useState<EventDoc[]>([])
  const [organizers, setOrganizers] = useState<OrganizerDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "all">("30d")
  const [activePieIndex, setActivePieIndex] = useState(0)

  const [studentStats, setStudentStats] = useState({ total: 0, change: 0 })
  const [eventStats, setEventStats] = useState({ total: 0, change: 0 })
  const [organizerStats, setOrganizerStats] = useState({ total: 0, change: 0 })


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

    const getQuery = (collectionName: string) => {
      if (timeFilter === "all") {
        return collection(db, collectionName)
      }
      const days = timeFilter === "7d" ? 7 : 30
      const startDate = startOfDay(addDays(new Date(), -days))
      return query(collection(db, collectionName), where("createdAt", ">=", Timestamp.fromDate(startDate)))
    }

    const getPrevQuery = (collectionName: string) => {
      if (timeFilter === "all") return null
      const days = timeFilter === "7d" ? 7 : 30
      const startDate = startOfDay(addDays(new Date(), -days * 2))
      const endDate = startOfDay(addDays(new Date(), -days))
      return query(collection(db, collectionName), where("createdAt", ">=", Timestamp.fromDate(startDate)), where("createdAt", "<", Timestamp.fromDate(endDate)))
    }

    const createSubscription = (
      collectionName: string,
      setData: React.Dispatch<React.SetStateAction<any[]>>,
      setStats: React.Dispatch<React.SetStateAction<{ total: number; change: number }>>
    ) => {
      const q = getQuery(collectionName)
      const unsub = onSnapshot(q, async (snap) => {
        const currentData = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setData(currentData)

        const prevQ = getPrevQuery(collectionName)
        let prevCount = 0
        if (prevQ) {
          const prevSnap = await getDocs(prevQ)
          prevCount = prevSnap.size
        }
        
        setStats({ total: snap.size, change: snap.size - prevCount })
      })
      return unsub
    }

    const unsubStudents = createSubscription("students", setStudents, setStudentStats)
    const unsubEvents = createSubscription("events", setEvents, setEventStats)
    const unsubOrganizers = createSubscription("organizers", setOrganizers, setOrganizerStats)

    const t = setTimeout(() => setLoading(false), 800)

    return () => {
      unsubStudents()
      unsubEvents()
      unsubOrganizers()
      clearTimeout(t)
    }
  }, [timeFilter])


  const timeFilterLabel = timeFilter === "7d" ? "last 7 days" : timeFilter === "30d" ? "last 30 days" : ""

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
    const org = organizers.find((o: any) => o.id === organizerUid )
    const fullName = org
      ? `${org.firstName ?? ""} ${org.lastName ?? ""}`.trim() || org.email
      : `Unknown Organizer`
    return { organizerUid, name: fullName, count, photoURL: org?.photoURL }
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
        <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
          <Button size="sm" variant={timeFilter === '7d' ? 'default' : 'ghost'} onClick={() => setTimeFilter('7d')} className="transition-all">Last 7 Days</Button>
          <Button size="sm" variant={timeFilter === '30d' ? 'default' : 'ghost'} onClick={() => setTimeFilter('30d')} className="transition-all">Last 30 Days</Button>
          <Button size="sm" variant={timeFilter === 'all' ? 'default' : 'ghost'} onClick={() => setTimeFilter('all')} className="transition-all">All Time</Button>
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
            value={loading ? "…" : studentStats.total}
            icon={<Users className="h-6 w-6 text-zinc-400" />}
            change={studentStats.change}
            changeLabel={timeFilterLabel}
          />
          <SummaryCard
            title="Total Events"
            value={loading ? "…" : eventStats.total}
            icon={<Calendar className="h-6 w-6 text-zinc-400" />}
            change={eventStats.change}
            changeLabel={timeFilterLabel}
          />
          <SummaryCard
            title="Total Organizers"
            value={loading ? "…" : organizerStats.total}
            icon={<CreditCard className="h-6 w-6 text-zinc-400" />}
            change={organizerStats.change}
            changeLabel={timeFilterLabel}
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
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} activeBar={{ fillOpacity: 0.8 }}>
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
                    <Tooltip />
                    <Pie
  {...({
    activeIndex: activePieIndex,
    activeShape: renderActiveShape,
    data: topOrganizersPie,
    dataKey: "value",
    nameKey: "name",
    innerRadius: 62,
    outerRadius: 90,
    paddingAngle: 4,
    onMouseEnter: (_, index) => setActivePieIndex(index),
  } as any)}
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
                            className="h-10 w-10 flex items-center justify-center rounded-md text-white font-semibold overflow-hidden"
                            style={{
                              background:
                                DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                            }}
                          >
                            {o.photoURL ? (
                              <img src={o.photoURL} alt={o.name} className="w-full h-full object-cover" />
                            ) : (
                              o.name?.slice(0, 2).toUpperCase()
                            )}
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
