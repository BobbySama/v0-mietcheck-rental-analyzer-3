import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Check authentication
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Nur PDF-Dateien erlaubt" }, { status: 400 })
    }

    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Extract text from PDF
    const pdfParse = (await import("pdf-parse")).default
    const pdfData = await pdfParse(buffer)
    const contractText = pdfData.text

    if (!contractText || contractText.trim().length < 50) {
      return NextResponse.json(
        { error: "Der Vertrag konnte nicht gelesen werden oder ist zu kurz" },
        { status: 400 }
      )
    }

    // Initialize Anthropic client with OpenRouter
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://mietcheck.vercel.app",
        "X-Title": "MietCheck",
      },
    })

    // Analyze the contract using Claude
    const message = await client.messages.create({
      model: "anthropic/claude-haiku-4-5",
      max_tokens: 1500,
      system: `Du bist ein Experte fuer oesterreichisches Mietrecht (MRG).
Analysiere den Mietvertrag. Antworte auf Deutsch.
Antworte NUR als JSON mit exakt diesen Keys:
{
  "summary": "Kurze Zusammenfassung der wichtigsten Erkenntnisse (2-3 Saetze)",
  "overallRisk": "high" oder "medium" oder "low",
  "mietzins": "Deine Analyse zum Mietzins hier",
  "kaution": "Deine Analyse zur Kaution hier",
  "kuendigungsfristen": "Deine Analyse zu Kuendigungsfristen hier",
  "issues": [
    {
      "clause": "Name der problematischen Klausel",
      "issue": "Beschreibung des Problems",
      "severity": "high" oder "medium" oder "low",
      "legalReference": "Relevante Gesetzesreferenz (z.B. § 27 MRG)",
      "recommendation": "Empfehlung fuer den Mieter"
    }
  ],
  "validClauses": ["Liste gueltiger/unbedenklicher Klauseln"]
}
Kein Text ausserhalb des JSON. Nur Bezug auf den vorliegenden Vertrag.`,
      messages: [
        {
          role: "user",
          content: `Mietvertrag zur Analyse:\n\n${contractText.slice(0, 12000)}`
        }
      ]
    })

    // Parse the response
    const contentBlock = message.content[0]
    if (contentBlock.type !== "text") {
      return NextResponse.json(
        { error: "Unerwartete Antwort vom AI-Service" },
        { status: 500 }
      )
    }
    
    const raw = contentBlock.text
    const clean = raw.replace(/```json|```/g, "").trim()
    
    let analysisResult
    try {
      analysisResult = JSON.parse(clean)
    } catch {
      console.error("Failed to parse AI response:", raw)
      return NextResponse.json(
        { error: "Die Analyse konnte nicht verarbeitet werden" },
        { status: 500 }
      )
    }

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist bei der Analyse aufgetreten" },
      { status: 500 }
    )
  }
}
