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
import { PasswordInput } from "@/shared/components/ui/passwordInput"
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"
import { ArrowBigLeft, Loader2 } from "lucide-react"
import BackgroundImage1 from '@/assets/gcef.jpg'; 
import BackgroundImage2 from '@/assets/gc.jpg'; 
import BackgroundImage3 from '@/assets/gclogo.png'; 

const backgroundImages = [
  BackgroundImage1, BackgroundImage2, BackgroundImage3
];
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState("") 
  const [department, setDepartment] = useState("")
  const [course, setCourse] = useState("")
  const [yearLevel, setYearLevel] = useState("")
  const [studentNumber, setStudentNumber] = useState("")
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
    setFormError("") 

    try {
      if (!email.endsWith("@gcorganizer.edu.ph")) {
        setFormError("Please use your gcorganizer.edu.ph email address.")
        setIsLoading(false)
        return
      }


      if (isLogin) {
        const auth = getAuth();
        // Set persistence based on the "Remember me" checkbox
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);

        await signIn(email, password);
        navigate("/organizer")
      } else {
        await addDoc(collection(db, "pendingOrganizers"), {
          firstName,
          lastName,
          email,
          password,
          department,
          course,
          yearLevel,
          studentNumber,
          status: "pending",
        });
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Auth failed:", err)
      if (!error) {
        setFormError("Authentication failed. Please check your credentials and try again.")
      }
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
        <ArrowBigLeft className="h-4 w-4" />
        Leave
      </Button>

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
          {isSubmitted ? (
            <div className="text-center text-green-700">
              <p>Your registration request has been submitted and is pending admin approval.</p>
            </div>
          ) : (
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
                      required
                      className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="studentNumber" className="text-zinc-900">Student Number</Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    placeholder="2023-XXXXX-XX"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    required
                    className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              )}
              {!isLogin && (
                <div className="flex gap-2">
                  <div className="space-y-2 w-1/2">
                    <Label htmlFor="department" className="text-zinc-900">College/Department</Label>
                    <select
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full p-2 border-zinc-400 bg-zinc-100 text-black rounded-md focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="">Select Department</option>
                      <option value="CCS">CCS</option>
                      <option value="CEAS">CEAS</option>
                      <option value="CHTM">CHTM</option>
                      <option value="CBA">CBA</option>
                      <option value="CAHS">CAHS</option>
                    </select>
                  </div>
                  <div className="space-y-2 w-1/2">
                    <Label htmlFor="yearLevel" className="text-zinc-900">Year Level</Label>
                    <select
                      id="yearLevel"
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      required
                      className="w-full p-2 border-zinc-400 bg-zinc-100 text-black rounded-md focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juandelacruz@gcorganizer.edu.ph"
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

              {formError && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-400">{formError}</div>
              )}

              {error && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-400">{error}</div>
              )}

              <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Submitting..."}
                  </>
                ) : isLogin ? "Sign In" : "Register"}
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
          )}
          <p className="mt-4 px-8 text-center text-xs text-zinc-500">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a> and{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}