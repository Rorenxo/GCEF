import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

export interface UploadImageOptions {
  folder?: string
  maxSizeMB?: number
}

export async function uploadImage(file: File, options: UploadImageOptions = {}): Promise<string> {
  const { folder = "events", maxSizeMB = 5 } = options

  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`)
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  try {
    // Create unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}_${sanitizedName}`

    // Upload to Firebase Storage
    const imageRef = ref(storage, `${folder}/${filename}`)
    await uploadBytes(imageRef, file)

    // Get download URL
    const downloadURL = await getDownloadURL(imageRef)
    return downloadURL
  } catch (error: any) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error: any) {
    console.error("Failed to delete image:", error)
    // Don't throw error - image deletion is not critical
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" }
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: "Image must be less than 5MB" }
  }

  // Check file extension
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
  if (!validExtensions.includes(extension)) {
    return { valid: false, error: "Invalid file type. Use JPG, PNG, GIF, or WebP" }
  }

  return { valid: true }
}
