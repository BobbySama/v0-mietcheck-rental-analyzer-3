import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HomeContent } from "@/components/home-content"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <HomeContent userEmail={user.email} />
}
