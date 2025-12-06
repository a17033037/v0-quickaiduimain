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

  const timeline = emergencyData.timeline || []
  timeline.push({
    time: new Date().toISOString(),
    event: "Hospital selected and notified",
    status: "en_route",
  })

  const updated = await supabaseUpdate("emergencies", emergencyId, {
    selected_hospital_id: hospitalId,
    status: "en_route",
    timeline,
  })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")
  return updated[0]
}

export async function updateEmergencyStatus(emergencyId: string, status: string, event: string) {
  const emergencyData = await supabaseFetch("emergencies", emergencyId)
  if (!emergencyData) throw new Error("Emergency not found")

  const timeline = emergencyData.timeline || []
  timeline.push({
    time: new Date().toISOString(),
    event,
    status,
  })

  const updated = await supabaseUpdate("emergencies", emergencyId, { status, timeline })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")
  return updated[0]
}
