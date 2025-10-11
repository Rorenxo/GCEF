"use client"

import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import gcef1 from '../assets/gcef1.png';
import BackgroundImage from '../assets/gc.jpg'; 
import { Calendar } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      navigate("/")
    } catch (err) {
      console.error("Login failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white p-4"
    style={{
        backgroundImage: `url(${BackgroundImage})`, 
        backgroundSize: 'cover',         
        backgroundPosition: 'center',    
        backgroundRepeat: 'no-repeat',
      }}
      >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <Card className="relative z-10 w-full max-w-md border-zinc-800 bg-zinc-100/80">
        <CardHeader className="space-y-1 text-center">
            <img 
              src={gcef1}
              alt="GCEF Logo" 
              className="mx-auto mb-4 object-contain h-24 w-24 object-contain"
            />
               <CardTitle className="text-2xl font-bold text-black">GCEF Admin</CardTitle>
          <CardDescription className="text-zinc-800">Sign in to manage school events</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gcef.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-zinc-800 bg-zinc-100 text-black placeholder:text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-zinc-800 bg-zinc-100 text-black placeholder:text-zinc-100"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-400">{error}</div>
            )}
            <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
