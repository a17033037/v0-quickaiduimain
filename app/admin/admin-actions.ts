"use server"

import { revalidatePath } from "next/cache"

function getSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return { supabaseUrl, supabaseKey }
}

export async function updateEmergencyStatus(emergencyId: string, status: string) {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()

  const statusEvent: Record<string, string> = {
    new: "Status updated to new",
    assigned: "Hospital assigned",
    en_route: "Ambulance en route",
    at_hospital: "Arrived at hospital",
    resolved: "Emergency resolved",
  }

  // Fetch current emergency to get timeline
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/emergencies?id=eq.${emergencyId}&select=*`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })

  const emergencies = await fetchRes.json()
  const emergency = emergencies[0]

  if (!emergency) throw new Error("Emergency not found")

  let timeline = []
  try {
    timeline =
      typeof emergency.timeline === "string"
        ? JSON.parse(emergency.timeline)
        : Array.isArray(emergency.timeline)
          ? emergency.timeline
          : []
  } catch (e) {
    timeline = []
  }

  timeline.push({
    time: new Date().toISOString(),
    event: statusEvent[status] || "Status updated",
    status,
  })

  const response = await fetch(`${supabaseUrl}/rest/v1/emergencies?id=eq.${emergencyId}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      status,
      timeline: JSON.stringify(timeline),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update emergency: ${response.status}`)
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath("/emergency")

  return await response.json()
}

export async function addHospital(data: {
  name: string
  location: string
  general_beds_available: number
  emergency_beds_available: number
  icu_beds_available: number
  distance_km: number
}) {
  const { supabaseUrl, supabaseKey } = getSupabaseCredentials()

  const response = await fetch(`${supabaseUrl}/rest/v1/hospitals`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      ...data,
      last_updated: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to add hospital: ${response.status}`)
  }

  revalidatePath("/admin")
  revalidatePath("/dashboard")

  return await response.json()
}
