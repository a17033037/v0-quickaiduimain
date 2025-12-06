"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Emergency, Hospital } from "@/lib/types"
import { Ambulance, MapPin, Clock } from "lucide-react"
import { useEffect, useState } from "react"

export default function ResponderDashboard() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [emergenciesRes, hospitalsRes] = await Promise.all([fetch("/api/emergencies"), fetch("/api/hospitals")])

      if (emergenciesRes.ok) {
        const emergenciesData = await emergenciesRes.json()
        setEmergencies(emergenciesData)
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

  const routeToHospital = async (emergencyId: string, hospitalId: string) => {
    const hospital = hospitals.find((h) => h.id === hospitalId)
    if (!hospital) return

    try {
      const response = await fetch(`/api/emergencies/${emergencyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "en_route",
          selected_hospital_id: hospitalId,
          timelineMessage: `Routed to ${hospital.name} – Bed confirmed`,
        }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("[v0] Error routing to hospital:", error)
    }
  }

  const getRecommendedHospital = (emergency: Emergency) => {
    if (emergency.type === "medical") {
      return hospitals
        .filter((h) => h.icu_beds_available > 0 || h.emergency_beds_available > 0)
        .sort((a, b) => {
          const scoreA = a.icu_beds_available * 10 + a.emergency_beds_available * 5 - a.distance_km
          const scoreB = b.icu_beds_available * 10 + b.emergency_beds_available * 5 - b.distance_km
          return scoreB - scoreA
        })[0]
    }
    return hospitals
      .filter((h) => h.general_beds_available > 0 || h.emergency_beds_available > 0)
      .sort((a, b) => a.distance_km - b.distance_km)[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ambulance className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-bold">QuickAid - Responder Dashboard</h1>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/dashboard/hospital">Hospital Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Active Emergencies</h2>
          <p className="text-muted-foreground">Manage emergency responses and hospital routing</p>
        </div>

        {emergencies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No active emergencies at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {emergencies.map((emergency) => {
              const recommendedHospital = getRecommendedHospital(emergency)
              const selectedHospital = hospitals.find((h) => h.id === emergency.selected_hospital_id)

              return (
                <Card key={emergency.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {emergency.type === "medical" ? "🚑" : emergency.type === "fire" ? "🚒" : "🚓"}
                        </span>
                        <div>
                          <h3 className="text-xl capitalize">{emergency.type} Emergency</h3>
                          <p className="text-sm font-normal text-muted-foreground">ID: {emergency.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <Badge variant={emergency.status === "resolved" ? "default" : "destructive"}>
                        {emergency.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
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
                          <p className="font-medium">{new Date(emergency.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>

                    {emergency.status === "new" && recommendedHospital && (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Badge className="bg-green-600">Recommended</Badge>
                          {recommendedHospital.name}
                        </h4>
                        <div className="grid grid-cols-4 gap-2 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Distance</p>
                            <p className="font-semibold">{recommendedHospital.distance_km} km</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ICU</p>
                            <p className="font-semibold">{recommendedHospital.icu_beds_available}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">General</p>
                            <p className="font-semibold">{recommendedHospital.general_beds_available}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Emergency</p>
                            <p className="font-semibold">{recommendedHospital.emergency_beds_available}</p>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => routeToHospital(emergency.id, recommendedHospital.id)}
                        >
                          Route Ambulance to {recommendedHospital.name}
                        </Button>
                      </div>
                    )}

                    {emergency.status === "en_route" && selectedHospital && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">En Route to {selectedHospital.name}</h4>
                        <p className="text-sm text-muted-foreground">Patient is being transported to the hospital</p>
                      </div>
                    )}

                    {emergency.status === "new" && (
                      <div>
                        <p className="text-sm font-medium mb-2">All Available Hospitals:</p>
                        <div className="grid md:grid-cols-2 gap-2">
                          {hospitals
                            .filter(
                              (h) =>
                                h.icu_beds_available > 0 ||
                                h.general_beds_available > 0 ||
                                h.emergency_beds_available > 0,
                            )
                            .map((hospital) => (
                              <Button
                                key={hospital.id}
                                variant="outline"
                                size="sm"
                                onClick={() => routeToHospital(emergency.id, hospital.id)}
                              >
                                {hospital.name} ({hospital.distance_km} km)
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
