"use client"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams } from "next/navigation"
import {
  FileText,
  Plus,
  Eye,
  MessageSquare,
  Upload,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

export function ReturnsSection({ currentUser: currentUserProp }) {
  const {
    taxReturns,
    addTaxReturn,
    updateTaxReturn,
    addComment,
    users,
    isLoading,
    currentUser: ctxUser,
  } = useTaxation()

  const user = currentUserProp || ctxUser

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [newComment, setNewComment] = useState("")
  const [newReturn, setNewReturn] = useState(() => ({
    type: "1040",
    year: new Date().getFullYear().toString(),
    userId: "",
  }))

  const searchParams = useSearchParams()

  const mapMenuStatusToInternal = (s) => {
    switch (s) {
      case "In Review":
        return "Review"
      case "In Preparation":
        return "Preparation started"
      case "Filed Return":
        return "Filed"
      case "Initial Request":
        return "Uploaded documents"
      case "Document Verified":
        return "Review"
      case "Ready to File":
        return "Review"
      default:
        return s
    }
  }

  useEffect(() => {
    const qp = searchParams?.get("status")
    if (qp) {
      setStatusFilter(mapMenuStatusToInternal(qp))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    const role = user?.role ?? "user"
    setNewReturn((prev) => ({
      ...prev,
      userId: role === "admin" ? "" : (user?.id ?? ""),
    }))
  }, [user?.id, user?.role])

  if (isLoading || !user || user?.id == null) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const userReturns = user.role === "admin" ? taxReturns : taxReturns.filter((ret) => ret.userId === user.id)

  const filteredReturns = userReturns.filter((ret) => {
    const uName = (ret?.userName || "").toLowerCase()
    const rType = (ret?.type || "").toLowerCase()
    const rYear = ret?.year ? String(ret.year) : ""
    const term = (searchTerm || "").toLowerCase()

    const matchesSearch = uName.includes(term) || rType.includes(term) || rYear.includes(term)
    const matchesStatus = statusFilter === "all" || ret?.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddReturn = () => {
    if (newReturn.type && newReturn.year) {
      const userId = user.role === "admin" ? Number.parseInt(String(newReturn.userId)) : user.id
      const selectedUser = users.find((u) => u.id === userId)

      addTaxReturn({
        ...newReturn,
        userId,
        userName: selectedUser?.name || user.name || "User",
      })
      setNewReturn({
        type: "1040",
        year: new Date().getFullYear().toString(),
        userId: "",
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleStatusUpdate = (returnId, newStatus) => {
    updateTaxReturn(returnId, { status: newStatus })
  }

  const handleAddComment = () => {
    if (newComment.trim() && selectedReturn) {
      addComment(selectedReturn.id, newComment.trim())
      setNewComment("")
      const updatedReturn = taxReturns.find((ret) => ret.id === selectedReturn.id)
      setSelectedReturn(updatedReturn || null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Filed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Preparation started":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Filed":
        return <CheckCircle className="h-4 w-4" />
      case "Review":
        return <AlertCircle className="h-4 w-4" />
      case "Preparation started":
        return <Clock className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tax Returns</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track tax return preparation</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tax Return</DialogTitle>
              <DialogDescription>Start a new tax return preparation process.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {user.role === "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="user">Client</Label>
                  <Select
                    value={(newReturn.userId ?? "").toString()}
                    onValueChange={(value) => setNewReturn((prev) => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.role === "user")
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {u.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="type">Return Type</Label>
                <Select
                  value={newReturn.type}
                  onValueChange={(value) => setNewReturn((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1040">Form 1040 - Individual</SelectItem>
                    <SelectItem value="1065">Form 1065 - Partnership</SelectItem>
                    <SelectItem value="1120">Form 1120 - Corporation</SelectItem>
                    <SelectItem value="1120S">Form 1120S - S Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Tax Year</Label>
                <Select
                  value={newReturn.year}
                  onValueChange={(value) => setNewReturn((prev) => ({ ...prev, year: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddReturn}>Create Return</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search returns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Preparation started">Preparation Started</SelectItem>
            <SelectItem value="Review">In Review</SelectItem>
            <SelectItem value="Filed">Filed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReturns.map((taxReturn) => (
          <Card key={taxReturn.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                      {taxReturn.type} - {taxReturn.year}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{taxReturn.userName}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(taxReturn.status)}>
                  {getStatusIcon(taxReturn.status)}
                  <span className="ml-1">{taxReturn.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {taxReturn.dateCreated}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <User className="h-4 w-4" />
                  <span>Assigned: {taxReturn.assignedTo || "Unassigned"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>{taxReturn.documents.length} documents</span>
                  <span>{taxReturn.comments.length} comments</span>
                </div>
                <div className="flex gap-2">
                  {user.role === "admin" && (
                    <Select value={taxReturn.status} onValueChange={(value) => handleStatusUpdate(taxReturn.id, value)}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preparation started">Preparation</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="Filed">Filed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedReturn(taxReturn)
                      setIsViewDialogOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReturn?.type} - {selectedReturn?.year} | {selectedReturn?.userName}
            </DialogTitle>
            <DialogDescription>Tax return details and communication history</DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedReturn.status)}>
                    {getStatusIcon(selectedReturn.status)}
                    <span className="ml-1">{selectedReturn.status}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Assigned To</Label>
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    {selectedReturn.assignedTo || "Unassigned"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Created</Label>
                  <p className="text-sm text-slate-900 dark:text-slate-100">{selectedReturn.dateCreated}</p>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <p className="text-sm text-slate-900 dark:text-slate-100">{selectedReturn.dateUpdated}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Documents ({selectedReturn.documents.length})</Label>
                <div className="space-y-2">
                  {selectedReturn.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            {doc.size} • {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Comments ({selectedReturn.comments.length})</Label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedReturn.comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{comment.author}</span>
                        <span className="text-xs text-slate-500">{comment.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
