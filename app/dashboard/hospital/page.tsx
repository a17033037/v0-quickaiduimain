"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Hospital } from "@/lib/types"
import { Ambulance, Plus, Minus } from "lucide-react"
import { useEffect, useState } from "react"

export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/hospitals")
      if (response.ok) {
        const data = await response.json()
        setHospitals(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching hospitals:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBeds = async (hospitalId: string, field: string, change: number) => {
    const hospital = hospitals.find((h) => h.id === hospitalId)
    if (!hospital) return

    const currentValue = hospital[field as keyof Hospital] as number
    const newValue = Math.max(0, currentValue + change)

    try {
      const response = await fetch(`/api/hospitals/${hospitalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      })

      if (response.ok) {
        const updatedHospital = await response.json()
        setHospitals(hospitals.map((h) => (h.id === hospitalId ? updatedHospital : h)))
      }
    } catch (error) {
      console.error("[v0] Error updating beds:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading hospitals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ambulance className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">QuickAid - Hospital Dashboard</h1>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/dashboard/responder">Responder Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Hospital Bed Management</h2>
          <p className="text-muted-foreground">Update bed availability in real-time for emergency responders</p>
        </div>

        <div className="grid gap-6">
          {hospitals.map((hospital) => (
            <Card key={hospital.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl">{hospital.name}</h3>
                    <p className="text-sm font-normal text-muted-foreground mt-1">
                      {hospital.location} • {hospital.distance_km} km
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(hospital.last_updated).toLocaleTimeString()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* ICU Beds */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">ICU Beds Available</h4>
                      <p className="text-sm text-muted-foreground">Critical care units</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateBeds(hospital.id, "icu_beds_available", -1)}
                        disabled={hospital.icu_beds_available === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={hospital.icu_beds_available}
                        className="text-center font-semibold text-lg"
                        readOnly
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateBeds(hospital.id, "icu_beds_available", 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* General Beds */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">General Beds Available</h4>
                      <p className="text-sm text-muted-foreground">Standard ward beds</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateBeds(hospital.id, "general_beds_available", -1)}
                        disabled={hospital.general_beds_available === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={hospital.general_beds_available}
                        className="text-center font-semibold text-lg"
                        readOnly
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateBeds(hospital.id, "general_beds_available", 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Emergency Beds */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">Emergency Beds Available</h4>
                      <p className="text-sm text-muted-foreground">ER beds</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateBeds(hospital.id, "emergency_beds_available", -1)}
                        disabled={hospital.emergency_beds_available === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={hospital.emergency_beds_available}
                        className="text-center font-semibold text-lg"
                        readOnly
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateBeds(hospital.id, "emergency_beds_available", 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
