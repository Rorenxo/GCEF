export interface UploadImageOptions {
  folder?: string
  maxSizeMB?: number
}

export async function uploadImage(file: File, options: UploadImageOptions = {}): Promise<string> {
  const { folder = "events", maxSizeMB = 5 } = options

  // --- Validate file ---
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSizeMB) throw new Error(`File size must be less than ${maxSizeMB}MB`)
  if (!file.type.startsWith("image/")) throw new Error("File must be an image")

  // --- Cloudinary Config ---
 const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)
  formData.append("folder", folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to upload image: ${err}`)
  }

  const data = await res.json()
  return data.secure_url // ✅ This will be stored in Firestore
}