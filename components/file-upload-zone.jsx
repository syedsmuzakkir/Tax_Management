"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, ImageIcon, CastleIcon as DefaultFileIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function FileUploadZone({
  onFilesUploaded,
  acceptedTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024,
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState("")

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
        return <DefaultFileIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const validateFile = (file) => {
    const allowedTypes = acceptedTypes.split(",").map((type) => type.trim())
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not allowed. Allowed types: ${acceptedTypes}`
    }

    if (file.size > maxSize) {
      return `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`
    }

    return null
  }

  const handleFiles = useCallback(
    (files) => {
      setUploadError("")
      const fileArray = Array.from(files)
      const validFiles = []
      const errors = []

      fileArray.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      })

      if (errors.length > 0) {
        setUploadError(errors.join("\n"))
      }

      if (validFiles.length > 0) {
        onFilesUploaded(validFiles)
      }
    },
    [acceptedTypes, maxSize, onFilesUploaded],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = e.dataTransfer.files
      handleFiles(files)
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e) => {
      const files = e.target.files
      if (files) {
        handleFiles(files)
      }
    },
    [handleFiles],
  )

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-border",
          "hover:border-primary/50 hover:bg-primary/5",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-sm text-muted-foreground mb-4">
          Supported formats: {acceptedTypes.replace(/\./g, "").toUpperCase()}
        </p>
        <p className="text-xs text-muted-foreground mb-4">Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB</p>
        <Input
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload-input"
        />
        <Label htmlFor="file-upload-input">
          <Button type="button" className="cursor-pointer">
            Choose Files
          </Button>
        </Label>
      </div>

      {uploadError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Upload Error</p>
                <pre className="text-xs text-destructive mt-1 whitespace-pre-wrap">{uploadError}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
