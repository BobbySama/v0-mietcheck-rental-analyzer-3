"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PDFUploadProps {
  onAnalyze: (file: File) => Promise<void>
  isAnalyzing: boolean
}

export function PDFUpload({ onAnalyze, isAnalyzing }: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      setError("Bitte laden Sie nur PDF-Dateien hoch")
      return
    }

    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0]
      if (uploadedFile.size > 10 * 1024 * 1024) {
        setError("Die Datei darf maximal 10MB gross sein")
        return
      }
      setFile(uploadedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isAnalyzing,
  })

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (file) {
      await onAnalyze(file)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!file ? (
        <Card
          {...getRootProps()}
          className={`cursor-pointer border-2 border-dashed transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {isDragActive
                ? "PDF hier ablegen..."
                : "Mietvertrag hochladen"}
            </p>
            <p className="text-sm text-muted-foreground">
              Ziehen Sie Ihre PDF-Datei hierher oder klicken Sie zum Auswahlen
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Nur PDF-Dateien bis 10MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isAnalyzing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        className="w-full"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Spinner className="mr-2" />
            Analysiere Vertrag...
          </>
        ) : (
          "Vertrag analysieren"
        )}
      </Button>
    </div>
  )
}
