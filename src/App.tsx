import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"
import { ProtectedStudentRoute } from "@/shared/components/ProtectedStudentRoute"

import Login from "@/auth/adminAuth/Login"
import OrganizerLogin from "@/auth/organizerAuth/OrgLogin"
import StudentLogin from "@/auth/studentAuth/StudentLogin"
import LandingPage from "@/pages/Landing"
import TermsPage from "@/auth/terms"

import Dashboard from "@/pages/admin/Dashboard"
import CalendarPage from "@/pages/admin/CalendarPage"
import EventsPage from "@/pages/admin/EventsPage"
import AddEventPage from "@/pages/admin/AddEventPage"
import AdminLayout from "@/shared/components/layout/adminlayout/Layout"

import Student from "@/pages/student/Student"
import StudentLayout from "@/shared/components/layout/studentlayout/studentLayout"

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

        {/* ---------- STUDENT ROUTES ---------- */}
        <Route
          path="/student"
          element={
            <ProtectedStudentRoute>
              <StudentLayout />
            </ProtectedStudentRoute>
          }
        >
          <Route index element={<Student />} />
        </Route>

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
          <Route path="events" element={<EventsPage />} />
          <Route path="add-event" element={<AddEventPage />} />
        </Route>

        {/* ---------- CATCH-ALL ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App