"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Emergency, Hospital } from "@/lib/types"
import {
  Activity,
  Ambulance,
  Bed,
  Clock,
  Heart,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Navigation2,
  Loader2,
  AlertTriangle,
  Siren,
} from "lucide-react"
import { reverseGeocode, parseLocation } from "@/lib/geocoding"

export default function DashboardClient() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospitalsRes, emergenciesRes] = await Promise.all([fetch("/api/hospitals"), fetch("/api/emergencies")])

        const [hospitalsData, emergenciesData] = await Promise.all([hospitalsRes.json(), emergenciesRes.json()])

        setHospitals(Array.isArray(hospitalsData) ? hospitalsData : [])
        const emergenciesArray = Array.isArray(emergenciesData) ? emergenciesData : []
        setEmergencies(emergenciesArray)

        const addressPromises = emergenciesArray.map(async (emergency: Emergency) => {
          const coords = parseLocation(emergency.location)
          if (coords) {
            const address = await reverseGeocode(coords.lat, coords.lng)
            return [emergency.id, address]
          }
          return [emergency.id, emergency.location]
        })

        const resolvedAddresses = await Promise.all(addressPromises)
        const addressMap = Object.fromEntries(resolvedAddresses)
        setAddresses(addressMap)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        setHospitals([])
        setEmergencies([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "searching":
        return "bg-yellow-100 text-yellow-800"
      case "en_route":
        return "bg-blue-100 text-blue-800"
      case "admitted":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "searching":
        return <AlertCircle className="h-4 w-4" />
      case "en_route":
        return <Navigation2 className="h-4 w-4" />
      case "admitted":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white border-red-600 animate-pulse"
      case "urgent":
        return "bg-orange-500 text-white border-orange-500"
      default:
        return "bg-gray-500 text-white border-gray-500"
    }
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case "critical":
        return <Siren className="h-4 w-4" />
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  const activeEmergencies = Array.isArray(emergencies) ? emergencies.filter((e) => e.status !== "completed") : []
  const totalBeds = Array.isArray(hospitals) ? hospitals.reduce((acc, h) => acc + h.general_beds_available, 0) : 0
  const totalEmergencyBeds = Array.isArray(hospitals)
    ? hospitals.reduce((acc, h) => acc + h.emergency_beds_available, 0)
    : 0
  const totalICUBeds = Array.isArray(hospitals) ? hospitals.reduce((acc, h) => acc + h.icu_beds_available, 0) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">Emergency Dashboard</h1>
                <p className="text-muted-foreground">Real-time tracking of emergencies and hospital bed availability</p>
              </div>
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link href="/emergency">
                  <Ambulance className="mr-2 h-4 w-4" />
                  New Emergency
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Emergencies</p>
                    <p className="text-3xl font-bold text-red-600">{activeEmergencies.length}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Ambulance className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">General Beds</p>
                    <p className="text-3xl font-bold text-blue-600">{totalBeds}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Bed className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergency Beds</p>
                    <p className="text-3xl font-bold text-orange-600">{totalEmergencyBeds}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ICU Beds</p>
                    <p className="text-3xl font-bold text-purple-600">{totalICUBeds}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Active Emergencies */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Ambulance className="h-5 w-5 text-red-600" />
                  Active Emergencies
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activeEmergencies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No active emergencies</p>
                  ) : (
                    activeEmergencies.map((emergency) => (
                      <Card
                        key={emergency.id}
                        className={`p-4 hover:shadow-md transition-shadow ${
                          emergency.severity === "critical" ? "border-2 border-red-600 bg-red-50/50" : ""
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {emergency.severity && emergency.severity !== "normal" && (
                                  <Badge className={getSeverityColor(emergency.severity)}>
                                    <span className="flex items-center gap-1">
                                      {getSeverityIcon(emergency.severity)}
                                      {emergency.severity.toUpperCase()}
                                    </span>
                                  </Badge>
                                )}
                                <Badge className={getStatusColor(emergency.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(emergency.status)}
                                    {emergency.status.replace("_", " ")}
                                  </span>
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {emergency.type}
                                </Badge>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                <span className="break-words">{addresses[emergency.id] || emergency.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              {new Date(emergency.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          {emergency.timeline && Array.isArray(emergency.timeline) && emergency.timeline.length > 0 && (
                            <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                              {emergency.timeline.slice(-3).map((event, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="text-muted-foreground">
                                    {new Date(event.timestamp || event.time).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="ml-2">{event.event}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>

              {/* Hospital Status */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Hospital Bed Availability
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {hospitals.map((hospital) => (
                    <Card key={hospital.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight flex-1">{hospital.name}</h3>
                          <Badge variant="secondary" className="shrink-0">
                            {hospital.distance_km} km
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="text-center p-2 bg-blue-50 rounded-md">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Bed className="h-3 w-3 text-blue-600" />
                            </div>
                            <p className="text-lg font-bold text-blue-600">{hospital.general_beds_available}</p>
                            <p className="text-xs text-muted-foreground">General</p>
                          </div>

                          <div className="text-center p-2 bg-orange-50 rounded-md">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Activity className="h-3 w-3 text-orange-600" />
                            </div>
                            <p className="text-lg font-bold text-orange-600">{hospital.emergency_beds_available}</p>
                            <p className="text-xs text-muted-foreground">Emergency</p>
                          </div>

                          <div className="text-center p-2 bg-purple-50 rounded-md">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Heart className="h-3 w-3 text-purple-600" />
                            </div>
                            <p className="text-lg font-bold text-purple-600">{hospital.icu_beds_available}</p>
                            <p className="text-xs text-muted-foreground">ICU</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
