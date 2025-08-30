"use client"

import { useState } from "react"
import { useTaxation } from "@/contexts/TaxationContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Plus, CreditCard, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react"

export function InvoicesSection({ currentUser: currentUserProp }) {
  const {
    invoices,
    generateInvoice,
    processPayment,
    taxReturns,
    users,
    isLoading,
    currentUser: ctxUser,
  } = useTaxation()

  const user = currentUserProp || ctxUser

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("Credit Card")
  const [newInvoice, setNewInvoice] = useState({
    userId: "",
    returnId: "",
    amount: "",
    description: "",
  })

  if (isLoading || !user || user?.id == null) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const userInvoices = user.role === "admin" ? invoices : invoices.filter((inv) => inv.userId === user.id)

  const filteredInvoices = userInvoices.filter((inv) => {
    const name = (inv?.userName || "").toLowerCase()
    const desc = (inv?.description || "").toLowerCase()
    const term = (searchTerm || "").toLowerCase()
    const matchesSearch = name.includes(term) || desc.includes(term)
    const matchesStatus = statusFilter === "all" || inv?.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateInvoice = () => {
    if (newInvoice.userId && newInvoice.returnId && newInvoice.amount && newInvoice.description) {
      generateInvoice(
        Number.parseInt(String(newInvoice.userId)),
        Number.parseInt(String(newInvoice.returnId)),
        Number.parseFloat(String(newInvoice.amount)),
        newInvoice.description,
      )
      setNewInvoice({ userId: "", returnId: "", amount: "", description: "" })
      setIsCreateDialogOpen(false)
    }
  }

  const handlePayment = () => {
    if (selectedInvoice && paymentMethod) {
      processPayment(selectedInvoice.id, paymentMethod)
      setIsPaymentDialogOpen(false)
      setSelectedInvoice(null)
      setPaymentMethod("Credit Card")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const totalRevenue = userInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const paidAmount = userInvoices.filter((inv) => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = userInvoices.filter((inv) => inv.status === "Pending").reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = userInvoices.filter((inv) => inv.status === "Overdue").reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Invoices</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage billing and payments</p>
        </div>
        {user.role === "admin" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>Generate an invoice for tax return services.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={newInvoice.userId}
                    onValueChange={(value) => setNewInvoice((prev) => ({ ...prev, userId: value, returnId: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.role === "user")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return">Tax Return</Label>
                  <Select
                    value={newInvoice.returnId}
                    onValueChange={(value) => setNewInvoice((prev) => ({ ...prev, returnId: value }))}
                    disabled={!newInvoice.userId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax return" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxReturns
                        .filter((ret) => ret.userId.toString() === newInvoice.userId)
                        .map((ret) => (
                          <SelectItem key={ret.id} value={ret.id.toString()}>
                            {ret.type} - {ret.year}
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
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Tax return preparation services"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Paid</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">${paidAmount.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">${overdueAmount.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Invoice #{invoice.id}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.userName}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusIcon(invoice.status)}
                  <span className="ml-1">{invoice.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${invoice.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Issued:</span>
                  <span className="text-slate-900 dark:text-slate-100">{invoice.dateIssued}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Due:</span>
                  <span className="text-slate-900 dark:text-slate-100">{invoice.dueDate}</span>
                </div>
                {invoice.datePaid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Paid:</span>
                    <span className="text-slate-900 dark:text-slate-100">{invoice.datePaid}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">{invoice.description}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {invoice.status === "Pending" && user.role !== "admin" && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setSelectedInvoice(invoice)
                      setIsPaymentDialogOpen(true)
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                {invoice.status === "Overdue" && user.role !== "admin" && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedInvoice(invoice)
                      setIsPaymentDialogOpen(true)
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pay Overdue
                  </Button>
                )}
                <Button variant="outline" className="flex-1 bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  View PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Complete payment for Invoice #{selectedInvoice?.id}</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Amount Due:</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    ${selectedInvoice.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{selectedInvoice.description}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePayment} className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
