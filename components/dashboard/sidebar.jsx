"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FileText,
  Users,
  DollarSign,
  ActivityIcon,
  Settings,
  LogOut,
  X,
  Home,
  Calculator,
  Shield,
  Bell,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Wallet,
} from "lucide-react"

export function Sidebar({ currentUser, onLogout, isCollapsed, onToggleCollapse }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const DEFAULT_WIDTH = 288 // 72 * 4
  const COLLAPSED_WIDTH = 80 // 20 * 4 (larger collapsed for better hit targets)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [dragging, setDragging] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(DEFAULT_WIDTH)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = Number(localStorage.getItem("sidebarWidth"))
    if (!Number.isNaN(saved) && saved >= 220 && saved <= 420) {
      setWidth(saved)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("sidebarWidth", String(width))
  }, [width])

  const onMouseDown = (e) => {
    setDragging(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
    document.body.style.userSelect = "none"
  }
  const onMouseMove = (e) => {
    if (!dragging) return
    const delta = e.clientX - startXRef.current
    const next = Math.min(420, Math.max(220, startWidthRef.current + delta))
    setWidth(next)
  }
  const onMouseUp = () => {
    if (!dragging) return
    setDragging(false)
    document.body.style.userSelect = ""
  }
  useEffect(() => {
    if (!dragging) return
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [dragging])

  const getUserMenuItems = () => {
    const baseItems = [
      { id: "overview", label: "Overview", icon: Home },
      { id: "customers", label: "Customers", icon: UserCircle },
      { id: "returns", label: "Tax Returns", icon: FileText, isGroup: true },
      { id: "invoices", label: "Invoices", icon: DollarSign },
      { id: "payments", label: "Payments", icon: Wallet },
      { id: "activity", label: "Activity", icon: ActivityIcon },
      { id: "settings", label: "Settings", icon: Settings },
    ]
    if (currentUser?.role === "admin") {
      return [
        { id: "overview", label: "Overview", icon: Home },
        { id: "customers", label: "Customers", icon: UserCircle },
        { id: "users", label: "Users & Roles", icon: Users },
        { id: "returns", label: "Tax Returns", icon: FileText, isGroup: true },
        { id: "invoices", label: "Invoices", icon: DollarSign },
        { id: "payments", label: "Payments", icon: Wallet },
        { id: "activity", label: "Activity", icon: ActivityIcon },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
    return baseItems
  }
  const menuItems = getUserMenuItems()

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "preparer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "reviewer":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }
  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return Shield
      case "preparer":
        return Calculator
      case "reviewer":
        return FileText
      default:
        return Users
    }
  }
  const RoleIcon = getRoleIcon(currentUser?.role)

  const [returnsOpen, setReturnsOpen] = useState(true)
  const requestedStatus = searchParams?.get("status") || ""
  const urlActive = pathname?.startsWith("/dashboard/") ? pathname.split("/").pop() : "overview"
  const active = urlActive || "overview"
  const returnStatuses = [
    // "Initial Request",
    // "Document Verified",
    "In Preparation",
    "In Review",
    "Ready to File",
    "Filed Return",
  ]

  const sidebarStyle = { width: isCollapsed ? COLLAPSED_WIDTH : width }

  return (
    <>
      {!isCollapsed && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggleCollapse} />}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-[transform] duration-300 flex flex-col group",
          isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
        )}
        style={sidebarStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className={cn("transition-all", isCollapsed ? "hidden group-hover:block" : "block")}>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">TaxPro</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Management System</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-8 w-8 p-0">
            {isCollapsed ? <FileText className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <RoleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="hidden group-hover:block ml-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                  </div>
                </div>
                <Badge className={cn("text-xs font-medium", getRoleColor(currentUser?.role))}>
                  {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "User"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <RoleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                </div>
              </div>
              <Badge className={cn("text-xs font-medium", getRoleColor(currentUser?.role))}>
                {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "User"}
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            const href = `/dashboard/${item.id}`

            if (item.isGroup && item.id === "returns") {
              return (
                <div key="returns" className="space-y-1">
                  <button
                    onClick={() => setReturnsOpen((v) => !v)}
                    className={cn(
                      "inline-flex w-full items-center rounded-md h-11 font-medium transition-all relative",
                      isCollapsed ? "px-2 justify-center group-hover:justify-start group-hover:px-3" : "px-3",
                      pathname?.includes("/dashboard/returns")
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isCollapsed ? "group-hover:mr-3" : "mr-3")} />
                    <span className={cn(isCollapsed ? "hidden group-hover:inline" : "inline")}>{item.label}</span>
                    {!isCollapsed &&
                      (returnsOpen ? (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      ))}
                  </button>
                  <div
                    className={cn("pl-3", isCollapsed ? "hidden group-hover:block" : returnsOpen ? "block" : "hidden")}
                  >
                    {returnStatuses.map((s) => {
                      const statusActive = pathname?.includes("/dashboard/returns") && requestedStatus === s
                      return (
                        <Link
                          key={s}
                          href={`/dashboard/returns?status=${encodeURIComponent(s)}`}
                          className={cn(
                            "mt-1 flex h-9 items-center rounded-md px-3 text-sm",
                            statusActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                          )}
                          onClick={() => {
                            if (typeof window !== "undefined" && window.innerWidth < 1024 && isCollapsed === false) {
                              onToggleCollapse?.()
                            }
                          }}
                        >
                          <span className="truncate">{s}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.id}
                href={href}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024 && isCollapsed === false) {
                    onToggleCollapse?.()
                  }
                }}
                className={cn(
                  "inline-flex w-full items-center rounded-md h-11 font-medium transition-all relative",
                  isCollapsed ? "px-2 justify-center group-hover:justify-start group-hover:px-3" : "px-3",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "group-hover:mr-3" : "mr-3")} />
                <span className={cn(isCollapsed ? "hidden group-hover:inline" : "inline")}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer with drag handle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2 relative">
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800",
              isCollapsed ? "hidden group-hover:flex" : "flex",
            )}
          >
            <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">3 new notifications</span>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className={cn(
              "w-full font-medium text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",
              isCollapsed ? "px-2 justify-center group-hover:justify-start group-hover:px-3" : "justify-start px-3",
            )}
            title={isCollapsed ? "Sign Out" : ""}
          >
            <LogOut className={cn("h-5 w-5", isCollapsed ? "group-hover:mr-3" : "mr-3")} />
            <span className={cn(isCollapsed ? "hidden group-hover:inline" : "inline")}>Sign Out</span>
          </Button>

          <div
            onMouseDown={onMouseDown}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-200/40 dark:hover:bg-blue-900/30"
            aria-label="Resize sidebar"
            role="separator"
            aria-orientation="vertical"
          />
        </div>
      </div>
    </>
  )
}
