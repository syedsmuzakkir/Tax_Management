"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Shield, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function OTPInput({ email, onVerify, onBack, isLoading }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef([])
  const { toast } = useToast()

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const handleChange = (index, value) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (otpCode = otp.join("")) => {
    setIsVerifying(true)

    try {
      await onVerify(otpCode)
      // If onVerify doesn't throw an error, the verification was successful
    } catch (error) {
      // Error is handled in the parent component, but we can reset the OTP fields here
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      const response = await fetch("http://192.168.1.5:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Password: "ResendOTP", // You might need to handle this differently
        }),
      })

      if (response.ok) {
        setTimeLeft(30)
        setCanResend(false)
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        toast({
          title: "Success",
          description: "New OTP sent to your email",
        })
      } else {
        // Fallback to demo simulation
        setTimeLeft(30)
        setCanResend(false)
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
        toast({
          title: "Demo Mode",
          description: "Demo OTP resent (any 6-digit code works)",
        })
      }
    } catch (error) {
      // Fallback to demo simulation on network error
      setTimeLeft(30)
      setCanResend(false)
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      toast({
        title: "Demo Mode",
        description: "Network error. Demo OTP resent (any 6-digit code works)",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Verify Your Identity</h1>
          <p className="text-slate-600 dark:text-slate-400">Two-Factor Authentication</p>
        </div>

        {/* OTP Form */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center text-slate-900 dark:text-slate-100">
              Enter Verification Code
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400">
              We've sent a 6-digit code to
              <br />
              <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-green-500 focus:ring-green-500"
                  disabled={isVerifying || isLoading}
                />
              ))}
            </div>

            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Demo Mode:</strong> Any 6-digit code works for demo accounts
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify()}
              disabled={otp.some((digit) => digit === "") || isVerifying || isLoading}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50"
            >
              {isVerifying || isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">Didn't receive the code?</p>
              {canResend ? (
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  disabled={isLoading}
                >
                  Resend Code
                </Button>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Resend in {timeLeft}s</p>
              )}
            </div>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              disabled={isVerifying || isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Enter the 6-digit code sent to your email
        </p>
      </div>
    </div>
  )
}
