"use client"

import { useState } from "react"
import { useTaxation } from "@/contexts/TaxationContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, FileText, Upload, MessageSquare, DollarSign, User, Calendar, Filter } from "lucide-react"

export function ActivitySection({ currentUser: currentUserProp }) {
  const { activityLogs, isLoading, currentUser: ctxUser } = useTaxation()
  const currentUser = currentUserProp || ctxUser

  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  if (isLoading || !currentUser || currentUser?.id == null) {
    return <div className="h-40 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
  }

  const userActivityLogs =
    currentUser.role === "admin" ? activityLogs : activityLogs.filter((log) => log.userId === currentUser.id)

  const filteredLogs = userActivityLogs.filter((log) => {
    const actionText = (log?.action || "").toLowerCase()
    const detailsText = (log?.details || "").toLowerCase()
    const userNameText = (log?.userName || "").toLowerCase()
    const term = (searchTerm || "").toLowerCase()

    const matchesSearch = actionText.includes(term) || detailsText.includes(term) || userNameText.includes(term)
    const matchesAction = actionFilter === "all" || (log?.action || "").includes(actionFilter)

    let matchesDate = true
    if (dateFilter !== "all") {
      const logDate = new Date(log?.timestamp || Date.now())
      const now = new Date()
      switch (dateFilter) {
        case "today":
          matchesDate = logDate.toDateString() === now.toDateString()
          break
        case "week":
          matchesDate = logDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          matchesDate = logDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          matchesDate = true
      }
    }

    return matchesSearch && matchesAction && matchesDate
  })

  const getActionIcon = (action) => {
    if (action.includes("Document")) return <Upload className="h-4 w-4" />
    if (action.includes("Comment")) return <MessageSquare className="h-4 w-4" />
    if (action.includes("Payment") || action.includes("Invoice")) return <DollarSign className="h-4 w-4" />
    if (action.includes("User")) return <User className="h-4 w-4" />
    if (action.includes("Tax Return") || action.includes("Status")) return <FileText className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getActionColor = (action) => {
    if (action.includes("Document") || action.includes("Upload"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    if (action.includes("Comment")) return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    if (action.includes("Payment") || action.includes("Invoice"))
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    if (action.includes("User")) return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
    if (action.includes("Status")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Activity statistics
  const todayLogs = userActivityLogs.filter((log) => {
    const logDate = new Date(log.timestamp)
    const today = new Date()
    return logDate.toDateString() === today.toDateString()
  })

  const weekLogs = userActivityLogs.filter((log) => {
    const logDate = new Date(log.timestamp)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return logDate >= weekAgo
  })

  const actionCounts = userActivityLogs.reduce((acc, log) => {
    const actionType = log.action.split(" ")[0] // Get first word of action
    acc[actionType] = (acc[actionType] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Activity Log</h1>
          <p className="text-slate-600 dark:text-slate-400">Track all system activities and changes</p>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Activities</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{userActivityLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Today</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{todayLogs.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">This Week</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{weekLogs.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Most Active</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {Object.keys(actionCounts).length > 0
                    ? Object.entries(actionCounts).sort(([, a], [, b]) => b - a)[0][0]
                    : "None"}
                </p>
              </div>
              <Filter className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Document">Document Actions</SelectItem>
            <SelectItem value="Comment">Comments</SelectItem>
            <SelectItem value="Payment">Payments</SelectItem>
            <SelectItem value="Status">Status Updates</SelectItem>
            <SelectItem value="User">User Actions</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Activity Timeline</CardTitle>
          <CardDescription>Chronological list of all activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.userName}
                    </span>
                    {log.returnId && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Return #{log.returnId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No activities found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm || actionFilter !== "all" || dateFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No activities have been recorded yet."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
