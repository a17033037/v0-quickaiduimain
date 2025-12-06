"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Emergency, Hospital } from "@/lib/types"
import { MapPin, Clock, CheckCircle2, Ambulance } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function StatusPage() {
  const params = useParams()
  const emergencyId = params.id as string

  const [emergency, setEmergency] = useState<Emergency | null>(null)
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [emergencyId])

  const fetchData = async () => {
    try {
      const emergencyRes = await fetch(`/api/emergencies/${emergencyId}`)
      if (emergencyRes.ok) {
        const emergencyData = await emergencyRes.json()
        setEmergency(emergencyData)

        if (emergencyData.selected_hospital_id) {
          const hospitalsRes = await fetch("/api/hospitals")
          if (hospitalsRes.ok) {
            const hospitalsData = await hospitalsRes.json()
            const selectedHospital = hospitalsData.find((h: Hospital) => h.id === emergencyData.selected_hospital_id)
            setHospital(selectedHospital)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading status...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Ambulance className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">QuickAid - Emergency Status</h1>
          </div>
        </div>
      </nav>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emergency Status Update</CardTitle>
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
              <p className="text-sm text-muted-foreground mb-2">Current Status</p>
              <Badge
                variant={emergency.status === "resolved" ? "default" : "destructive"}
                className="text-base px-3 py-1"
              >
                {emergency.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            {hospital && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Patient being taken to:</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{hospital.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{hospital.location}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergency.timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{event.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          This page updates automatically. Share this link with family members for real-time updates.
        </p>
      </div>
    </div>
  )
}
