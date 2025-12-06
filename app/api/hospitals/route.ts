import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/hospitals?select=*&order=distance_km.asc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        cache: "no-store",
      },
    )

    const hospitals = await response.json()

    if (!response.ok) {
      console.error("[v0] Error fetching hospitals:", hospitals)
      return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 })
    }

    // Parse coordinates from location string
    const hospitalsWithCoords = hospitals.map((h: any) => ({
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
