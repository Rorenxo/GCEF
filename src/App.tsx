import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"
import { useEventReminders } from "@/hooks/useEventReminders"

// ---------- PUBLIC PAGES ----------
import Login from "@/auth/adminAuth/Login"
import OrganizerLogin from "@/auth/organizerAuth/OrgLogin"
import TermsPage from "@/auth/terms"
import LandingPage from "@/pages/Landing"
import StudentLogin from "@/auth/studentAuth/studentLogin"

// ---------- ADMIN ----------
import Dashboard from "@/pages/admin/Dashboard"
import CalendarPage from "@/pages/admin/CalendarPage"
import EventsPage from "@/pages/admin/EventsPage"
import PendingOrganizersPage from "@/pages/admin/PendingOrg"
import ApprovedOrganizersHistoryPage from "@/pages/admin/ApproveHistory"
import AddEventPage from "@/pages/admin/AddEventPage"
import AnalyticsPage from "@/pages/admin/Analytics"
import AdminEditEventPage from "@/pages/admin/EditEventPage"
import AdminLayout from "@/shared/components/layout/adminlayout/Layout"

// ---------- ORGANIZER ----------
import EventAttendance from "@/pages/attendance/EventAttendance";
import AttendanceScanner from "@/pages/attendance/AttendanceScanner";
import OrganizerLayout from "@/shared/components/layout/organizerlayout/Olayout"
import OrganizerDashboard from "@/pages/organizer/home"
import EventDetails from "@/pages/organizer/EventDetails"
import StatisticsPage from "@/pages/organizer/orgstats"
import OrgEventPage from "@/pages/organizer/addEvent"
import EditEventPage from "@/pages/organizer/EditEventPage"
import OrganizerProfile from "@/pages/organizer/OrganizerProfile"

// ---------- STUDENT ----------
import StudentLayout from "@/shared/components/layout/studentLayout/studentLayout"
import StudentFeed from "@/pages/student/Student"
import StudentDashboard from "@/pages/student/StudentDashboard"
import StudentCalendar from "@/pages/student/StudentCalendar"
import StudentEvents from "@/pages/student/StudentEvents"
import StudentMessages from "@/pages/student/StudentMEssages"
import StudentSettings from "@/pages/student/StudentSettings"
import StudentProfilePage from "@/pages/student/StudentProfilePage"
import StudentAttendancePage from "@/pages/student/StudentAttendance"
import SavedEventsPage from "@/pages/student/SavedEvents"


function App() {
  // Set up event reminders
  useEventReminders()

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/OrgLogin" element={<OrganizerLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />

        {/* ---------- ADMIN ROUTES ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="pending-organizers" element={<PendingOrganizersPage />} />
          <Route path="organizers/history" element={<ApprovedOrganizersHistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="add-event" element={<AddEventPage />} />
          <Route path="edit-event/:eventId" element={<AdminEditEventPage />} />
        </Route>

        {/* ---------- ORGANIZER ROUTES ---------- */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute>
              <OrganizerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrganizerDashboard />} />
          <Route path="add-event" element={<OrgEventPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="edit-event/:eventId" element={<EditEventPage />} />
          <Route path=":organizerId/events/:eventId" element={<EventDetails />} />
          <Route path="attendance/:eventId" element={<EventAttendance />} />
          <Route path="scan/:eventId" element={<AttendanceScanner />} />
          <Route path="profile" element={<OrganizerProfile />} />
        </Route>

        {/* ---------- STUDENT ROUTES ---------- */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentFeed />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="calendar" element={<StudentCalendar />} />
          <Route path="events" element={<StudentEvents />} />
          <Route path="messages" element={<StudentMessages />} />
          <Route path="settings" element={<StudentSettings />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="saved" element={<SavedEventsPage />} />
        </Route>

        {/* ---------- CATCH ALL ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
