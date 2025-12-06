import type { Hospital, Emergency } from "@/lib/types"

export const mockHospitals: Hospital[] = [
  {
    id: "1",
    name: "City General Hospital",
    location: "Downtown Mumbai",
    distance_km: 2.3,
    icu_beds_available: 5,
    general_beds_available: 12,
    emergency_beds_available: 8,
    last_updated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Metro Medical Center",
    location: "Andheri West",
    distance_km: 3.7,
    icu_beds_available: 3,
    general_beds_available: 15,
    emergency_beds_available: 6,
    last_updated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Lifeline Hospital",
    location: "Bandra",
    distance_km: 4.2,
    icu_beds_available: 7,
    general_beds_available: 20,
    emergency_beds_available: 10,
    last_updated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Hope Care Hospital",
    location: "Powai",
    distance_km: 5.1,
    icu_beds_available: 2,
    general_beds_available: 8,
    emergency_beds_available: 4,
    last_updated: new Date().toISOString(),
  },
]

export const mockEmergencies: Emergency[] = []

// In-memory storage
const hospitalsData = [...mockHospitals]
const emergenciesData = [...mockEmergencies]

export function getHospitals(): Hospital[] {
  return hospitalsData
}

export function getHospital(id: string): Hospital | undefined {
  return hospitalsData.find((h) => h.id === id)
}

export function updateHospital(id: string, updates: Partial<Hospital>): Hospital | null {
  const index = hospitalsData.findIndex((h) => h.id === id)
  if (index === -1) return null

  hospitalsData[index] = {
    ...hospitalsData[index],
    ...updates,
    last_updated: new Date().toISOString(),
  }
  return hospitalsData[index]
}

export function getEmergencies(): Emergency[] {
  return emergenciesData
}

export function getEmergency(id: string): Emergency | undefined {
  return emergenciesData.find((e) => e.id === id)
}

export function createEmergency(emergency: Omit<Emergency, "id">): Emergency {
  const newEmergency: Emergency = {
    ...emergency,
    id: Math.random().toString(36).substring(7),
  }
  emergenciesData.push(newEmergency)
  return newEmergency
}

export function updateEmergency(id: string, updates: Partial<Emergency>): Emergency | null {
  const index = emergenciesData.findIndex((e) => e.id === id)
  if (index === -1) return null

  emergenciesData[index] = {
    ...emergenciesData[index],
    ...updates,
  }
  return emergenciesData[index]
}
