"use client"

import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import gcef1 from '@/assets/gcef1.png';
import BackgroundImage from '@/assets/gc.jpg'; 
import { PasswordInput } from "@/shared/components/ui/passwordInput"


export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        // Organizer login
        await signIn(email, password)
      } else {
        // Organizer registration: enforce @gcorganizer.edu.ph
        if (!email.endsWith("@gcorganizer.edu.ph")) {
          alert("Please use your gcorganizer.edu.ph email address.")
          setIsLoading(false)
          return
        }
        await signUp(firstName, lastName, email, password)
      }
      navigate("/")
    } catch (err) {
      console.error("Auth failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: `url(${BackgroundImage})`, 
        backgroundSize: 'cover',         
        backgroundPosition: 'center',    
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <Card className="relative z-10 w-full max-w-md border-zinc-800 bg-zinc-100/80 transition-all duration-500">
        <CardHeader className="space-y-1 text-center">
          <img src={gcef1} alt="GCEF Logo" className="mx-auto mb-4 h-24 w-24 object-contain" />
          <CardTitle className="text-2xl font-bold text-black">
            {isLogin ? "Organizer Login" : "Organizer Register"}
          </CardTitle>
          <CardDescription className="text-zinc-800">
            {isLogin ? "Sign in to manage your events" : "Create your organizer account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex gap-2">
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="firstName" className="text-zinc-900">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="border-zinc-800 bg-zinc-100 text-black"
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="lastName" className="text-zinc-900">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="border-zinc-800 bg-zinc-100 text-black"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-900">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@gcorganizer.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-zinc-800 bg-zinc-100 text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-900">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In" : "Sign Up")}
            </Button>

            {/* Toggle Button */}
            <div className="text-center mt-2 text-sm">
              {isLogin ? (
                <p className="text-zinc-700">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-green-600 hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-zinc-700">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-green-600 hover:underline"
                  >
                    Back to Login
                  </button>
                </p>
              )}
            </div>

            {!isLogin && (
              <p className="text-xs text-center text-zinc-700 mt-4">
                By signing up, you agree to our{" "}
                <a href="/terms" className="text-green-600 hover:underline">Terms</a>,{" "}
                <a href="/terms" className="text-green-600 hover:underline">Privacy Policy</a> and{" "}
                <a href="/auth/terms" className="text-green-600 hover:underline">Cookies Policy</a>.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
