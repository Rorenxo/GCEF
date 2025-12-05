export type Department = |"ALL"| "CCS" | "CEAS" | "CAHS" | "CHTM" | "CBA" 

export interface Event {
  id: string
  eventName: string
  startDate: Date
  endDate: Date
  description: string
  location: string
  professor: string
  department: Department
  imageUrl?: string
  imageUrls?: string[]
  organizerName?: string
  organizerEmail?: string
  likes?: number
  comments?: number
  createdAt: Date
  updatedAt: Date
  // Optional extended fields used across the app
  eventType?: string | null
  eventTypeCustom?: string | null
  maxParticipants?: number | null
  speakers?: Array<{
    name: string
    title?: string
  }>
  registrationLinks?: Array<{
    title: string
    url: string
  }>
  attendanceInfo?: {
    persons?: Array<{ name: string; role?: string }>
    locations?: Array<{ name: string; description?: string }>
  }
}

export interface EventFormData {
  eventName: string
  startDate: string
  endDate: string
  description: string
  location: string
  professor: string
  department: Department
  // Single-file compatibility (legacy)
  image?: File
  // Prefer multiple images for event posters/banners
  images?: File[]
  // Optional extended fields for richer event forms
  eventType?: string | null
  eventTypeCustom?: string | null
  maxParticipants?: number | null
  speakers?: Array<{ name: string; title?: string }> 
  registrationLinks?: Array<{ title: string; url: string }>
  attendanceInfo?: { persons?: Array<{ name: string; role?: string }>; locations?: Array<{ name: string; description?: string }> }
}

export const DEPARTMENT_COLORS: Record<Department, string> = {
  ALL : "rgb(var(--color-alldepartments))",
  CCS: "rgb(var(--color-ccs))",
  CEAS: "rgb(var(--color-ceas))",
  CAHS: "rgb(var(--color-cahs))",
  CHTM: "rgb(var(--color-chtm))",
  CBA: "rgb(var(--color-cba))",
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  ALL : "All Departments",
  CCS: "College of Computer Studies",
  CEAS: "College of Education, Arts, and Sciences",
  CAHS: "College of Allied Health Sciences",
  CHTM: "College of Hospitality and Tourism Management",
  CBA: "College of Business Administration",
}