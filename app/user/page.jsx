"use client"

import { useState } from "react"
import { useTaxation } from "@/contexts/TaxationContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/components/ui/dialog"
import { FileManager } from "@/components/file-manager"
import {
  FileText,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Home,
  Activity,
  Plus,
  CreditCard,
} from "lucide-react"

export default function UserDashboard() {
  const { currentUser, taxReturns, invoices, activityLogs, addTaxReturn, addComment, processPayment, addDocument } =
    useTaxation()

  const [activeTab, setActiveTab] = useState("returns")
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [selectedReturnForComment, setSelectedReturnForComment] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [newReturnData, setNewReturnData] = useState({ type: "", year: "" })

  const userTaxReturns = taxReturns.filter((ret) => ret.userId === currentUser.id)
  const userInvoices = invoices.filter((inv) => inv.userId === currentUser.id)
  const userActivityLogs = activityLogs.filter((log) => log.userId === currentUser.id)

  const uploadedDocuments = userTaxReturns.flatMap((ret) =>
    ret.documents.map((doc) => ({
      ...doc,
      returnId: ret.id,
      uploadedBy: currentUser.name,
    })),
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case "Filed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Review":
      case "In Review":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Filed":
        return "bg-green-500"
      case "Review":
      case "In Review":
        return "bg-yellow-500"
      case "Preparation started":
        return "bg-blue-500"
      case "Ready to file":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProgress = (status) => {
    switch (status) {
      case "Uploaded documents":
        return 20
      case "Pre-analysis done":
        return 40
      case "Preparation started":
        return 60
      case "Review":
        return 80
      case "Ready to file":
        return 90
      case "Filed":
        return 100
      default:
        return 0
    }
  }

  const handleFilesUploaded = (files) => {
    files.forEach((file) => {
      if (file.returnId) {
        addDocument(file.returnId, file)
      }
    })
  }

  const handleFileDelete = (fileId) => {
    console.log("Delete file:", fileId)
  }

  const handleFileDownload = (file) => {
    const link = document.createElement("a")
    link.href = file.url || "/tax-document.png"
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAddNewReturn = () => {
    if (newReturnData.type && newReturnData.year) {
      addTaxReturn(newReturnData)
      setNewReturnData({ type: "", year: "" })
      setIsNewReturnModalOpen(false)
    }
  }

  const handleAddComment = () => {
    if (newComment.trim() && selectedReturnForComment) {
      addComment(selectedReturnForComment.id, newComment)
      setNewComment("")
      setIsCommentModalOpen(false)
      setSelectedReturnForComment(null)
    }
  }

  const handlePayInvoice = (invoiceId) => {
    processPayment(invoiceId, "Credit Card")
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
              <h1 className="text-xl font-semibold text-foreground">User Dashboard</h1>
            </div>
            <Badge variant="outline">{currentUser.name}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tax Returns
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Tax Returns Tab */}
          <TabsContent value="returns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Tax Returns</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => setIsNewReturnModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                New Return
              </Button>
            </div>

            <div className="grid gap-4">
              {userTaxReturns.map((returnItem) => (
                <Card key={returnItem.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(returnItem.status)}`} />
                        <div>
                          <CardTitle className="text-lg">
                            Form {returnItem.type} - {returnItem.year}
                          </CardTitle>
                          <CardDescription>Last updated: {returnItem.dateUpdated}</CardDescription>
                          {returnItem.assignedTo && (
                            <CardDescription>Assigned to: {returnItem.assignedTo}</CardDescription>
                          )}
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
                      <div className="text-sm text-muted-foreground">Progress: {getProgress(returnItem.status)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {returnItem.documents.length} documents uploaded
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgress(returnItem.status)}%` }}
                      />
                    </div>
                    {returnItem.comments.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-2">Recent Comments:</h4>
                        <div className="space-y-2">
                          {returnItem.comments.slice(-2).map((comment) => (
                            <div key={comment.id} className="text-xs">
                              <span className="font-medium">{comment.author}:</span> {comment.text}
                              <div className="text-muted-foreground">{comment.date}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent"
                        onClick={() => setActiveTab("documents")}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-transparent"
                        onClick={() => {
                          setSelectedReturnForComment(returnItem)
                          setIsCommentModalOpen(true)
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Add Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <FileManager
              files={uploadedDocuments}
              onFilesUploaded={handleFilesUploaded}
              onFileDelete={handleFileDelete}
              onFileDownload={handleFileDownload}
              taxReturns={userTaxReturns}
              title="Document Management"
            />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Invoices & Payments</h2>

            <div className="grid gap-4">
              {userInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Invoice #{invoice.id}</CardTitle>
                        <CardDescription>{invoice.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">${invoice.amount.toFixed(2)}</div>
                        <Badge variant={invoice.status === "Paid" ? "default" : "destructive"}>{invoice.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {invoice.status === "Paid" ? `Paid: ${invoice.datePaid}` : `Due: ${invoice.dueDate}`}
                      </div>
                      <div className="flex gap-2">
                        {invoice.status === "Pending" && (
                          <Button
                            size="sm"
                            onClick={() => handlePayInvoice(invoice.id)}
                            className="flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </Button>
                        )}
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

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Activity Log</h2>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Track all actions and updates on your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivityLogs.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                        {activity.action.includes("Upload") && <Upload className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Status") && <Clock className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Comment") && <MessageSquare className="h-4 w-4 text-accent" />}
                        {activity.action.includes("Payment") && <CreditCard className="h-4 w-4 text-accent" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.details}</div>
                        <div className="text-xs text-muted-foreground mt-1">{activity.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Return Modal */}
        <Dialog open={isNewReturnModalOpen} onOpenChange={setIsNewReturnModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tax Return</DialogTitle>
              <DialogDescription>Add a new tax return filing to your account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="return-type">Return Type</Label>
                <Select
                  value={newReturnData.type}
                  onValueChange={(value) => setNewReturnData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select return type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1040">Form 1040 (Individual)</SelectItem>
                    <SelectItem value="1065">Form 1065 (Partnership)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-year">Tax Year</Label>
                <Select
                  value={newReturnData.year}
                  onValueChange={(value) => setNewReturnData((prev) => ({ ...prev, year: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewReturnModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewReturn}>Create Return</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comment Modal */}
        <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Comment</DialogTitle>
              <DialogDescription>
                Add a comment to {selectedReturnForComment?.type} - {selectedReturnForComment?.year}
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
              <Button onClick={handleAddComment}>Add Comment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
