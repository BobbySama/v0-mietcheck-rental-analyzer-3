"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, LogOut, User } from "lucide-react"

interface HeaderProps {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">MietCheck</span>
        </div>

        {userEmail && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
