export interface Hospital {
  id: string
  name: string
  distance_km: number
  icu_beds_available: number
  general_beds_available: number
  emergency_beds_available: number
  location: string
  last_updated: string
}

export interface Emergency {
  id: string
  type: "medical" | "fire" | "police"
  created_at: string
  location: string
  status: "new" | "assigned" | "en_route" | "at_hospital" | "resolved"
  selected_hospital_id: string | null
  timeline: TimelineEvent[]
}

export interface TimelineEvent {
  message: string
  timestamp: string
}
