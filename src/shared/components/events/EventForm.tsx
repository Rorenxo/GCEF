"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { Department, EventFormData, Event } from "@/types"
import { Upload, X } from "lucide-react"

// ✅ Add this helper here (was missing)
function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  if (!validTypes.includes(file.type)) return { valid: false, error: "Unsupported file type." }
  if (file.size > 5 * 1024 * 1024) return { valid: false, error: "File must be less than 5MB." }
  return { valid: true }
}

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>
  initialData?: Event
  isLoading?: boolean
}

export default function EventForm({ onSubmit, initialData, isLoading }: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: initialData?.eventName || "",
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "",
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    professor: initialData?.professor || "",
    department: initialData?.department || "CCS",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null)
  const [imageError, setImageError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setImageError(validation.error || "Invalid image file")
        return
      }

      setImageError(null)
      setImageFile(file)

      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const submitData = { ...formData, image: imageFile || undefined }
    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-zinc-200 bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-zinc-900">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-zinc-700">
              Event Name
            </Label>
            <Input
              id="eventName"
              value={formData.eventName}
              onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              required
              className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500"
              placeholder="Annual Tech Conference"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-zinc-700">
                Start Date & Time
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-zinc-700">
                End Date & Time
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-32 border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500"
              placeholder="Describe the event..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-700">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500"
                placeholder="Main Auditorium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor" className="text-zinc-700">
                Professor
              </Label>
              <Input
                id="professor"
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                required
                className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500"
                placeholder="Sir. John Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-zinc-700">
              Department
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
            >
              <SelectTrigger className="border-zinc-300 bg-zinc-50 text-zinc-900">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white">
                <SelectItem value="ALL">ALL DEPARTMENT</SelectItem>
                <SelectItem value="CCS">CCS - College of Computer Studies</SelectItem>
                <SelectItem value="CEAS">CEAS - College of Education, Arts, and Sciences</SelectItem>
                <SelectItem value="CAHS">CAHS - College of Allied Health Studies</SelectItem>
                <SelectItem value="CHTM">CHTM - College of Hospitality Tourism Management</SelectItem>
                <SelectItem value="CBA">CBA - College of Business and Accountancy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-zinc-700">
              Event Image
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Label
                  htmlFor="image"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-200"
                >
                  <Upload className="h-4 w-4" />
                  Choose Image
                </Label>
                {imagePreview && (
                  <div className="relative">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-300">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {imageError && <p className="text-sm text-red-600">{imageError}</p>}
              <p className="text-xs text-zinc-500">Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white hover:bg-green-700">
        {isLoading ? "Saving..." : initialData ? "Update Event" : "Create Event"}
      </Button>
    </form>
  )
}
