"use client"

import { useTaxation } from "@/contexts/TaxationContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, DollarSign, Activity, Clock, CheckCircle, Calendar, BarChart3 } from "lucide-react"

export function OverviewSection({ currentUser: currentUserProp }) {
  const { users, taxReturns, invoices, activityLogs, currentUser: ctxUser, isLoading } = useTaxation()

  // Fallback to context if prop not provided
  const currentUser = currentUserProp || ctxUser

  if (isLoading || !currentUser || currentUser?.id == null) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const role = currentUser?.role || "user"
  const displayName = currentUser?.name || currentUser?.email || "User"
  const userId = currentUser?.id

  const userTaxReturns = userId ? taxReturns.filter((ret) => ret.userId === userId) : []
  const userInvoices = userId ? invoices.filter((inv) => inv.userId === userId) : []

  const stats =
    role === "admin"
      ? {
          totalUsers: users.length,
          totalReturns: taxReturns.length,
          totalInvoices: invoices.length,
          paidInvoices: invoices.filter((inv) => inv.status === "Paid").length,
          pendingReturns: taxReturns.filter((ret) => ret.status === "Review" || ret.status === "Preparation started")
            .length,
          completedReturns: taxReturns.filter((ret) => ret.status === "Filed").length,
        }
      : {
          myReturns: userTaxReturns.length,
          myInvoices: userInvoices.length,
          paidInvoices: userInvoices.filter((inv) => inv.status === "Paid").length,
          pendingReturns: userTaxReturns.filter(
            (ret) => ret.status === "Review" || ret.status === "Preparation started",
          ).length,
          completedReturns: userTaxReturns.filter((ret) => ret.status === "Filed").length,
          totalDocuments: userTaxReturns.reduce((acc, ret) => acc + (ret?.documents?.length || 0), 0),
        }

  const recentActivity = activityLogs.filter((log) => role === "admin" || log.userId === userId).slice(0, 5)

  const getStatusColor = (status) => {
    switch (status) {
      case "Filed":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
      case "Review":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Paid":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
      case "Pending":
        return "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome back, {displayName}!</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {"Here's what's happening with your "}
          {role === "admin" ? "system" : "account"}
          {" today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "admin" ? (
          <>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Tax Returns</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalReturns}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending Returns</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingReturns}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">My Returns</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.myReturns}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.completedReturns}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Documents</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.totalDocuments}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pending</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingReturns}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{activity.action}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{activity.details}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {role === "admin" ? (
                <>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add User</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">New Return</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Create Invoice</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">New Return</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Upload Document</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Pay Invoice</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Schedule Meeting</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Status Overview</CardTitle>
          <CardDescription>Current status of returns and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Tax Returns</h4>
              <div className="space-y-2">
                {["Filed", "Review", "Preparation started"].map((status) => {
                  const count = (role === "admin" ? taxReturns : userTaxReturns).filter(
                    (ret) => ret.status === status,
                  ).length
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(status)}>
                        {status}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Invoices</h4>
              <div className="space-y-2">
                {["Paid", "Pending", "Overdue"].map((status) => {
                  const count = (role === "admin" ? invoices : userInvoices).filter(
                    (inv) => inv.status === status,
                  ).length
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(status)}>
                        {status}
                      </Badge>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">This Month</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">New Returns</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {(role === "admin" ? taxReturns : userTaxReturns).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Revenue</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    $
                    {(role === "admin" ? invoices : userInvoices)
                      .reduce((sum, inv) => sum + inv.amount, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
