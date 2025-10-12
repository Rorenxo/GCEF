"use client"

import { useState } from "react"
import { Input } from "@/shared/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function PasswordInput({ label, id, className = "", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || "password-" + Math.random().toString(36).slice(2, 8)

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-900 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          id={inputId}
          {...props}
          type={showPassword ? "text" : "password"}
          className={`border-zinc-800 bg-zinc-100 text-black pr-10 ${className}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-3 flex items-center text-zinc-700 hover:text-black focus:outline-none bg-transparent border-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}
