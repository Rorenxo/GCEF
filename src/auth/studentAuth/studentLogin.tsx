"use client"

import { useState, useEffect, type FormEvent } from "react"
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { PasswordInput } from "@/shared/components/ui/passwordInput"
import { doc, setDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { motion } from "framer-motion"
import RegistrationConfirmModal from "@/auth/studentAuth/RegistrationConfirmModal"
import gcef1 from "@/assets/gcef1.png"
import BackgroundImage1 from "@/assets/gc.jpg"
import BackgroundImage2 from "@/assets/gcef.jpg"
import BackgroundImage3 from "@/assets/gclogo.png"
import { ArrowBigLeft, Loader2 } from "lucide-react"

const backgroundImages = [BackgroundImage1, BackgroundImage2, BackgroundImage3]

export default function StudentLogin() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [registeredData, setRegisteredData] = useState<any>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { signIn, signUp, error } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [studentNumber, setStudentNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [course, setCourse] = useState("")
  const [yearLevel, setYearLevel] = useState("")

  // Background slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      )
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const handleNextStep = () => {
    if (!email.endsWith("@gordoncollege.edu.ph")) {
      alert("Only Gordon College student accounts are allowed.")
      return
    }
    if (email.trim() === "" || password.trim() === "") {
      alert("Please fill in your email and password.")
      return
    }
    setStep(2)
  }

  const handlePrevStep = () => setStep(1)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        const auth = getAuth()
        if (!email.endsWith("@gordoncollege.edu.ph")) {
          alert("Only Gordon College student accounts are allowed.")
          setIsLoading(false)
          return
        }
        const persistence = rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
        await setPersistence(auth, persistence)
        await signIn(email, password)
        navigate("/student")
      } else {
        // Instead of creating the account immediately, just prepare data for confirmation
        if (!email.endsWith("@gordoncollege.edu.ph")) {
          alert("Only Gordon College student accounts are allowed.")
          setIsLoading(false)
          return
        }

        setRegisteredData({
          firstName,
          lastName,
          email,
          password,
          studentNumber,
          department,
          course,
          yearLevel,
        })

        // Show confirmation modal BEFORE creating account
        setShowConfirmModal(true)
      }
    } catch (err) {
      console.error("Auth failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDetails = async () => {
  if (!registeredData) return
  setIsLoading(true)
  try {
    const userCredential = await signUp(
      registeredData.firstName,
      registeredData.lastName, 
      registeredData.email, 
      registeredData.password, 
      { 
        studentNumber: registeredData.studentNumber,
        department: registeredData.department,
        course: registeredData.course,
        yearLevel: registeredData.yearLevel,
      }
    )
    setShowConfirmModal(false)
    setIsLogin(true)
    setStep(1)
    setEmail("")
    setPassword("")
    setFirstName("")
    setLastName("")
    setStudentNumber("")
    setDepartment("")
    setCourse("")
    setYearLevel("")
    setRegisteredData(null)
  } catch (err) {
    console.error("Account creation failed:", err)
    alert("Failed to create account.")
  } finally {
    setIsLoading(false)
  }
}

  const handleEditDetails = () => {
    setShowConfirmModal(false)
    setStep(1)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
 
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

      {/* Leave Button */}
      <Button
        type="button"
        className="absolute top-4 left-4 bg-red-600 text-white hover:bg-red-700 z-20"
        onClick={() => {
          localStorage.removeItem("gcef_token")
          localStorage.removeItem("gcef_token_expiry")
          navigate("/")
        }}
      >
        <ArrowBigLeft className="mr-2 h-4 w-4" />
        Leave
      </Button>

      {/* Main Container */}
      <motion.div
        animate={{ opacity: showConfirmModal ? 0.5 : 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-zinc-800 bg-zinc-100/80">
          <CardHeader className="space-y-1 text-center">
            <img
              src={gcef1}
              alt="GCEF Logo"
              className="mx-auto mb-4 h-24 w-24 object-contain"
            />
            <CardTitle className="text-2xl font-bold text-black">
              Gordon College
            </CardTitle>
            <CardDescription className="text-zinc-800">
              {isLogin
                ? "Sign in to your student account"
                : "Create your student account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* LOGIN FORM */}
            {isLogin && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-900">
                    Student Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juandelacruz@gordoncollege.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-900">
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={rememberMe}
                      onCheckedChange={() => setRememberMe(!rememberMe)}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Remember me
                    </Label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-green-600 hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                      in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center mt-2 text-sm">
                  <p className="text-zinc-700">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false)
                        setStep(1)
                      }}
                      className="text-green-600 hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {!isLogin && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Progress Bar */}
                {step === 1 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
                      <span>Step 1 of 2</span>
                      <span className="font-semibold">Account Information</span>
                    </div>
                    <div className="flex w-full gap-1.5">
                      <div className="h-1.5 rounded-full bg-green-600 w-1/2"></div>
                      <div className="h-1.5 rounded-full bg-gray-300 w-1/2"></div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-zinc-500 mb-2">
                      <span>Step 2 of 2</span>
                      <span className="font-semibold">Personal Details</span>
                    </div>
                    <div className="flex w-full gap-1.5">
                      <div className="h-1.5 rounded-full bg-green-600 w-1/2"></div>
                      <div className="h-1.5 rounded-full bg-green-600 w-1/2"></div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-900">
                        Student Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juandelacruz@gordoncollege.edu.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-xs text-zinc-500">
                        Must be your official @gordoncollege.edu.ph email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-zinc-900">
                        Password
                      </Label>
                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      Next
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="flex gap-2">
                      <div className="w-1/2 space-y-2">
                        <Label htmlFor="firstName" className="text-zinc-900">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div className="w-1/2 space-y-2">
                        <Label htmlFor="lastName" className="text-zinc-900">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentNumber" className="text-zinc-900">
                        Student Number
                      </Label>
                      <Input
                        id="studentNumber"
                        value={studentNumber}
                        onChange={(e) => setStudentNumber(e.target.value)}
                        required
                        className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="w-1/2 space-y-2">
                        <Label htmlFor="department" className="text-zinc-900">
                          Department
                        </Label>
                        <select
                          id="department"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                          className="w-full p-2 border-zinc-400 bg-zinc-100 text-black rounded-md focus:border-green-500 focus:ring-green-500"
                        >
                          <option value="">Select...</option>
                          <option value="CCS">CCS</option>
                          <option value="CEAS">CEAS</option>
                          <option value="CHTM">CHTM</option>
                          <option value="CBA">CBA</option>
                          <option value="CAHS">CAHS</option>
                        </select>
                      </div>
                      <div className="w-1/2 space-y-2">
                        <Label htmlFor="yearLevel" className="text-zinc-900">
                          Year Level
                        </Label>
                        <select
                          id="yearLevel"
                          value={yearLevel}
                          onChange={(e) => setYearLevel(e.target.value)}
                          required
                          className="w-full p-2 border-zinc-400 bg-zinc-100 text-black rounded-md focus:border-green-500 focus:ring-green-500"
                        >
                          <option value="">Select...</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course" className="text-zinc-900">
                        Course
                      </Label>
                      <Input
                        id="course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                        className="border-zinc-400 bg-zinc-100 text-black focus:border-green-500 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="w-1/3"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Confirming...
                          </>
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}

            <p className="mt-4 px-8 text-center text-xs text-zinc-500">
              By continuing, you agree to our{" "}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Registration Confirmation Modal */}
      <RegistrationConfirmModal
        isOpen={showConfirmModal}
        registeredData={registeredData}
        onConfirm={handleConfirmDetails}
        onEdit={handleEditDetails}
      />
    </div>
  )
}
