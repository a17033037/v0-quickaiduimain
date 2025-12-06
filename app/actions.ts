"use server"

import { revalidatePath } from "next/cache"
import { supabaseInsert } from "@/lib/supabase/fetch-client"
import { emergencyTypeToDbType, type EmergencyType } from "@/lib/types"

// Simple UUID v4 generator that works in server environment
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return { supabaseUrl, supabaseKey }
}

async function supabaseUpdate(table: string, id: string, data: any) {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

async function supabaseFetch(table: string, id: string) {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}&select=*`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data[0]
}

export async function createEmergency(data: { type: EmergencyType; location: string }) {
  // Use custom UUID generator instead of crypto.randomUUID()
  const emergencyId = generateUUID()

  const timeline = [
    {
      time: new Date().toISOString(),
      event: "Emergency reported",
      status: "initiated",
    },
  ]

  const dbType = emergencyTypeToDbType(data.type)

  console.log("[v0] Creating emergency:", {
    emergencyId,
    uiType: data.type,
    dbType,
    location: data.location,
  })

  const { data: emergency, error } = await supabaseInsert("emergencies", {
    id: emergencyId,
    type: dbType, // Use mapped database type
    location: data.location,
    status: "new",
    timeline: JSON.stringify(timeline),
  })

  if (error) {
    console.error("[v0] Emergency creation failed:", error)
    throw new Error(error.message || "Failed to create emergency")
  }

  console.log("[v0] Emergency created successfully:", emergency)
  revalidatePath("/emergency")
  return emergency
}

export async function selectHospital(emergencyId: string, hospitalId: string) {
  const emergencyData = await supabaseFetch("emergencies", emergencyId)
  if (!emergencyData) throw new Error("Emergency not found")

  let timeline = []
  try {
    timeline =
      typeof emergencyData.timeline === "string"
        ? JSON.parse(emergencyData.timeline)
        : Array.isArray(emergencyData.timeline)
          ? emergencyData.timeline
          : []
  } catch (e) {
    console.error("[v0] Failed to parse timeline:", e)
    timeline = []
  }

  timeline.push({
    time: new Date().toISOString(),
    event: "Hospital selected and notified",
    status: "en_route",
  })

  const updated = await supabaseUpdate("emergencies", emergencyId, {
    selected_hospital_id: hospitalId,
    status: "en_route",
    timeline: JSON.stringify(timeline), // Convert back to JSON string for database
  })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")
  return updated[0]
}

export async function updateEmergencyStatus(emergencyId: string, status: string, event: string) {
  const emergencyData = await supabaseFetch("emergencies", emergencyId)
  if (!emergencyData) throw new Error("Emergency not found")

  let timeline = []
  try {
    timeline =
      typeof emergencyData.timeline === "string"
        ? JSON.parse(emergencyData.timeline)
        : Array.isArray(emergencyData.timeline)
          ? emergencyData.timeline
          : []
  } catch (e) {
    console.error("[v0] Failed to parse timeline:", e)
    timeline = []
  }

  timeline.push({
    time: new Date().toISOString(),
    event,
    status,
  })

  const updated = await supabaseUpdate("emergencies", emergencyId, {
    status,
    timeline: JSON.stringify(timeline), // Convert back to JSON string for database
  })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")
  return updated[0]
}

export async function sosEmergency(location: string) {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()

  // Parse location
  const [lat, lng] = location.split(",").map(Number)

  // Find nearest hospital with available beds
  const response = await fetch(
    `${supabaseUrl}/rest/v1/hospitals?select=*&emergency_beds_available=gte.1&order=distance_km.asc&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to find nearest hospital")
  }

  const hospitals = await response.json()

  if (!hospitals || hospitals.length === 0) {
    throw new Error("No hospitals with available beds found")
  }

  const nearestHospital = hospitals[0]

  // Create emergency with medical type (generic)
  const emergencyId = generateUUID()
  const timeline = [
    {
      time: new Date().toISOString(),
      event: "SOS Emergency activated",
      status: "initiated",
    },
    {
      time: new Date().toISOString(),
      event: `Auto-assigned to ${nearestHospital.name}`,
      status: "assigned",
    },
    {
      time: new Date().toISOString(),
      event: "Ambulance dispatched",
      status: "en_route",
    },
  ]

  const { data: emergency, error } = await supabaseInsert("emergencies", {
    id: emergencyId,
    type: "medical",
    location,
    status: "en_route",
    selected_hospital_id: nearestHospital.id,
    patient_name: "SOS Emergency",
    description: "Emergency SOS activation - requires immediate assistance",
    timeline: JSON.stringify(timeline),
  })

  if (error) {
    console.error("[v0] SOS Emergency creation failed:", error)
    throw new Error(error.message || "Failed to create SOS emergency")
  }

  // Decrement hospital emergency bed count
  await fetch(`${supabaseUrl}/rest/v1/hospitals?id=eq.${nearestHospital.id}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      emergency_beds_available: Math.max(0, nearestHospital.emergency_beds_available - 1),
    }),
  })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")

  return {
    emergency,
    hospital: nearestHospital,
  }
}
