import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  const updateData: any = {
    last_updated: new Date().toISOString(),
  }

  if (typeof body.icu_beds_available === "number") {
    updateData.icu_beds_available = Math.max(0, body.icu_beds_available)
  }
  if (typeof body.general_beds_available === "number") {
    updateData.general_beds_available = Math.max(0, body.general_beds_available)
  }
  if (typeof body.emergency_beds_available === "number") {
    updateData.emergency_beds_available = Math.max(0, body.emergency_beds_available)
  }

  const { data, error } = await supabase.from("hospitals").update(updateData).eq("id", id).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
