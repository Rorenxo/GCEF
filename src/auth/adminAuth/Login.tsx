"use client"

import { useState, type FormEvent, useEffect } from "react"
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import gcef1 from '@/assets/gcef1.png';
import { PasswordInput } from "@/shared/components/ui/passwordInput";
import { ArrowBigLeft, Loader2 } from "lucide-react";
import BackgroundImage1 from '@/assets/gc.jpg'; 
import BackgroundImage2 from '@/assets/gcef.jpg'; 
import BackgroundImage3 from '@/assets/gclogo.png'; 

const backgroundImages = [
  BackgroundImage1, BackgroundImage2, BackgroundImage3
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        const auth = getAuth();
        if (!email.endsWith("@gcadmin.edu.ph")) {
          alert("Only @gcadmin.edu.ph emails are allowed for admin login.")
          setIsLoading(false)
          return
        }

        // Set persistence based on the "Remember me" checkbox
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);

        await signIn(email, password);
        navigate("/admin") 
      } else {

        if (!email.endsWith("@gcadmin.edu.ph")) {
          alert("Only @gcadmin.edu.ph emails are allowed for admin registration.")
          setIsLoading(false)
          return
        }
        await signUp(firstName, lastName, email, password)
        navigate("/login")
        setIsLogin(true)
      }
    } catch (err) {
      console.error("Auth failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (


    <div 
      className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden"
    >
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${image})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      
      <Button
        type="button"
        className="absolute top-4 left-4 bg-red-600 text-white hover:bg-red-700 z-20"
        onClick={() => {
          localStorage.removeItem("gcef_token")
          localStorage.removeItem("gcef_token_expiry")
          navigate("/")
        }}
      >
        <ArrowBigLeft className ="mr-2 h4 w4" />
        Leave
      </Button>

      <Card className="relative z-10 w-full max-w-md border-zinc-800 bg-zinc-100/80 shadow-2xl transition-all duration-500">
        <CardHeader className="space-y-1 text-center">
          <img src={gcef1} alt="GCEF Logo" className="mx-auto mb-4 h-24 w-24 object-contain" />
          <CardTitle className="text-2xl font-bold text-black">
            {isLogin ? "GCEF Admin Login" : "GCEF Admin Register"}
          </CardTitle>
          <CardDescription className="text-zinc-800">
            {isLogin ? "Sign in to manage school events" : "Create your GCEF admin account"}
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
                    required={!isLogin}
                    className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
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
                    required={!isLogin}
                    className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-900">Email</Label>
              <Input
                id="email"
                type="email"  
                placeholder="juandelacruz@gcadmin.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
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
                className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
              />
              {isLogin && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={() => setRememberMe(!rememberMe)}
                    />
                    <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-700">Remember me</Label>
                  </div>
                  <a href="#" className="text-sm text-green-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              )}
            </div>
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? "Sign In" : "Sign Up"}
            </Button>

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

          </form>
          <p className="mt-4 px-8 text-center text-xs text-zinc-500 pt-4">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a> and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
