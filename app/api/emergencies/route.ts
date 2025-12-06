import { getEmergencies, createEmergency } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function GET() {
  const emergencies = getEmergencies()
  return NextResponse.json(emergencies)
}

export async function POST(request: Request) {
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

  const newEmergency = createEmergency({
    type,
    location: location || "Unknown location",
    status: "new",
    created_at: new Date().toISOString(),
    timeline,
  })

  return NextResponse.json(newEmergency)
}
