"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { PDFUpload } from "@/components/pdf-upload"
import { AnalysisResults, type AnalysisResult } from "@/components/analysis-results"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Scale, FileSearch, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HomeContentProps {
  userEmail?: string
}

export function HomeContent({ userEmail }: HomeContentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze(file: File) {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analyse fehlgeschlagen")
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleNewAnalysis() {
    setAnalysisResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={userEmail} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!analysisResult ? (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground text-balance">
                Analysieren Sie Ihren Mietvertrag
              </h1>
              <p className="text-muted-foreground text-lg text-pretty">
                Laden Sie Ihren Mietvertrag hoch und erhalten Sie eine detaillierte 
                Analyse moglicher rechtlicher Probleme nach osterreichischem Mietrecht.
              </p>
            </div>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Vertrag hochladen</CardTitle>
                <CardDescription>
                  Laden Sie Ihren Mietvertrag als PDF-Datei hoch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <PDFUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Datenschutz</h3>
                    <p className="text-sm text-muted-foreground">
                      Ihre Daten werden sicher verarbeitet und nicht gespeichert
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Scale className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">MRG-konform</h3>
                    <p className="text-sm text-muted-foreground">
                      Basierend auf dem osterreichischen Mietrechtsgesetz
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <FileSearch className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">KI-Analyse</h3>
                    <p className="text-sm text-muted-foreground">
                      Intelligente Erkennung problematischer Klauseln
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              Hinweis: Diese Analyse ersetzt keine Rechtsberatung. Bei konkreten 
              rechtlichen Fragen wenden Sie sich bitte an einen Rechtsanwalt.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleNewAnalysis} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Neue Analyse
              </Button>
            </div>
            <AnalysisResults result={analysisResult} />
          </div>
        )}
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MietCheck - Mietvertragsanalyse nach osterreichischem Recht</p>
        </div>
      </footer>
    </div>
  )
}
