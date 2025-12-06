import { getHospital, updateHospital } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const hospital = getHospital(id)
  if (!hospital) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
  }

  const updateData: any = {}

  if (typeof body.icu_beds_available === "number") {
    updateData.icu_beds_available = Math.max(0, body.icu_beds_available)
  }
  if (typeof body.general_beds_available === "number") {
    updateData.general_beds_available = Math.max(0, body.general_beds_available)
  }
  if (typeof body.emergency_beds_available === "number") {
    updateData.emergency_beds_available = Math.max(0, body.emergency_beds_available)
  }

  const updatedHospital = updateHospital(id, updateData)

  if (!updatedHospital) {
    return NextResponse.json({ error: "Failed to update hospital" }, { status: 500 })
  }

  return NextResponse.json(updatedHospital)
}
