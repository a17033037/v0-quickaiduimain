export interface Hospital {
  id: string
  name: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  general_beds_available: number
  emergency_beds_available: number
  icu_beds_available: number
  distance_km: number
  last_updated: string
}

export interface Emergency {
  id: string
  created_at: string
  type: string
  location: string
  status: string
  selected_hospital_id?: string
  timeline?: Array<{
    time: string
    event: string
    status: string
  }>
}

export type EmergencyType = "cardiac" | "accident" | "stroke" | "respiratory" | "trauma" | "pediatric"

export const emergencyTypeToDbType = (type: EmergencyType): "medical" | "fire" | "police" => {
  switch (type) {
    case "cardiac":
    case "stroke":
    case "respiratory":
    case "pediatric":
      return "medical"
    case "accident":
    case "trauma":
      return "medical" // Road accidents and trauma are also medical emergencies
    default:
      return "medical"
  }
}

export const emergencyTypeLabels: Record<EmergencyType, string> = {
  cardiac: "Cardiac Emergency",
  accident: "Road Accident",
  stroke: "Stroke",
  respiratory: "Respiratory Distress",
  trauma: "Severe Trauma",
  pediatric: "Pediatric Emergency",
}

export interface Database {
  public: {
    Tables: {
      hospitals: {
        Row: Hospital
        Insert: Omit<Hospital, "id" | "last_updated">
        Update: Partial<Omit<Hospital, "id">>
      }
      emergencies: {
        Row: Emergency
        Insert: Omit<Emergency, "id" | "created_at">
        Update: Partial<Omit<Emergency, "id" | "created_at">>
      }
    }
  }
}
