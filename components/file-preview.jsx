"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  ImageIcon,
  LucideComponent as FileIconComponent,
  Eye,
  Download,
  X,
  Calendar,
  User,
} from "lucide-react"

export function FilePreview({ file, onDelete, onDownload, showMetadata = true }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "jpg":
      case "jpeg":
      case "png":
        return <ImageIcon className="h-5 w-5 text-green-500" />
      default:
        return <FileIconComponent className="h-5 w-5 text-gray-500" />
    }
  }

  const getFileTypeColor = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "bg-red-50 text-red-700"
      case "doc":
      case "docx":
        return "bg-blue-50 text-blue-700"
      case "jpg":
      case "jpeg":
      case "png":
        return "bg-green-50 text-green-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isImage = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension)
  }

  const handlePreview = () => {
    if (isImage(file.name) && file.url) {
      setIsPreviewOpen(true)
    } else {
      // For non-images, trigger download or show in new tab
      if (file.url) {
        window.open(file.url, "_blank")
      }
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                {getFileIcon(file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{file.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={getFileTypeColor(file.name)}>
                    {file.type || file.name.split(".").pop()?.toUpperCase()}
                  </Badge>
                  <span>{file.size || formatFileSize(file.fileSize || 0)}</span>
                </div>
                {showMetadata && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    {file.uploadDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {file.uploadDate}
                      </div>
                    )}
                    {file.uploadedBy && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {file.uploadedBy}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => onDownload?.(file)}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {isImage(file.name) && file.url ? (
              <img
                src={file.url || "/placeholder.svg"}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <div className="text-center p-8">
                <FileIconComponent className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Preview not available for this file type</p>
                <Button className="mt-4" onClick={() => onDownload?.(file)}>
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
