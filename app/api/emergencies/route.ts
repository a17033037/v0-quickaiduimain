import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("emergencies").select("*").order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { type, location } = body

  if (!type || !["medical", "fire", "police"].includes(type)) {
    return NextResponse.json({ error: "Invalid emergency type" }, { status: 400 })
  }

  const timeline = [
    {
      message: "Emergency created",
      timestamp: new Date().toISOString(),
    },
  ]

  const { data, error } = await supabase
    .from("emergencies")
    .insert({
      type,
      location: location || "Unknown location",
      status: "new",
      timeline,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
