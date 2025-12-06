import { NextResponse } from "next/server"
import { supabaseQuery, supabaseInsert } from "@/lib/supabase/fetch-client"

export async function GET() {
  try {
    console.log("[v0] Fetching emergencies from Supabase...")

    const { data: emergencies, error } = await supabaseQuery("emergencies", {
      order: { column: "created_at", ascending: false },
    })

    if (error) {
      console.error("[v0] Error fetching emergencies:", error)
      return NextResponse.json({ error: "Failed to fetch emergencies" }, { status: 500 })
    }

    console.log("[v0] Found emergencies:", emergencies?.length || 0)
    return NextResponse.json(emergencies || [])
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch emergencies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Creating emergency:", body)

    const { data, error } = await supabaseInsert("emergencies", body)

    if (error) {
      console.error("[v0] Error creating emergency:", error)
      return NextResponse.json({ error: "Failed to create emergency" }, { status: 500 })
    }

    console.log("[v0] Emergency created successfully")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to create emergency" }, { status: 500 })
  }
}
