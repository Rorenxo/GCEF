"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card" 

export default function Terms() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <Card className="max-w-3xl bg-white text-zinc-900 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Terms, Privacy Policy & Cookies Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to Gordon College Event Management System. By using our platform, you agree to comply with the following
            Terms and Conditions, Privacy Policy, and Cookies Policy.
          </p>
          <h2 className="font-semibold">1. Terms of Use</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Use your official <strong>@gordoncollege.edu.ph</strong> account to register.</li>
            <li>Do not share login credentials with anyone.</li>
            <li>Unauthorized access or misuse will lead to account suspension.</li>
          </ul>

          <h2 className="font-semibold">2. Privacy Policy</h2>
          <p>
            We collect personal data such as your name, email, and usage information solely for managing school events. 
            Your data is stored securely and will not be shared with third parties without consent.
          </p>

          <h2 className="font-semibold">3. Cookies Policy</h2>
          <p>
            We use cookies to enhance your experience, remember preferences, and analyze usage. You can disable cookies 
            in your browser settings, but some features may not function properly.
          </p>

          <p className="text-center mt-6">
            <a href="/" className="text-green-600 hover:underline">Return to Login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
