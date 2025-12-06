"use server"

import { revalidatePath } from "next/cache"

async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.message || "Supabase request failed")
  return data
}

export async function createEmergency(data: { type: string; location: string }) {
  const timeline = [
    {
      time: new Date().toISOString(),
      event: "Emergency reported",
      status: "initiated",
    },
  ]

  const emergency = await supabaseFetch("emergencies", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      type: data.type,
      location: data.location,
      status: "searching",
      timeline,
    }),
  })

  revalidatePath("/emergency")
  return emergency[0]
}

export async function selectHospital(emergencyId: string, hospitalId: string) {
  // Get current emergency to update timeline
  const emergency = await supabaseFetch(`emergencies?id=eq.${emergencyId}&select=timeline`)

  const timeline = emergency[0]?.timeline || []
  timeline.push({
    time: new Date().toISOString(),
    event: "Hospital selected and notified",
    status: "en_route",
  })

  const updated = await supabaseFetch(`emergencies?id=eq.${emergencyId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      selected_hospital_id: hospitalId,
      status: "en_route",
      timeline,
    }),
  })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")
  return updated[0]
}

export async function updateEmergencyStatus(emergencyId: string, status: string, event: string) {
  const emergency = await supabaseFetch(`emergencies?id=eq.${emergencyId}&select=timeline`)

  const timeline = emergency[0]?.timeline || []
  timeline.push({
    time: new Date().toISOString(),
    event,
    status,
  })

  const updated = await supabaseFetch(`emergencies?id=eq.${emergencyId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status, timeline }),
  })

  revalidatePath("/emergency")
  revalidatePath("/dashboard")
  return updated[0]
}
