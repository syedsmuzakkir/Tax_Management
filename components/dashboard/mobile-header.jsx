"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Bell, Search } from "lucide-react"

export function MobileHeader({ currentUser, onToggleSidebar, activeSection }) {
  const getSectionTitle = (section) => {
    switch (section) {
      case "overview":
        return "Dashboard Overview"
      case "users":
        return "User Management"
      case "returns":
        return "Tax Returns"
      case "documents":
        return "Documents"
      case "invoices":
        return "Invoices"
      case "activity":
        return "Activity Log"
      case "settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <header className="lg:hidden sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 px-4">
      <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="h-8 w-8 p-0">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{getSectionTitle(activeSection)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
        </Button>
        <Badge variant="outline" className="text-xs">
          {currentUser?.role ?? "User"}
        </Badge>
      </div>
    </header>
  )
}
