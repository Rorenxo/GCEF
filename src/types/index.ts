export type Department = "CCS" | "CEAS" | "CAHS" | "CHTM" | "CBA"

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
  createdAt: Date
  updatedAt: Date
}

export interface EventFormData {
  eventName: string
  startDate: string
  endDate: string
  description: string
  location: string
  professor: string
  department: Department
  image?: File
}

export const DEPARTMENT_COLORS: Record<Department, string> = {
  CCS: "rgb(var(--color-ccs))",
  CEAS: "rgb(var(--color-ceas))",
  CAHS: "rgb(var(--color-cahs))",
  CHTM: "rgb(var(--color-chtm))",
  CBA: "rgb(var(--color-cba))",
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  CCS: "College of Computer Studies",
  CEAS: "College of Education, Arts, and Sciences",
  CAHS: "College of Allied Health Sciences",
  CHTM: "College of Hospitality and Tourism Management",
  CBA: "College of Business Administration",
}
