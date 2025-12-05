"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useNotification } from "@/shared/context/NotificationContext"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Button } from "@/shared/components/ui/button"
import { AlertTriangle, Clock, CalendarCheck, CalendarPlus, ArrowRight, Edit, Trash2 } from "lucide-react"
import { isSameDay, isThisMonth, isWithinInterval, startOfToday, endOfToday, addDays } from "date-fns"
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore"

interface StatCardProps {
  title: string
  value: number
  label: string
  icon: React.ReactNode
  to: string
  colorClass: string
  loading: boolean
}
import { User } from "lucide-react"
interface Event {
  id: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  createdBy?: string;
  location: string;
  department: string;
  professor: string;
  organizerName?: string;
  organizerPhotoURL?: string;
  eventType?: string;
  description: string;
  logisticsStatus?: 'booked' | 'complete' | 'pending';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, label, icon, to, colorClass, loading }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 ${colorClass}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">{title}</h3>
          <p className="text-4xl font-bold text-white">
            {loading ? <span className="animate-pulse">--</span> : value}
          </p>
          <p className="text-xs text-white/90">{label}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-lg">{icon}</div>
      </div>
      <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
    </motion.div>
  </Link>
)


export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [todayEventsCount, setTodayEventsCount] = useState(0)
  const [monthlyEventsCount, setMonthlyEventsCount] = useState(0)
  const [weeklyEventsCount, setWeeklyEventsCount] = useState(0)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [eventStatusData, setEventStatusData] = useState<{ name: string; value: number }[]>([])
  const [departmentTrendData, setDepartmentTrendData] = useState<{ name: string; count: number }[]>([])
  const [timeFilter, setTimeFilter] = useState<"month" | "30days">("month")
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<Event | null>(null)
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const DEPARTMENT_COLORS: Record<string, string> = {
    CCS: "#f97316", CEAS: "#3b82f6", CAHS: "#ef4444",
    CHTM: "#ec4899", CBA: "#f59e0b", ALL: "#6b7280",
  }

  useEffect(() => {
    const pendingQuery = query(collection(db, "pendingOrganizers"), where("status", "==", "pending"))
    const unsubPending = onSnapshot(pendingQuery, (snapshot) => {
      setPendingCount(snapshot.size)
      setEventStatusData(prev => updateStatus(prev, 'Pending', snapshot.size));
    })

    const eventsQuery = query(collection(db, "events"))
    const unsubEvents = onSnapshot(eventsQuery, (snapshot) => {
      const now = new Date()
      const today = startOfToday()
      const next7Days = addDays(endOfToday(), 7)
      const thirtyDaysAgo = addDays(now, -30)

      let todayCount = 0
      let monthCount = 0
      let weekCount = 0
      const weeklyEventsList: Event[] = []
      const statusCounts: Record<string, number> = { Approved: 0, Draft: 0 }
      const deptCounts: Record<string, number> = { CCS: 0, CEAS: 0, CAHS: 0, CHTM: 0, CBA: 0, ALL: 0 }
      const deptCounts30Days: Record<string, number> = { CCS: 0, CEAS: 0, CAHS: 0, CHTM: 0, CBA: 0, ALL: 0 }


      const eventPromises = snapshot.docs.map(async (docSnap) => {
        const event = docSnap.data()
        const startDate = (event.startDate as Timestamp)?.toDate()

        if (startDate) {
          const eventDepartment = event.department || 'ALL';
          const eventStatus = event.status || 'Approved'; 
          statusCounts[eventStatus] = (statusCounts[eventStatus] || 0) + 1;

          if (isSameDay(startDate, now)) {
            todayCount++
          }

          if (isThisMonth(startDate)) {
            monthCount++
          }

  
          if (isThisMonth(startDate) && deptCounts[eventDepartment] !== undefined) {
            deptCounts[eventDepartment]++;
          }

          if (startDate >= thirtyDaysAgo && deptCounts30Days[eventDepartment] !== undefined) {
            deptCounts30Days[eventDepartment]++;
          }
          if (isWithinInterval(startDate, { start: today, end: next7Days })) {
            weekCount++

            let organizerName = event.organizerName || 'Unknown';
            let organizerPhotoURL = event.organizerPhotoURL || '';

            if (event.createdBy) {
              try {
                const orgDocRef = doc(db, "organizers", event.createdBy);
                const orgDocSnap = await getDoc(orgDocRef);
                if (orgDocSnap.exists()) {
                  organizerName = orgDocSnap.data().organizerName || organizerName;
                  organizerPhotoURL = orgDocSnap.data().photoURL || organizerPhotoURL;
                }
              } catch (e) {
                console.error("Failed to fetch organizer details", e);
              }
            }

            weeklyEventsList.push({ 
              id: docSnap.id,
              eventName: event.eventName,
              startDate: startDate,
              endDate: (event.endDate as Timestamp)?.toDate(),
              location: event.location,
              department: event.department,
              professor: event.professor,
              organizerName: organizerName,
              organizerPhotoURL: organizerPhotoURL,
              eventType: event.eventType,
              description: event.description,
              logisticsStatus: Math.random() > 0.5 ? 'booked' : 'pending',
            })
          }
        }
      })
      
      const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

      Promise.all(eventPromises).then(() => {
        const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        setEventStatusData(prev => {
          let updated = [...prev.filter(s => s.name === 'Pending')]; 
          statusChartData.forEach(newStatus => {
            updated = updateStatus(updated, newStatus.name, newStatus.value);
          });
          return updated;
        });

        const deptData = timeFilter === 'month' ? deptCounts : deptCounts30Days;
        setDepartmentTrendData(Object.entries(deptData).map(([name, count]) => ({ name, count })));

        setTodayEventsCount(todayCount)
        setMonthlyEventsCount(monthCount)
        setWeeklyEventsCount(weekCount)
        setUpcomingEvents(weeklyEventsList.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()))
        setLoading(false)
      })
    })

    return () => {
      unsubPending()
      unsubEvents()
    }
  }, [timeFilter])
  
  const updateStatus = (statuses: {name: string, value: number}[], name: string, value: number) => {
    const index = statuses.findIndex(s => s.name === name);
    if (index > -1) {
      statuses[index] = { name, value };
      return [...statuses];
    }
    return [...statuses, { name, value }];
  };

  const handleDeleteEvent = async () => {
    if (!deleteConfirmEvent) return;
    try {
      await deleteDoc(doc(db, "events", deleteConfirmEvent.id));
      addNotification("Event deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting event:", error);
      addNotification("Failed to delete event", "error");
    } finally {
      setDeleteConfirmEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <Link to="/admin/add-event">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
            <CalendarPlus className="mr-2 h-5 w-5" />
            Create New Event
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Approval Queue"
          value={pendingCount}
          label={pendingCount === 1 ? "Pending Approval" : "Pending Approvals"}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          to="/admin/pending-organizers"
          colorClass="bg-gradient-to-br from-red-500 to-red-700"
          loading={loading}
        />
        <StatCard
          title="Upcoming Events  "
          value={todayEventsCount}
          label={`Events Starting Today (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
          icon={<Clock className="h-6 w-6 text-white" />}
          to="/admin/events"
          colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
          loading={loading}
        />
        <StatCard
          title="Open Events"
          value={monthlyEventsCount}
          label="Active or Scheduled this Month"
          icon={<CalendarCheck className="h-6 w-6 text-white" />}
          to="/admin/events"
          colorClass="bg-gradient-to-br from-blue-500 to-blue-700"
          loading={loading}
        />
        <StatCard
          title="Next 7 Days"
          value={weeklyEventsCount}
          label="Events Scheduled Next 7 Days"
          icon={<CalendarPlus className="h-6 w-6 text-white" />}
          to="/admin/calendar"
          colorClass="bg-gradient-to-br from-green-500 to-green-700"
          loading={loading}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Operational Health & Insights</h2>
            <p className="text-gray-500">A high-level view of system momentum.</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
            <Button size="sm" variant={timeFilter === 'month' ? 'default' : 'ghost'} onClick={() => setTimeFilter('month')} className="transition-all">This Month</Button>
            <Button size="sm" variant={timeFilter === '30days' ? 'default' : 'ghost'} onClick={() => setTimeFilter('30days')} className="transition-all">Last 30 Days</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Status Pipeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minHeight={0}>
                <PieChart>
                  <Pie
                    data={eventStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    // @ts-ignore
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {eventStatusData.map((entry, index) => {
                      const colors: Record<string, string> = {
                        'Approved': '#22c55e', 'Pending': '#f97316',
                        'Draft': '#64748b'
                      };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#ccc'} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Department Trends</h3>
                <p className="text-sm text-gray-500">Events created in the selected period.</p>
              </div>
              <Link to="/admin/analytics">
                <Button variant="link" className="text-sm">See Event Creation Trends</Button>
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(200,200,200,0.1)' }} />
                  <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
                    {departmentTrendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Events (Next 7 Days)</h2>
            <p className="text-gray-500">A scannable list focused on logistics.</p>
          </div>
          <Link to="/admin/events">
            <Button variant="link">View All</Button>
          </Link>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          {upcomingEvents.length > 0 ? (
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Event / Organizer</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Start Time</th>
                  <th scope="col" className="px-6 py-3">End Time</th>
                  <th scope="col" className="px-6 py-3">Department / Type</th>
                  <th scope="col" className="px-6 py-3 text-right">Tools</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map(event => (
                  <tr key={event.id} className="bg-white border-b">
                    <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {event.organizerPhotoURL ? (
                          <img src={event.organizerPhotoURL} alt={event.organizerName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold">{event.eventName}</div>
                          <div className="text-xs text-gray-500">by {event.organizerName || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{event.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-4">{event.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                    <td className="px-6 py-4">{event.endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${DEPARTMENT_COLORS[event.department]}20`, color: DEPARTMENT_COLORS[event.department] }}>
                        {event.department === 'ALL' ? event.eventType : event.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => navigate(`/admin/edit-event/${event.id}`)} variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-100 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setDeleteConfirmEvent(event)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-600 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-8">No events scheduled in the next 7 days.</p>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {deleteConfirmEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete the event "{deleteConfirmEvent.eventName}"? This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setDeleteConfirmEvent(null)} className="hover:bg-gray-200">Cancel</Button>
                <Button
                  onClick={() => {
                    if (deleteConfirmEvent) {
                      handleDeleteEvent()
                    }
                  }}
                  className="bg-red-600 text-white hover:bg-red-700"
                >Delete</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}