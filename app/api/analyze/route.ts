import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

async function extractPDFText(buffer: Buffer): Promise<string> {
  const text = buffer.toString("latin1")
  const results: string[] = []
  const regex = /\(([^\)]{1,200})\)\s*Tj/g
  let match
  while ((match = regex.exec(text)) !== null) {
    results.push(match[1])
  }
  let extracted = results.join(" ").trim()
  if (extracted.length < 50) {
    extracted = buffer
      .toString("utf8")
      .replace(/[^\x20-\x7E\xC0-\xFF\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }
  return extracted
}

export async function POST(request: NextRequest) {
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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contractText = await extractPDFText(buffer)

    if (!contractText || contractText.trim().length < 50) {
      return NextResponse.json(
        { error: "Der Vertrag konnte nicht gelesen werden." },
        { status: 400 }
      )
    }

    const client = new OpenAI({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    })

    const completion = await client.chat.completions.create({
      model: "anthropic/claude-3-haiku",
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte fuer oesterreichisches Mietrecht (MRG).
Analysiere den Mietvertrag. Antworte auf Deutsch.
Antworte NUR als JSON mit exakt diesen Keys:
{
  "summary": "Kurze Zusammenfassung der wichtigsten Erkenntnisse (2-3 Saetze)",
  "overallRisk": "high oder medium oder low",
  "mietzins": "Deine Analyse zum Mietzins hier",
  "kaution": "Deine Analyse zur Kaution hier",
  "kuendigungsfristen": "Deine Analyse zu Kuendigungsfristen hier",
  "issues": [
    {
      "clause": "Name der problematischen Klausel",
      "issue": "Beschreibung des Problems",
      "severity": "high oder medium oder low",
      "legalReference": "Relevante Gesetzesreferenz z.B. Paragraph 27 MRG",
      "recommendation": "Empfehlung fuer den Mieter"
    }
  ],
  "validClauses": ["Liste gueltiger Klauseln"]
}
Kein Text ausserhalb des JSON.`
        },
        {
          role: "user",
          content: `Mietvertrag zur Analyse:\n\n${contractText.slice(0, 12000)}`
        }
      ]
    })

    const raw = completion.choices[0].message.content || ""
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