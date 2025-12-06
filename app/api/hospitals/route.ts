import { getHospitals } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function GET() {
  const hospitals = getHospitals()
  return NextResponse.json(hospitals)
}
