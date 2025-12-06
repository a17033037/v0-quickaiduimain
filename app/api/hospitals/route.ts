import { NextResponse } from "next/server"
import { supabaseQuery } from "@/lib/supabase/fetch-client"

export async function GET() {
  try {
    console.log("[v0] Fetching hospitals from Supabase...")

    const { data: hospitals, error } = await supabaseQuery("hospitals", {
      order: { column: "distance_km", ascending: true },
    })

    if (error) {
      console.error("[v0] Error fetching hospitals:", error)
      return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 })
    }

    console.log("[v0] Found hospitals:", hospitals?.length || 0)

    const hospitalsWithCoords = (hospitals || []).map((h: any) => ({
      ...h,
      coordinates: h.location
        ? {
            lat: Number.parseFloat(h.location.split(",")[0]),
            lng: Number.parseFloat(h.location.split(",")[1]),
          }
        : undefined,
    }))

    return NextResponse.json(hospitalsWithCoords)
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 })
  }
}
