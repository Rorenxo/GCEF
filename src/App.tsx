

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"
import Login from "@/auth/adminAuth/Login" 
import LandingPage from "@/pages/Landing" 
import OrganizerLogin from "@/auth/organizerAuth/OrgLogin" 


import Dashboard from "@/pages/admin/Dashboard"
import CalendarPage from "@/pages/admin/CalendarPage"
import EventsPage from "@/pages/admin/EventsPage"
import AddEventPage from "@/pages/admin/AddEventPage"
import AdminLayout from "@/shared/components/layout/adminlayout/Layout" 

import TermsPage from "@/auth/terms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/terms" element={<TermsPage />} /> 

        <Route path="/login" element={<Login />} />
        <Route path="/OrgLogin" element={<OrganizerLogin />} />
         {/* <Route path="/student" element={<StudentLogin />} /> */} 

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

        <Route path="*" element={<Navigate to="/" replace />} /> 
        
      </Routes>
    </BrowserRouter>
  )
}

export default App