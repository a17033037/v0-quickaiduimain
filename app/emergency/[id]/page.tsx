"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Hospital, Emergency } from "@/lib/types"
import { MapPin, Ambulance, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EmergencyPage() {
  const params = useParams()
  const emergencyId = params.id as string

  const [emergency, setEmergency] = useState<Emergency | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [emergencyId])

  const fetchData = async () => {
    try {
      const [emergencyRes, hospitalsRes] = await Promise.all([
        fetch(`/api/emergencies/${emergencyId}`),
        fetch("/api/hospitals"),
      ])

      if (emergencyRes.ok) {
        const emergencyData = await emergencyRes.json()
        setEmergency(emergencyData)
      }

      if (hospitalsRes.ok) {
        const hospitalsData = await hospitalsRes.json()
        setHospitals(hospitalsData)
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendedHospital = () => {
    if (emergency?.type === "medical") {
      // For medical emergencies, prioritize ICU beds
      return hospitals
        .filter((h) => h.icu_beds_available > 0 || h.emergency_beds_available > 0)
        .sort((a, b) => {
          const scoreA = a.icu_beds_available * 10 + a.emergency_beds_available * 5 - a.distance_km
          const scoreB = b.icu_beds_available * 10 + b.emergency_beds_available * 5 - b.distance_km
          return scoreB - scoreA
        })[0]
    }
    // For other emergencies, just find closest with available beds
    return hospitals
      .filter((h) => h.general_beds_available > 0 || h.emergency_beds_available > 0)
      .sort((a, b) => a.distance_km - b.distance_km)[0]
  }

  const recommendedHospital = getRecommendedHospital()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading emergency details...</p>
        </div>
      </div>
    )
  }

  if (!emergency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Emergency not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getEmergencyIcon = () => {
    switch (emergency.type) {
      case "medical":
        return "🚑"
      case "fire":
        return "🚒"
      case "police":
        return "🚓"
      default:
        return "🚨"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ambulance className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-bold">QuickAid</h1>
            </div>
            <Button variant="outline" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Banner */}
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h2 className="font-bold text-lg">Emergency Alert Sent</h2>
            <p className="text-sm">Help is on the way. Responders have been notified.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Incident Info & Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getEmergencyIcon()}</span>
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{emergency.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{new Date(emergency.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <Badge variant={emergency.status === "resolved" ? "default" : "destructive"}>
                    {emergency.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center h-64 flex flex-col items-center justify-center">
                  <MapPin className="h-12 w-12 text-red-600 mb-2" />
                  <p className="font-semibold">You are here</p>
                  <p className="text-sm text-muted-foreground mt-4">{hospitals.length} hospitals nearby</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergency.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Hospital Availability */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Hospital Bed Availability</CardTitle>
                <p className="text-sm text-muted-foreground">Real-time bed availability at nearby hospitals</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospitals.map((hospital) => {
                  const isRecommended = recommendedHospital?.id === hospital.id
                  const hasAvailability =
                    hospital.icu_beds_available > 0 ||
                    hospital.general_beds_available > 0 ||
                    hospital.emergency_beds_available > 0

                  return (
                    <Card
                      key={hospital.id}
                      className={isRecommended ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{hospital.name}</h3>
                              {isRecommended && <Badge className="bg-green-600">Recommended</Badge>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{hospital.distance_km} km away</span>
                              <span>{hospital.location}</span>
                            </div>
                          </div>
                          {hasAvailability ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-background rounded p-2">
                            <p className="text-xs text-muted-foreground">ICU Beds</p>
                            <p
                              className={`font-semibold ${hospital.icu_beds_available > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {hospital.icu_beds_available}
                            </p>
                          </div>
                          <div className="bg-background rounded p-2">
                            <p className="text-xs text-muted-foreground">General</p>
                            <p
                              className={`font-semibold ${hospital.general_beds_available > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {hospital.general_beds_available}
                            </p>
                          </div>
                          <div className="bg-background rounded p-2">
                            <p className="text-xs text-muted-foreground">Emergency</p>
                            <p
                              className={`font-semibold ${hospital.emergency_beds_available > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {hospital.emergency_beds_available}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
