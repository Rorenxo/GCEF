"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, type FormEvent } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { Department, EventFormData, Event } from "@/types"
import { Loader2, Upload, X } from "lucide-react"

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
  const safeFormatISO = (date: string | Date | undefined) => {
    if (!date) return ""
    const d = typeof date === 'string' ? new Date(date) : date
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const [formData, setFormData] = useState<EventFormData>({
    eventName: initialData?.eventName || "",
    startDate: safeFormatISO(initialData?.startDate),
    endDate: safeFormatISO(initialData?.endDate),
    description: initialData?.description || "",
    location: initialData?.location || "",
    professor: initialData?.professor || "",
    department: initialData?.department || "CCS",
    eventType: initialData?.eventType || "Conference",
    eventTypeCustom: initialData?.eventTypeCustom || "",
    speakers: initialData?.speakers || [],
    maxParticipants: initialData?.maxParticipants || undefined,
    registrationLinks: initialData?.registrationLinks || [],
    attendanceInfo: initialData?.attendanceInfo || { persons: [], locations: [] },
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.imageUrl ? [initialData.imageUrl] : [])
  const [imageError, setImageError] = useState<string | null>(null)
  const [newSpeaker, setNewSpeaker] = useState({ name: "", title: "" })
  const [newRegistrationLink, setNewRegistrationLink] = useState({ title: "", url: "" })
  const [newAttendancePerson, setNewAttendancePerson] = useState({ name: "", role: "" })
  const [newAttendanceLocation, setNewAttendanceLocation] = useState({ name: "", description: "" })

  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData | 'eventTypeCustom' | 'speakers' | 'registrationLinks' | 'attendanceInfo', string>>>({})
  const [showErrorCard, setShowErrorCard] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // limit total images to 6
    const MAX_IMAGES = 6
    const nextFiles = [...imageFiles]

    for (const file of files) {
      if (nextFiles.length >= MAX_IMAGES) {
        setImageError(`Maximum ${MAX_IMAGES} images allowed.`)
        break
      }
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setImageError(validation.error || "Invalid image file")
        continue
      }

      nextFiles.push(file)

      // generate preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    }

    setImageFiles(nextFiles)
    if (!imageError) setImageError(null)
    // reset the input value so the same file can be selected again if needed
    e.currentTarget.value = ""
  }

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageError(null)
  }

  const handleAddSpeaker = () => {
    if (newSpeaker.name.trim()) {
      setFormData({
        ...formData,
        speakers: [...(formData.speakers || []), { name: newSpeaker.name, title: newSpeaker.title || undefined }],
      })
      setNewSpeaker({ name: "", title: "" })
    }
  }

  const handleRemoveSpeaker = (index: number) => {
    setFormData({
      ...formData,
      speakers: formData.speakers?.filter((_, i) => i !== index) || [],
    })
  }

  const handleAddRegistrationLink = () => {
    if (newRegistrationLink.title.trim() && newRegistrationLink.url.trim()) {
      setFormData({
        ...formData,
        registrationLinks: [...(formData.registrationLinks || []), { ...newRegistrationLink }],
      })
      setNewRegistrationLink({ title: "", url: "" })
    }
  }

  const handleRemoveRegistrationLink = (index: number) => {
    setFormData({
      ...formData,
      registrationLinks: formData.registrationLinks?.filter((_, i) => i !== index) || [],
    })
  }

  const handleAddAttendancePerson = () => {
    if (newAttendancePerson.name.trim()) {
      setFormData({
        ...formData,
        attendanceInfo: {
          ...formData.attendanceInfo,
          persons: [...(formData.attendanceInfo?.persons || []), { name: newAttendancePerson.name, role: newAttendancePerson.role || undefined }],
        },
      })
      setNewAttendancePerson({ name: "", role: "" })
    }
  }

  const handleRemoveAttendancePerson = (index: number) => {
    setFormData({
      ...formData,
      attendanceInfo: {
        ...formData.attendanceInfo,
        persons: formData.attendanceInfo?.persons?.filter((_, i) => i !== index) || [],
      },
    })
  }

  const handleAddAttendanceLocation = () => {
    if (newAttendanceLocation.name.trim()) {
      setFormData({
        ...formData,
        attendanceInfo: {
          ...formData.attendanceInfo,
          locations: [...(formData.attendanceInfo?.locations || []), { name: newAttendanceLocation.name, description: newAttendanceLocation.description || undefined }],
        },
      })
      setNewAttendanceLocation({ name: "", description: "" })
    }
  }

  const handleRemoveAttendanceLocation = (index: number) => {
    setFormData({
      ...formData,
      attendanceInfo: {
        ...formData.attendanceInfo,
        locations: formData.attendanceInfo?.locations?.filter((_, i) => i !== index) || [],
      },
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Only allow submission from final step (2)
    if (step !== 2) {
      return
    }

    const isStep1Valid = validateStep(1)
    const isStep2Valid = validateStep(2)

    if (!isStep1Valid || !isStep2Valid) {
      if (!isStep1Valid) setStep(1)
      else if (!isStep2Valid) setStep(2)
      return 
    }

    // Show preview modal instead of using window.confirm
    setShowPreviewModal(true)
  }

  const handleConfirmSubmit = async () => {
    const submitData: EventFormData = {
      ...formData,
      // include images array when available (preferred)
      images: imageFiles.length ? imageFiles : undefined,
      // fallback single-image compatibility: use first image if present
      image: imageFiles.length ? imageFiles[0] : undefined,
    }
    // Close modal while submitting but keep a retry path on error
    setShowPreviewModal(false)
    try {
      // Helpful debug log for developer console
      // eslint-disable-next-line no-console
      console.log("EventForm: confirming submit payload:", submitData)
      await onSubmit(submitData)
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("EventForm: submit failed:", err)
      // show user-friendly error and reopen preview so user can retry
      alert(err?.message || "Failed to submit event. Please try again.")
      setShowPreviewModal(true)
    }
  }

  const validateStep = (currentStep: number) => {
    const newErrors: typeof errors = {}
    let isValid = true

    if (currentStep === 1) {
      if (!formData.eventName.trim()) {
        newErrors.eventName = "Event name is required."
        isValid = false
      }
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required."
        isValid = false
      }
      if (!formData.endDate) {
        newErrors.endDate = "End date is required."
        isValid = false
      }
      if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date."
        isValid = false
      }
      if (!formData.location.trim()) {
        newErrors.location = "Location is required."
        isValid = false
      }
      if (formData.eventType === 'other' && !formData.eventTypeCustom?.trim()) {
        newErrors.eventTypeCustom = "Please specify the custom event type."
        isValid = false
      }
    }

    if (currentStep === 2) {
      if (!formData.professor.trim()) {
        newErrors.professor = "Organizer/Professor-in-charge is required."
        isValid = false
      }
      if (formData.speakers && formData.speakers.length > 0 && formData.speakers.some(s => !s.name.trim())) {
        newErrors.speakers = "All speaker names must be filled out."
        isValid = false
      }
    }

    // Step 3 has no required fields - all are optional

    if (!isValid) {
      setErrors(newErrors)
      setShowErrorCard(true)
      setTimeout(() => {
        setShowErrorCard(false)
      }, 3000)
    } else {
      setErrors({})
    }

    return isValid
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      <AnimatePresence>
        {showErrorCard && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-red-600 text-white font-semibold rounded-lg shadow-2xl p-4">
              Please fill out all required fields.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Step Indicator */}
      <div>
        <div className="flex justify-between mb-2">
          <h3 className="text-lg font-bold text-green-800">
            Step {step}: {step === 1 ? "Event Information" : "Details & Attendance"}
          </h3>
          <span className="text-sm font-semibold text-green-600">{step} of 2</span>
        </div>
        <div className="flex w-full gap-1.5">
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-green-600' : 'bg-gray-200'} w-1/2`}></div>
          <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'} w-1/2`}></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {step === 1 && (
        <Card className="border-zinc-200 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-700">Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eventName" className="text-zinc-700">Event Name</Label>
              <Input id="eventName" value={formData.eventName} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} required className={`border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 ${errors.eventName ? 'border-red-500' : ''}`} placeholder="Hackathon" />
              {errors.eventName && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.eventName}</motion.p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-zinc-700">Start Date & Time</Label>
                <Input id="startDate" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required className={`border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 ${errors.startDate ? 'border-red-500' : ''}`} />
                {errors.startDate && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.startDate}</motion.p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-zinc-700">End Date & Time</Label>
                <Input id="endDate" type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required className={`border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 ${errors.endDate ? 'border-red-500' : ''}`} />
                {errors.endDate && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.endDate}</motion.p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-700">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`min-h-32 border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500`} placeholder="Describe the event...  " />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-zinc-700">Location</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className={`border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 ${errors.location ? 'border-red-500' : ''}`} placeholder="Gc Main Bldg." />
              {errors.location && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.location}</motion.p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-zinc-700">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value as Department })}>
                <SelectTrigger className="border-zinc-300 bg-zinc-50 text-zinc-900"><SelectValue placeholder="Select Department" /></SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="eventType" className="text-zinc-700">Event Type (Optional)</Label>
              <Select value={formData.eventType || "Conference"} onValueChange={(value) => setFormData({ ...formData, eventType: value as any })}>
                <SelectTrigger className="border-zinc-300 bg-zinc-50 text-zinc-900"><SelectValue placeholder="Select Event Type" /></SelectTrigger>
                <SelectContent position="popper" side="bottom" className="border-zinc-200 bg-white">
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Activities">Activities</SelectItem>
                  <SelectItem value="Exhibition">Exhibition</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Hackathon">Hackathon</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {formData.eventType === "other" && (
                <Input value={formData.eventTypeCustom || ""} onChange={(e) => setFormData({ ...formData, eventTypeCustom: e.target.value })} placeholder="Please specify your event type" className={`border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 ${errors.eventTypeCustom ? 'border-red-500' : ''}`} />
              )}
              {errors.eventTypeCustom && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.eventTypeCustom}</motion.p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-zinc-700">Event Image</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Input id="image" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  <Label htmlFor="image" className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-200">
                    <Upload className="h-4 w-4" /> Choose Image
                  </Label>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-300">
                          <img src={src || "/placeholder.svg"} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {imageError && <p className="text-sm text-red-600">{imageError}</p>}
                <p className="text-xs text-zinc-500">Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

          {step === 2 && (
        <div className="space-y-6">
          <Card className="border-zinc-200 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-700">Speakers & Organizers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="professor" className="text-zinc-700">Organizer</Label>
                <Input id="professor" value={formData.professor} onChange={(e) => setFormData({ ...formData, professor: e.target.value })} required className={`border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500 ${errors.professor ? 'border-red-500' : ''}`} placeholder="Organizer" />
                {errors.professor && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.professor}</motion.p>}
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-700">Add Speakers (Optional)</Label>
                <div className="flex gap-2">
                  <Input value={newSpeaker.name} onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Enter speaker name" />
                  <Input value={newSpeaker.title || ""} onChange={(e) => setNewSpeaker({ ...newSpeaker, title: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Title/Role (optional)" />
                  <Button type="button" onClick={handleAddSpeaker} className="bg-blue-600 text-white hover:bg-blue-700">Add</Button>
                </div>
              </div>
              {formData.speakers && formData.speakers.length > 0 && (
                <>
                <div className="space-y-2">
                  <Label className="text-zinc-700">Added Speakers</Label>
                  <div className="space-y-2">
                    {formData.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-center justify-between bg-zinc-100 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-zinc-900">{speaker.name}</p>
                          {speaker.title && <p className="text-sm text-zinc-600">{speaker.title}</p>}
                        </div>
                        <button type="button" onClick={() => handleRemoveSpeaker(index)} className="text-red-600 hover:text-red-700"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                {errors.speakers && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">{errors.speakers}</motion.p>}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-green-700">Registration & Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-zinc-700">Maximum Participants / Capacity (Optional)</Label>
                <Input id="maxParticipants" type="number" min="0" value={formData.maxParticipants || ""} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="e.g., 500" />
              </div>
              <div className="space-y-4">
                <Label className="text-zinc-700">Registration Links (Optional)</Label>
                <div className="flex gap-2">
                  <Input value={newRegistrationLink.title} onChange={(e) => setNewRegistrationLink({ ...newRegistrationLink, title: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Link Title (e.g., 'Register Here')" />
                  <Input value={newRegistrationLink.url} onChange={(e) => setNewRegistrationLink({ ...newRegistrationLink, url: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="URL" />
                  <Button type="button" onClick={handleAddRegistrationLink} className="bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap">Add</Button>
                </div>
                {formData.registrationLinks && formData.registrationLinks.length > 0 && (
                  <div className="space-y-2">
                    {formData.registrationLinks.map((link, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50  p-3 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <p className="font-medium text-zinc-900">{link.title}</p>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">{link.url}</a>
                        </div>
                        <button type="button" onClick={() => handleRemoveRegistrationLink(index)} className="text-red-600 hover:text-red-700 ml-2"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <Label className="text-zinc-700">Attendance Personnel (Optional)</Label>
                <div className="flex gap-2">
                  <Input value={newAttendancePerson.name} onChange={(e) => setNewAttendancePerson({ ...newAttendancePerson, name: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Person name" />
                  <Input value={newAttendancePerson.role || ""} onChange={(e) => setNewAttendancePerson({ ...newAttendancePerson, role: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Role (e.g., 'Coordinator')" />
                  <Button type="button" onClick={handleAddAttendancePerson} className="bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap">Add </Button>
                </div>

                {formData.attendanceInfo?.persons && formData.attendanceInfo.persons.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-zinc-700 font-semibold">Personnel In Attendance:</Label>
                    <div className="space-y-2">
                      {formData.attendanceInfo.persons.map((person, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex-1">
                            <p className="font-medium text-zinc-900">{index + 1}. {person.name}</p>
                            {person.role && <p className="text-sm text-zinc-600">{person.role}</p>}
                          </div>
                          <button type="button" onClick={() => handleRemoveAttendancePerson(index)} className="text-red-600 hover:text-red-700 ml-2">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.attendanceInfo && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">
                    {errors.attendanceInfo}
                  </motion.p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-700">Attendance Locations (Optional)</Label>
                <div className="flex gap-2">
                  <Input value={newAttendanceLocation.name} onChange={(e) => setNewAttendanceLocation({ ...newAttendanceLocation, name: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Location name" />
                  <Input value={newAttendanceLocation.description || ""} onChange={(e) => setNewAttendanceLocation({ ...newAttendanceLocation, description: e.target.value })} className="border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-500 focus:border-blue-500" placeholder="Details (optional)" />
                  <Button type="button" onClick={handleAddAttendanceLocation} className="bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap">Add</Button>
                </div>

                {formData.attendanceInfo?.locations && formData.attendanceInfo.locations.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-zinc-700 font-semibold">Check-in Locations:</Label>
                    <div className="space-y-2">
                      {formData.attendanceInfo.locations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex-1">
                            <p className="font-medium text-zinc-900">{index + 1}. {location.name}</p>
                            {location.description && <p className="text-sm text-zinc-600">{location.description}</p>}
                          </div>
                          <button type="button" onClick={() => handleRemoveAttendanceLocation(index)} className="text-red-600 hover:text-red-700 ml-2">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button type="button" onClick={() => setStep(step - 1)}  className="bg-red-600 text-white hover:bg-red-700" >Back</Button>
        ) : <div></div>}

        {step < 2 ? (
          <Button type="button" onClick={handleNextStep} className="bg-green-600 text-white hover:bg-green-700">Next</Button>
        ) : (
          <Button type="submit" disabled={isLoading} className="bg-green-600 text-white hover:bg-green-700 min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? "Update Event" : "Create Event"}
          </Button>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Preview Event Details</h2>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                {/* Event Image */}
                {imagePreviews.length > 0 && (
                  <div className="rounded-xl overflow-hidden h-72 bg-gray-100 shadow-inner">
                    {imagePreviews.length === 1 ? (
                      <img src={imagePreviews[0]} alt="Event preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="grid grid-cols-2 gap-2 h-full">
                        {imagePreviews.map((src, idx) => (
                          <img key={idx} src={src} alt={`Preview ${idx + 1}`} className="w-full h-36 object-cover rounded-md" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Event Information */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900">{formData.eventName}</h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <DetailItem label="Department" value={formData.department} />
                    <DetailItem label="Location" value={formData.location} />
                    <DetailItem label="Start Date" value={new Date(formData.startDate).toLocaleString()} />
                    <DetailItem label="End Date" value={new Date(formData.endDate).toLocaleString()} />
                    {formData.eventType && <DetailItem label="Event Type" value={formData.eventType === 'other' ? formData.eventTypeCustom : formData.eventType} />}
                    {formData.maxParticipants && <DetailItem label="Max Capacity" value={`${formData.maxParticipants} participants`} />}
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.description || "No description provided."}</p>
                </div>

                {/* Organizer & Speakers */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Organizer & Speakers</h3>
                  <DetailItem label="Organizer" value={formData.professor} />
                  
                  {formData.speakers && formData.speakers.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Speakers</p>
                      <ul className="mt-2 space-y-2">
                        {formData.speakers.map((speaker, idx) => (
                          <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                            <span className="font-semibold">{speaker.name}</span> {speaker.title && <span className="text-gray-500">- {speaker.title}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Registration Links */}
                {formData.registrationLinks && formData.registrationLinks.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Registration Links</h3>
                    <ul className="space-y-2">
                      {formData.registrationLinks.map((link, idx) => (
                        <li key={idx} className="text-sm">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Attendance Information */}
                {formData.attendanceInfo && (formData.attendanceInfo.persons?.length || formData.attendanceInfo.locations?.length) && (
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Attendance Information</h3>
                    {formData.attendanceInfo.persons && formData.attendanceInfo.persons.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Personnel</p>
                        <ul className="mt-2 space-y-2">
                          {formData.attendanceInfo.persons.map((person, idx) => (
                            <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                              <span className="font-semibold">{person.name}</span> {person.role && <span className="text-gray-500">- {person.role}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formData.attendanceInfo.locations && formData.attendanceInfo.locations.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Check-in Locations</p>
                        <ul className="mt-2 space-y-2">
                          {formData.attendanceInfo.locations.map((location, idx) => (
                            <li key={idx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                              <span className="font-semibold">{location.name}</span> {location.description && <span className="text-gray-500">- {location.description}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-4 sm:p-6 flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Back to Edit
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isLoading}
                  className="bg-green-600 text-white hover:bg-green-700 min-w-[150px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : initialData ? "Confirm Update" : "Confirm Create"}
                </Button> 
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

const DetailItem = ({ label, value }: { label: string, value: string | number | undefined | null }) => {
  if (!value) return null
  return (
    <div>
      <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  )
}