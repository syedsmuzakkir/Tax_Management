"use client"

import { useState } from "react"
import { useTaxation } from "@/contexts/TaxationContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  FileText,
  DollarSign,
  Settings,
  Home,
  Search,
  Plus,
  Edit,
  Eye,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Ban,
  UserPlus,
  Download,
  Receipt,
  Activity,
  Upload,
  MessageSquare,
} from "lucide-react"

export default function AdminDashboard() {
  const {
    currentUser,
    users,
    taxReturns,
    invoices,
    activityLogs,
    addUser,
    updateUser,
    updateTaxReturn,
    addComment,
    generateInvoice,
    processPayment,
    switchUserRole,
  } = useTaxation()

  const [activeTab, setActiveTab] = useState("users")
  const [searchTerm, setSearchTerm] = useState("")

  // Modal states
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)

  // Selected items for modals
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [newUserData, setNewUserData] = useState({ name: "", email: "", role: "user", phone: "", address: "" })
  const [newInvoiceData, setNewInvoiceData] = useState({
    userId: "",
    returnId: "",
    amount: "",
    description: "",
    dueDate: "",
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "Paid":
      case "Filed":
        return "bg-green-500"
      case "suspended":
      case "Overdue":
        return "bg-red-500"
      case "Pending":
      case "Review":
      case "Pre-analysis done":
      case "Preparation started":
        return "bg-yellow-500"
      case "Ready to file":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Filed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Review":
      case "Pre-analysis done":
      case "Preparation started":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50"
      case "Normal":
        return "text-blue-600 bg-blue-50"
      case "Low":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const statusOptions = [
    "Uploaded documents",
    "Pre-analysis done",
    "Preparation started",
    "Review",
    "Ready to file",
    "Filed",
  ]

  const roleOptions = ["user", "preparer", "reviewer", "admin"]
  const preparers = users.filter((user) => user.role === "preparer" || user.role === "reviewer")

  const handleEditUser = (user) => {
    setSelectedUser({ ...user })
    setIsEditUserModalOpen(true)
  }

  const handleUpdateUser = () => {
    if (selectedUser) {
      updateUser(selectedUser.id, selectedUser)
      setIsEditUserModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handleToggleUserStatus = (userId) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      updateUser(userId, { status: user.status === "active" ? "suspended" : "active" })
    }
  }

  const handleAddUser = () => {
    if (newUserData.name && newUserData.email) {
      addUser(newUserData)
      setNewUserData({ name: "", email: "", role: "user", phone: "", address: "" })
      setIsAddUserModalOpen(false)
    }
  }

  const handleUpdateReturnStatus = (returnId, newStatus, assignedTo = null) => {
    const updates = { status: newStatus }
    if (assignedTo) updates.assignedTo = assignedTo
    updateTaxReturn(returnId, updates)
    setIsStatusUpdateModalOpen(false)
  }

  const handleAddReturnComment = () => {
    if (newComment.trim() && selectedReturn) {
      addComment(selectedReturn.id, newComment)
      setNewComment("")
      setIsCommentModalOpen(false)
      setSelectedReturn(null)
    }
  }

  const handleToggleInvoiceStatus = (invoiceId) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (invoice && invoice.status === "Pending") {
      processPayment(invoiceId, "Admin Override")
    }
  }

  const handleCreateInvoice = () => {
    if (newInvoiceData.userId && newInvoiceData.amount && newInvoiceData.description) {
      generateInvoice(
        Number.parseInt(newInvoiceData.userId),
        newInvoiceData.returnId ? Number.parseInt(newInvoiceData.returnId) : null,
        Number.parseFloat(newInvoiceData.amount),
        newInvoiceData.description,
      )
      setNewInvoiceData({ userId: "", returnId: "", amount: "", description: "", dueDate: "" })
      setIsCreateInvoiceModalOpen(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRoleSwitch = (role) => {
    switchUserRole(role)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Select value={currentUser.role} onValueChange={handleRoleSwitch}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="preparer">Preparer</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">{currentUser.name}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">User Management</h2>
              <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account in the system.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name</Label>
                      <Input
                        id="user-name"
                        value={newUserData.name}
                        onChange={(e) => setNewUserData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email Address</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={newUserData.email}
                        onChange={(e) => setNewUserData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-phone">Phone Number</Label>
                      <Input
                        id="user-phone"
                        value={newUserData.phone}
                        onChange={(e) => setNewUserData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-address">Address</Label>
                      <Input
                        id="user-address"
                        value={newUserData.address}
                        onChange={(e) => setNewUserData((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select
                        value={newUserData.role}
                        onValueChange={(value) => setNewUserData((prev) => ({ ...prev, role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddUserModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>Add User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                          <Users className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">Joined: {user.joinDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{user.totalReturns}</div>
                          <div className="text-xs text-muted-foreground">Returns</div>
                        </div>
                        <Badge variant="outline">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(user.status)}`} />
                          <span className="text-sm text-muted-foreground">
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                            {user.status === "active" ? (
                              <Ban className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Tax Returns Management</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Return
              </Button>
            </div>

            <div className="grid gap-4">
              {taxReturns.map((returnItem) => (
                <Card key={returnItem.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(returnItem.status)}`} />
                        <div>
                          <CardTitle className="text-lg">
                            {returnItem.userName} - Form {returnItem.type} ({returnItem.year})
                          </CardTitle>
                          <CardDescription>
                            {returnItem.assignedTo && `Assigned to: ${returnItem.assignedTo} • `}
                            Last updated: {returnItem.dateUpdated}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(returnItem.status)}
                        <Badge variant="secondary">{returnItem.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-muted-foreground">
                        {returnItem.documents.length} documents uploaded
                      </div>
                      <div className="text-sm text-muted-foreground">{returnItem.comments.length} comments</div>
                    </div>
                    {returnItem.comments.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">Latest Comment:</h4>
                        <div className="text-xs">
                          <span className="font-medium">
                            {returnItem.comments[returnItem.comments.length - 1].author}:
                          </span>{" "}
                          {returnItem.comments[returnItem.comments.length - 1].text}
                          <div className="text-muted-foreground mt-1">
                            {returnItem.comments[returnItem.comments.length - 1].date}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Dialog open={isStatusUpdateModalOpen} onOpenChange={setIsStatusUpdateModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedReturn(returnItem)}>
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Return Status</DialogTitle>
                            <DialogDescription>
                              Update status for {selectedReturn?.userName} - {selectedReturn?.type} (
                              {selectedReturn?.year})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>New Status</Label>
                              <Select
                                defaultValue={selectedReturn?.status}
                                onValueChange={(value) => {
                                  if (selectedReturn) {
                                    handleUpdateReturnStatus(selectedReturn.id, value)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Assign To</Label>
                              <Select
                                defaultValue={selectedReturn?.assignedTo}
                                onValueChange={(value) => {
                                  if (selectedReturn) {
                                    handleUpdateReturnStatus(selectedReturn.id, selectedReturn.status, value)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preparer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {preparers.map((preparer) => (
                                    <SelectItem key={preparer.id} value={preparer.name}>
                                      {preparer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsStatusUpdateModalOpen(false)}>
                              Cancel
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReturn(returnItem)
                          setIsCommentModalOpen(true)
                        }}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Invoices & Payments</h2>
              <Dialog open={isCreateInvoiceModalOpen} onOpenChange={setIsCreateInvoiceModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Generate a new invoice for client services.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-select">Client</Label>
                      <Select
                        value={newInvoiceData.userId}
                        onValueChange={(value) => setNewInvoiceData((prev) => ({ ...prev, userId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((user) => user.role === "user")
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="return-select">Tax Return (Optional)</Label>
                      <Select
                        value={newInvoiceData.returnId}
                        onValueChange={(value) => setNewInvoiceData((prev) => ({ ...prev, returnId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tax return" />
                        </SelectTrigger>
                        <SelectContent>
                          {taxReturns.map((returnItem) => (
                            <SelectItem key={returnItem.id} value={returnItem.id.toString()}>
                              {returnItem.userName} - {returnItem.type} ({returnItem.year})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newInvoiceData.amount}
                        onChange={(e) => setNewInvoiceData((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Description</Label>
                      <Input
                        id="service"
                        value={newInvoiceData.description}
                        onChange={(e) => setNewInvoiceData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Tax preparation, consultation, etc."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateInvoiceModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Invoice #{invoice.id} - {invoice.userName}
                        </CardTitle>
                        <CardDescription>{invoice.description}</CardDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          Issued: {invoice.dateIssued} • Due: {invoice.dueDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">${invoice.amount.toFixed(2)}</div>
                        <Badge
                          variant={
                            invoice.status === "Paid"
                              ? "default"
                              : invoice.status === "Overdue"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {invoice.datePaid ? `Paid on: ${invoice.datePaid}` : `Due: ${invoice.dueDate}`}
                        {invoice.paymentMethod && ` • Method: ${invoice.paymentMethod}`}
                      </div>
                      <div className="flex gap-2">
                        {invoice.status === "Pending" && (
                          <Button size="sm" onClick={() => handleToggleInvoiceStatus(invoice.id)}>
                            Mark Paid
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                          <Receipt className="h-4 w-4" />
                          Generate Receipt
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">System Activity</h2>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Track all system actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.slice(0, 20).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                        {activity.action.includes("Upload") && <Upload className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Status") && <Clock className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Comment") && <MessageSquare className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Payment") && <DollarSign className="h-4 w-4 text-accent" />}
                        {activity.action.includes("User") && <Users className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Invoice") && <Receipt className="h-4 w-4 text-accent" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.details}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.userName} • {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">System Settings</h2>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>Configure user roles and their permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roleOptions.map((role) => (
                      <div key={role} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-accent" />
                          <div>
                            <div className="font-medium text-foreground">
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {role === "admin" && "Full system access and user management"}
                              {role === "reviewer" && "Can review and approve tax returns"}
                              {role === "preparer" && "Can prepare and process tax returns"}
                              {role === "user" && "Basic access to personal tax information"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{users.filter((u) => u.role === role).length} users</Badge>
                          <Button variant="outline" size="sm">
                            Configure
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>General system settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">Send email updates to users and staff</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">File Upload Limits</div>
                        <div className="text-sm text-muted-foreground">
                          Maximum file size: 10MB, Types: PDF, DOC, JPG, PNG
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">Backup Settings</div>
                        <div className="text-sm text-muted-foreground">Automated daily backups at 2:00 AM</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">Security Settings</div>
                        <div className="text-sm text-muted-foreground">Password policies and session management</div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Modal */}
        <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and permissions.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => setSelectedUser((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Comment Modal */}
        <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Add a comment to {selectedReturn?.userName} - {selectedReturn?.type} ({selectedReturn?.year})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Enter your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCommentModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReturnComment}>Add Comment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
