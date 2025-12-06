import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase.from("emergencies").select("*").eq("id", id).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  // Get current emergency
  const { data: currentEmergency, error: fetchError } = await supabase
    .from("emergencies")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
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

  const { data, error } = await supabase.from("emergencies").update(updateData).eq("id", id).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
