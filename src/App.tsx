import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"
import Login from "@/auth/adminAuth/Login"
import Dashboard from "@/pages/admin/Dashboard"
import CalendarPage from "@/pages/admin/CalendarPage"
import EventsPage from "@/pages/admin/EventsPage"
import AddEventPage from "@/pages/admin/AddEventPage"
import Layout from "@/shared/components/layout/adminlayout/Layout"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="add-event" element={<AddEventPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
