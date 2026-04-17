"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

export interface ClauseIssue {
  clause: string
  issue: string
  severity: "high" | "medium" | "low"
  legalReference: string
  recommendation: string
}

export interface AnalysisResult {
  summary: string
  overallRisk: "high" | "medium" | "low"
  issues: ClauseIssue[]
  validClauses: string[]
}

interface AnalysisResultsProps {
  result: AnalysisResult
}

function getSeverityConfig(severity: "high" | "medium" | "low") {
  switch (severity) {
    case "high":
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        badgeVariant: "destructive" as const,
        label: "Hoch",
      }
    case "medium":
      return {
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        badgeVariant: "secondary" as const,
        label: "Mittel",
      }
    case "low":
      return {
        icon: Info,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        badgeVariant: "outline" as const,
        label: "Niedrig",
      }
  }
}

function getRiskConfig(risk: "high" | "medium" | "low") {
  switch (risk) {
    case "high":
      return {
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Hohes Risiko",
      }
    case "medium":
      return {
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        label: "Mittleres Risiko",
      }
    case "low":
      return {
        color: "text-green-600",
        bgColor: "bg-green-100",
        label: "Niedriges Risiko",
      }
  }
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const riskConfig = getRiskConfig(result.overallRisk)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Zusammenfassung</CardTitle>
            <Badge className={`${riskConfig.bgColor} ${riskConfig.color} border-0`}>
              {riskConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Issues */}
      {result.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Gefundene Probleme ({result.issues.length})
            </CardTitle>
            <CardDescription>
              Potenzielle rechtliche Probleme in Ihrem Mietvertrag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.issues.map((issue, index) => {
              const config = getSeverityConfig(issue.severity)
              const Icon = config.icon

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          {issue.clause}
                        </h4>
                        <Badge variant={config.badgeVariant}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-foreground/80">{issue.issue}</p>
                      <div className="pt-2 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Rechtliche Grundlage:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {issue.legalReference}
                        </p>
                      </div>
                      <div className="pt-2 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Empfehlung:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {issue.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Valid Clauses */}
      {result.validClauses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Gultige Klauseln ({result.validClauses.length})
            </CardTitle>
            <CardDescription>
              Diese Vertragsbestandteile sind rechtlich unbedenklich
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.validClauses.map((clause, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  {clause}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
