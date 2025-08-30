"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTaxation } from "@/contexts/TaxationContext"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, currentUser, logout } = useTaxation()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, isLoading, router])

  const activeSection = useMemo(() => {
    if (!pathname?.startsWith("/dashboard/")) return "overview"
    return pathname.split("/").pop() || "overview"
  }, [pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        currentUser={currentUser}
        onLogout={logout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        // activeSection omitted so Sidebar derives it from URL
      />
      <div
        className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-[var(--sidebar-width,18rem)]"}`}
      >
        <MobileHeader
          currentUser={currentUser}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          activeSection={activeSection}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
