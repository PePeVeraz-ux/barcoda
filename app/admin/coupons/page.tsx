import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CouponsManager } from "@/components/admin/coupons-manager"

export default async function AdminCouponsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <CouponsManager initialCoupons={coupons || []} />
      </div>
    </div>
  )
}
