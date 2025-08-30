"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, FileText, Shield, Users, Calculator } from "lucide-react"
import { OTPInput } from "./otp-input"
import { useToast } from "@/hooks/use-toast"

export function LoginForm({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { toast } = useToast()

  const demoAccounts = [
    { email: "admin@taxpro.com", password: "admin123", role: "admin", name: "Admin User" },
    { email: "user@taxpro.com", password: "user123", role: "user", name: "John Doe" },
    { email: "preparer@taxpro.com", password: "prep123", role: "preparer", name: "Jane Smith" },
    { email: "reviewer@taxpro.com", password: "review123", role: "reviewer", name: "Mike Johnson" },
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First try API call
      const response = await fetch("http://192.168.1.5:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: formData.email,
          Password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store the email for OTP verification
        setPendingUser({
          email: formData.email,
          role: "user", // Default role, adjust based on API response
          name: formData.email.split("@")[0], // Default name
        })
        setShowOTP(true)
        toast({
          title: "Success",
          description: "OTP sent to your email",
        })
      } else {
        // Fallback to demo accounts if API fails
        const account = demoAccounts.find((acc) => acc.email === formData.email && acc.password === formData.password)

        if (account) {
          setPendingUser(account)
          setShowOTP(true)
          toast({
            title: "Demo Mode",
            description: "Using demo account. OTP verification simulated.",
          })
        } else {
          toast({
            title: "Error",
            description: data.message || "Invalid credentials",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      // Fallback to demo accounts on network error
      const account = demoAccounts.find((acc) => acc.email === formData.email && acc.password === formData.password)

      if (account) {
        setPendingUser(account)
        setShowOTP(true)
        toast({
          title: "Demo Mode",
          description: "Network error. Using demo account.",
        })
      } else {
        toast({
          title: "Error",
          description: "Network error. Please try demo accounts.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (account) => {
    setIsLoading(true)
    setFormData({ email: account.email, password: account.password })

    try {
      // For demo accounts, try API first then fallback to simulation
      const response = await fetch("http://192.168.1.5:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: account.email,
          Password: account.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPendingUser({
          email: account.email,
          role: account.role,
          name: account.name,
        })
        setShowOTP(true)
        toast({
          title: "Success",
          description: "OTP sent to your email",
        })
      } else {
        // Fallback to demo simulation
        setPendingUser(account)
        setShowOTP(true)
        toast({
          title: "Demo Mode",
          description: "Using demo account. OTP verification simulated.",
        })
      }
    } catch (error) {
      // Fallback to demo simulation on network error
      setPendingUser(account)
      setShowOTP(true)
      toast({
        title: "Demo Mode",
        description: "Network error. Using demo account.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerify = async (otp) => {
    setIsLoading(true)

    try {
      // Try API verification first
      const response = await fetch("http://192.168.1.5:3000/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: pendingUser.email,
          Otp: otp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Use API response format
        const apiResponse = {
          message: "Login successful",
          user: {
            id: data.user?.id || (pendingUser.role === "admin" ? 4 : 1),
            name: data.user?.name || pendingUser.name,
            email: data.user?.email || pendingUser.email,
            role: data.user?.role || pendingUser.role,
          },
          token: data.token || `demo_token_${Date.now()}`,
        }

        onLogin(apiResponse)
        toast({
          title: "Success",
          description: "Login successful!",
        })
      } else {
        // Fallback to demo verification (accept any 6-digit code)
        if (otp.length === 6) {
          const apiResponse = {
            message: "Login successful",
            user: {
              id:
                pendingUser.role === "admin"
                  ? 4
                  : pendingUser.role === "user"
                    ? 1
                    : pendingUser.role === "preparer"
                      ? 2
                      : 3,
              name: pendingUser.name,
              email: pendingUser.email,
              role: pendingUser.role,
            },
            token: `demo_token_${Date.now()}`,
          }

          onLogin(apiResponse)
          toast({
            title: "Demo Success",
            description: "Demo login successful!",
          })
        } else {
          toast({
            title: "Error",
            description: data.message || "Invalid OTP",
            variant: "destructive",
          })
          throw new Error("Invalid OTP")
        }
      }
    } catch (error) {
      // Fallback to demo verification on network error
      if (otp.length === 6) {
        const apiResponse = {
          message: "Login successful",
          user: {
            id:
              pendingUser.role === "admin"
                ? 4
                : pendingUser.role === "user"
                  ? 1
                  : pendingUser.role === "preparer"
                    ? 2
                    : 3,
            name: pendingUser.name,
            email: pendingUser.email,
            role: pendingUser.role,
          },
          token: `demo_token_${Date.now()}`,
        }

        onLogin(apiResponse)
        toast({
          title: "Demo Success",
          description: "Demo login successful!",
        })
      } else {
        toast({
          title: "Error",
          description: "Verification failed. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPBack = () => {
    setShowOTP(false)
    setPendingUser(null)
  }

  if (showOTP && pendingUser) {
    return (
      <OTPInput email={pendingUser.email} onVerify={handleOTPVerify} onBack={handleOTPBack} isLoading={isLoading} />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">TaxPro</h1>
          <p className="text-slate-600 dark:text-slate-400">Professional Taxation Management</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-11 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="h-11 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 pr-10"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Continue to Verification"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(account)}
                  className="h-auto p-3 flex flex-col items-center gap-1 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                  disabled={isLoading}
                >
                  {account.role === "admin" && <Shield className="h-4 w-4 text-blue-600" />}
                  {account.role === "user" && <Users className="h-4 w-4 text-green-600" />}
                  {account.role === "preparer" && <Calculator className="h-4 w-4 text-purple-600" />}
                  {account.role === "reviewer" && <FileText className="h-4 w-4 text-orange-600" />}
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {account.role}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Demo system - All data is simulated for demonstration purposes
        </p>
      </div>
    </div>
  )
}
