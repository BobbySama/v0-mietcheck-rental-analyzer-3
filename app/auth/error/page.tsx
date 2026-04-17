import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">MietCheck</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl">Ein Fehler ist aufgetreten</CardTitle>
          <CardDescription>
            Bei der Authentifizierung ist ein Problem aufgetreten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            {params?.error
              ? `Fehlercode: ${params.error}`
              : "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Zur Anmeldung</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/auth/sign-up">Neues Konto erstellen</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
