"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUploadZone } from "./file-upload-zone"
import { FilePreview } from "./file-preview"
import { Upload, Search, FolderOpen, Plus } from "lucide-react"

export function FileManager({
  files = [],
  onFilesUploaded,
  onFileDelete,
  onFileDownload,
  taxReturns = [],
  showUpload = true,
  title = "Document Management",
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterReturn, setFilterReturn] = useState("all")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleFilesUploaded = (uploadedFiles) => {
    const processedFiles = uploadedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type || file.name.split(".").pop()?.toUpperCase(),
      size: `${Math.round(file.size / 1024)} KB`,
      fileSize: file.size,
      uploadDate: new Date().toISOString().split("T")[0],
      uploadedBy: "Current User",
      returnId: filterReturn !== "all" ? Number.parseInt(filterReturn) : null,
      url: URL.createObjectURL(file),
    }))

    onFilesUploaded?.(processedFiles)
    setIsUploadModalOpen(false)
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || file.name.toLowerCase().includes(filterType.toLowerCase())

    const matchesReturn = filterReturn === "all" || file.returnId?.toString() === filterReturn

    return matchesSearch && matchesType && matchesReturn
  })

  const getFileTypeOptions = () => {
    const types = [...new Set(files.map((file) => file.name.split(".").pop()?.toLowerCase()))]
    return types.filter(Boolean)
  }

  const groupedFiles = filteredFiles.reduce((groups, file) => {
    const returnId = file.returnId || "unassigned"
    if (!groups[returnId]) {
      groups[returnId] = []
    }
    groups[returnId].push(file)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {showUpload && (
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
                <DialogDescription>
                  Upload tax-related documents. Files will be organized by tax return.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {taxReturns.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign to Tax Return (Optional)</label>
                    <Select value={filterReturn} onValueChange={setFilterReturn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax return" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Unassigned</SelectItem>
                        {taxReturns.map((returnItem) => (
                          <SelectItem key={returnItem.id} value={returnItem.id.toString()}>
                            {returnItem.type} - {returnItem.year} ({returnItem.clientName || "Personal"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <FileUploadZone onFilesUploaded={handleFilesUploaded} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="File type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getFileTypeOptions().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {taxReturns.length > 0 && (
                <Select value={filterReturn} onValueChange={setFilterReturn}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tax return" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Returns</SelectItem>
                    {taxReturns.map((returnItem) => (
                      <SelectItem key={returnItem.id} value={returnItem.id.toString()}>
                        {returnItem.type} - {returnItem.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Display */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No documents found</p>
            <p className="text-sm text-muted-foreground">
              {files.length === 0
                ? "Upload your first document to get started"
                : "Try adjusting your search or filter criteria"}
            </p>
            {showUpload && files.length === 0 && (
              <Button className="mt-4" onClick={() => setIsUploadModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFiles).map(([returnId, returnFiles]) => {
            const taxReturn = taxReturns.find((r) => r.id.toString() === returnId)
            const sectionTitle =
              returnId === "unassigned"
                ? "Unassigned Documents"
                : `${taxReturn?.type || "Unknown"} - ${taxReturn?.year || "Unknown"} ${taxReturn?.clientName ? `(${taxReturn.clientName})` : ""}`

            return (
              <Card key={returnId}>
                <CardHeader>
                  <CardTitle className="text-lg">{sectionTitle}</CardTitle>
                  <CardDescription>
                    {returnFiles.length} document{returnFiles.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {returnFiles.map((file) => (
                    <FilePreview key={file.id} file={file} onDelete={onFileDelete} onDownload={onFileDownload} />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
