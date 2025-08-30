"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTaxation } from "@/contexts/TaxationContext"
import { LoginForm } from "@/components/auth/login-form"

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading TaxPro...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useTaxation()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard/overview")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <LoadingScreen />
  if (isAuthenticated) return <LoadingScreen />

  return (
    <LoginForm
      onLogin={(apiResponse) => {
        // Persist in context then navigate
        login(apiResponse)
        router.replace("/dashboard/overview")
      }}
    />
  )
}
