"use client"

import { useState } from "react"
import { useTaxation } from "@/contexts/TaxationContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Upload, FileText, Download, Eye, FolderOpen, Search } from "lucide-react"

export function DocumentsSection({ currentUser: currentUserProp }) {
  const { taxReturns, addDocument, isLoading, currentUser: ctxUser } = useTaxation()
  const currentUser = currentUserProp || ctxUser

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReturn, setSelectedReturn] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadData, setUploadData] = useState({ returnId: "", files: [], comments: "" })

  if (isLoading || !currentUser || currentUser?.id == null) {
    return <div className="h-40 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
  }

  const userReturns =
    currentUser.role === "admin" ? taxReturns : taxReturns.filter((ret) => ret.userId === currentUser.id)

  // Get all documents from all returns
  const allDocuments = userReturns.flatMap((ret) =>
    (ret?.documents ?? []).map((doc) => ({
      ...doc,
      returnId: ret.id,
      returnType: ret.type,
      returnYear: ret.year,
      userName: ret.userName,
    })),
  )

  const filteredDocuments = allDocuments.filter((doc) => {
    const name = (doc?.name || "").toLowerCase()
    const comments = (doc?.comments || "").toLowerCase()
    const term = (searchTerm || "").toLowerCase()
    const matchesSearch = name.includes(term) || comments.includes(term)
    const matchesReturn = selectedReturn === "all" || String(doc?.returnId) === selectedReturn
    return matchesSearch && matchesReturn
  })

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    setUploadData((prev) => ({ ...prev, files }))
  }

  const handleUploadSubmit = () => {
    if (uploadData.returnId && uploadData.files.length > 0) {
      uploadData.files.forEach((file) => {
        addDocument(Number.parseInt(uploadData.returnId), {
          name: file.name,
          type: file.type.split("/")[1] || "unknown",
          size: `${Math.round(file.size / 1024)} KB`,
          comments: uploadData.comments,
        })
      })
      setUploadData({ returnId: "", files: [], comments: "" })
      setIsUploadDialogOpen(false)
    }
  }

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "jpg":
      case "jpeg":
      case "png":
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Documents</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and organize tax documents</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>Upload documents for a specific tax return.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="return">Tax Return</Label>
                <Select
                  value={uploadData.returnId}
                  onValueChange={(value) => setUploadData((prev) => ({ ...prev, returnId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax return" />
                  </SelectTrigger>
                  <SelectContent>
                    {userReturns.map((ret) => (
                      <SelectItem key={ret.id} value={ret.id.toString()}>
                        {ret.type} - {ret.year} ({ret.userName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="files">Files</Label>
                <Input id="files" type="file" multiple onChange={handleFileUpload} className="cursor-pointer" />
                {uploadData.files.length > 0 && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {uploadData.files.length} file(s) selected
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Input
                  id="comments"
                  value={uploadData.comments}
                  onChange={(e) => setUploadData((prev) => ({ ...prev, comments: e.target.value }))}
                  placeholder="Add any notes about these documents"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadSubmit} disabled={!uploadData.returnId || uploadData.files.length === 0}>
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <Select value={selectedReturn} onValueChange={setSelectedReturn}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Returns</SelectItem>
            {userReturns.map((ret) => (
              <SelectItem key={ret.id} value={ret.id.toString()}>
                {ret.type} - {ret.year} ({ret.userName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={`${doc.returnId}-${doc.id}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.type)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100 truncate">{doc.name}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {doc.returnType} - {doc.returnYear}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Size:</span>
                  <span className="text-slate-900 dark:text-slate-100">{doc.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Uploaded:</span>
                  <span className="text-slate-900 dark:text-slate-100">{doc.uploadDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Client:</span>
                  <span className="text-slate-900 dark:text-slate-100">{doc.userName}</span>
                </div>
              </div>

              {doc.comments && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{doc.comments}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No documents found</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchTerm || selectedReturn !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Upload your first document to get started."}
          </p>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Documents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{allDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Tax Returns</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{userReturns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Most Recent</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {allDocuments.length > 0
                  ? allDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0].uploadDate
                  : "No documents"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Size</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {allDocuments.reduce((total, doc) => {
                  const size = Number.parseInt(doc.size.replace(/[^\d]/g, "")) || 0
                  return total + size
                }, 0)}{" "}
                KB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
