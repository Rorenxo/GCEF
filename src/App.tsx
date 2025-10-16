import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/shared/components/ProtectedRoute"
import Login from "@/auth/adminAuth/Login" 
import LandingPage from "@/pages/Landing" 
import OrganizerLogin from "@/auth/organizerAuth/OrgLogin" 
import TermsPage from "@/auth/terms";

import Dashboard from "@/pages/admin/Dashboard"
import CalendarPage from "@/pages/admin/CalendarPage"
import EventsPage from "@/pages/admin/EventsPage"
import PendingOrganizersPage from "@/pages/admin/PendingOrg"
import ApprovedOrganizersHistoryPage from '@/pages/admin/ApproveHistory';
import AddEventPage from "@/pages/admin/AddEventPage"
import AdminLayout from "@/shared/components/layout/adminlayout/Layout" 
import OrganizerLayout from "@/shared/components/layout/organizerlayout/Olayout" 
import OrganizerDashboard from "@/pages/organizer/Dashboard"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/terms" element={<TermsPage />} /> 

        <Route path="/login" element={<Login />} />
        <Route path="/OrgLogin" element={<OrganizerLogin />} />
        
        

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
          <Route path="events" element={<EventsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="add-event" element={<AddEventPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} /> 

        <Route
          path="/organizer" 
          element={
            <ProtectedRoute>
              <OrganizerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrganizerDashboard />} />  
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} /> 
        
      </Routes>

      
    </BrowserRouter>
  )
}

export default App