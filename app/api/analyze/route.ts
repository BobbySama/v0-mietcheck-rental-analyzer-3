import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

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

    if (!contractText || contractText.trim().length < 100) {
      return NextResponse.json(
        { error: "Der Vertrag konnte nicht gelesen werden oder ist zu kurz" },
        { status: 400 }
      )
    }

    // Analyze the contract using AI
    const systemPrompt = `Du bist ein Experte für österreichisches Mietrecht, insbesondere das Mietrechtsgesetz (MRG) und das ABGB.
Analysiere den folgenden Mietvertrag und identifiziere potenzielle rechtliche Probleme.

Antworte IMMER im folgenden JSON-Format:
{
  "summary": "Eine kurze Zusammenfassung der wichtigsten Erkenntnisse (2-3 Sätze)",
  "overallRisk": "high" | "medium" | "low",
  "issues": [
    {
      "clause": "Name/Titel der problematischen Klausel",
      "issue": "Beschreibung des Problems",
      "severity": "high" | "medium" | "low",
      "legalReference": "Relevante Gesetzesreferenz (z.B. § 27 MRG)",
      "recommendation": "Empfehlung für den Mieter"
    }
  ],
  "validClauses": ["Liste gültiger/unbedenklicher Klauseln"]
}

Achte besonders auf:
- Unzulässige Befristungen (§ 29 MRG)
- Unzulässige Kündigungsverzichte
- Überhöhte Kautionen (mehr als 6 Monatsmieten)
- Unzulässige Betriebskostenklauseln
- Verstöße gegen das Mietrechtsgesetz
- Unklare oder benachteiligende Renovierungsklauseln
- Problematische Indexierungsklauseln
- Unzulässige Vertragsstrafen
- Überhöhte Mietzinse im Altbau (Richtwertmietzins)

Gib nur valides JSON zurück, keine zusätzlichen Erklärungen.`

    const { text } = await generateText({
      model: "anthropic/claude-opus-4",
      system: systemPrompt,
      prompt: `Analysiere diesen österreichischen Mietvertrag:\n\n${contractText.substring(0, 15000)}`,
    })

    // Parse the AI response
    let analysisResult
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Keine JSON-Antwort gefunden")
      }
    } catch {
      console.error("Failed to parse AI response:", text)
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
