import { getEmergency, updateEmergency } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const emergency = getEmergency(id)

  if (!emergency) {
    return NextResponse.json({ error: "Emergency not found" }, { status: 404 })
  }

  return NextResponse.json(emergency)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const currentEmergency = getEmergency(id)

  if (!currentEmergency) {
    return NextResponse.json({ error: "Emergency not found" }, { status: 404 })
  }

  // Update timeline if needed
  let timeline = currentEmergency.timeline || []
  if (body.timelineMessage) {
    timeline = [
      ...timeline,
      {
        message: body.timelineMessage,
        timestamp: new Date().toISOString(),
      },
    ]
  }

  const updateData: any = { timeline }
  if (body.status) updateData.status = body.status
  if (body.selected_hospital_id) updateData.selected_hospital_id = body.selected_hospital_id

  const updatedEmergency = updateEmergency(id, updateData)

  if (!updatedEmergency) {
    return NextResponse.json({ error: "Failed to update emergency" }, { status: 500 })
  }

  return NextResponse.json(updatedEmergency)
}
