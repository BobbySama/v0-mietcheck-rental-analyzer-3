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
import { FileText, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
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
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Registrierung erfolgreich!</CardTitle>
          <CardDescription>
            Bitte bestatigen Sie Ihre E-Mail-Adresse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Wir haben Ihnen eine E-Mail mit einem Bestatigungs-Link gesendet. 
            Bitte klicken Sie auf den Link, um Ihr Konto zu aktivieren.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href="/auth/login">Zuruck zur Anmeldung</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
