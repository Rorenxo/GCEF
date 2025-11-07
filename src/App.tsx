import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"

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
import AdminLayout from "@/shared/components/layout/adminlayout/Layout"

// ---------- ORGANIZER ----------
import OrganizerLayout from "@/shared/components/layout/organizerlayout/Olayout"
import OrganizerDashboard from "@/pages/organizer/home"
import EventDetails from "@/pages/organizer/EventDetails"
import StatisticsPage from "@/pages/organizer/orgstats"
import OrgEventPage from "@/pages/organizer/addEvent"


// ---------- STUDENT ----------
import StudentLayout from "@/shared/components/layout/studentLayout/studentLayout"
import StudentFeed from "@/pages/student/Student"
import StudentDashboard from "@/pages/student/StudentDashboard"
import StudentCalendar from "@/pages/student/StudentCalendar"
import StudentEvents from "@/pages/student/StudentEvents"
import StudentMessages from "@/pages/student/StudentMEssages"
import StudentSettings from "@/pages/student/StudentSettings"

function App() {
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
        <Route path="/organizer/:organizerId/events/:eventId" element={<EventDetails />} />

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
          {/* Default feed */}
          <Route index element={<StudentFeed />} />
          {/* Dashboard */}
          <Route path="dashboard" element={<StudentDashboard />} />
          {/* Calendar */}
          <Route path="calendar" element={<StudentCalendar />} />
          {/* My Events */}
          <Route path="events" element={<StudentEvents />} />
          {/* Messages */}
          <Route path="messages" element={<StudentMessages />} />
          {/* Settings */}
          <Route path="settings" element={<StudentSettings />} />
        </Route>

        {/* ---------- CATCH ALL ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App