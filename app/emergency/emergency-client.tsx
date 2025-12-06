"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EmergencyTypeSelector from "@/components/emergency-type-selector"
import HospitalMap from "@/components/hospital-map"
import { createEmergency, selectHospital } from "@/app/actions"
import type { Hospital, EmergencyType } from "@/lib/types"
import { reverseGeocode, parseLocation } from "@/lib/geocoding"
import { Activity, Bed, Heart, MapPin, Navigation, Loader2 } from "lucide-react"

export default function EmergencyClient() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null)
  const [location, setLocation] = useState<string>("")
  const [userAddress, setUserAddress] = useState<string>("")
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | undefined>()
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null)
  const [emergencyId, setEmergencyId] = useState<string | null>(null)
  const [hospitalAddresses, setHospitalAddresses] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals")
        const data = await response.json()
        const hospitalsArray = Array.isArray(data) ? data : []
        setHospitals(hospitalsArray)

        const addressPromises = hospitalsArray.map(async (hospital: Hospital) => {
          const coords = parseLocation(hospital.location)
          if (coords) {
            const address = await reverseGeocode(coords.lat, coords.lng)
            return [hospital.id, address]
          }
          return [hospital.id, hospital.location]
        })

        const resolvedAddresses = await Promise.all(addressPromises)
        const addressMap = Object.fromEntries(resolvedAddresses)
        setHospitalAddresses(addressMap)
      } catch (error) {
        console.error("[v0] Error fetching hospitals:", error)
        setHospitals([])
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
    getUserLocation()
  }, [])

  const getUserLocation = async () => {
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation(`${latitude.toFixed(6)},${longitude.toFixed(6)}`)
        setUserCoordinates({ lat: latitude, lng: longitude })
        const address = await reverseGeocode(latitude, longitude)
        setUserAddress(address)
        setIsGettingLocation(false)
      },
      async (error) => {
        console.error("[v0] Geolocation error:", error)
        const defaultLat = 19.076
        const defaultLng = 72.8777
        setLocation(`${defaultLat},${defaultLng}`)
        setUserCoordinates({ lat: defaultLat, lng: defaultLng })
        const address = await reverseGeocode(defaultLat, defaultLng)
        setUserAddress(address)
        setIsGettingLocation(false)
      },
    )
  }

  const handleEmergencySubmit = async () => {
    if (!selectedType || !location) {
      alert("Please select emergency type and location")
      return
    }

    setIsSubmitting(true)
    try {
      const emergency = await createEmergency({
        type: selectedType,
        location,
      })
      setEmergencyId(emergency.id)
    } catch (error) {
      console.error("[v0] Error creating emergency:", error)
      alert("Failed to create emergency. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectHospital = async (hospitalId: string) => {
    if (!emergencyId) return

    setIsSubmitting(true)
    try {
      await selectHospital(emergencyId, hospitalId)
      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Error selecting hospital:", error)
      alert("Failed to select hospital. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredHospitals = Array.isArray(hospitals)
    ? hospitals.filter((h) => {
        if (selectedType === "cardiac" || selectedType === "stroke") {
          return h.icu_beds_available > 0
        }
        return h.emergency_beds_available > 0
      })
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hospitals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">Emergency Response</h1>
          <p className="text-muted-foreground">Select your emergency type and find the nearest available hospital</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-7">
          <div className="lg:col-span-1 xl:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                Emergency Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Emergency Type</label>
                  <EmergencyTypeSelector selected={selectedType} onSelect={setSelectedType} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Location</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 px-3 py-2 border rounded-md text-sm bg-gray-50 min-h-[2.5rem] flex items-center">
                        {isGettingLocation ? (
                          <span className="text-muted-foreground">Detecting location...</span>
                        ) : userAddress ? (
                          <span className="text-sm">{userAddress}</span>
                        ) : (
                          <span className="text-muted-foreground">Click to get location</span>
                        )}
                      </div>
                      <Button size="icon" variant="outline" onClick={getUserLocation} disabled={isGettingLocation}>
                        {isGettingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Navigation className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {userCoordinates && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location detected successfully
                      </p>
                    )}
                  </div>
                </div>

                {!emergencyId && (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleEmergencySubmit}
                    disabled={!selectedType || !location || isSubmitting}
                  >
                    {isSubmitting ? "Searching..." : "Find Hospitals"}
                  </Button>
                )}
              </div>
            </Card>

            {emergencyId && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Available Hospitals ({filteredHospitals.length})</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredHospitals.map((hospital) => (
                    <Card
                      key={hospital.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedHospitalId === hospital.id ? "ring-2 ring-red-600 bg-red-50" : ""
                      }`}
                      onClick={() => setSelectedHospitalId(hospital.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-tight flex-1">{hospital.name}</h3>
                          <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-700">
                            {hospital.distance_km} km
                          </Badge>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="break-words">{hospitalAddresses[hospital.id] || hospital.location}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                          <div className="flex items-center gap-1 justify-center p-1.5 bg-blue-50 rounded">
                            <Bed className="h-3 w-3 text-blue-600" />
                            <span className="font-medium">{hospital.general_beds_available}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-center p-1.5 bg-orange-50 rounded">
                            <Activity className="h-3 w-3 text-orange-600" />
                            <span className="font-medium">{hospital.emergency_beds_available}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-center p-1.5 bg-red-50 rounded">
                            <Heart className="h-3 w-3 text-red-600" />
                            <span className="font-medium">{hospital.icu_beds_available}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {selectedHospitalId && (
                  <Button
                    className="w-full mt-4 bg-red-600 hover:bg-red-700"
                    onClick={() => handleSelectHospital(selectedHospitalId)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Confirming..." : "Confirm Hospital"}
                  </Button>
                )}
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 xl:col-span-5">
            <Card className="p-4 h-[500px] md:h-[600px] lg:h-[calc(100vh-12rem)] relative overflow-hidden">
              <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs space-y-2">
                <div className="font-semibold text-sm mb-2">Map Legend</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow"></div>
                  <span>Available Hospital</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow"></div>
                  <span>Selected Hospital</span>
                </div>
                {selectedHospitalId && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className="w-6 h-0.5 bg-red-600" style={{ borderTop: "2px dashed #dc2626" }}></div>
                    <span>Route</span>
                  </div>
                )}
              </div>

              <HospitalMap
                hospitals={filteredHospitals}
                selectedHospitalId={selectedHospitalId}
                userLocation={userCoordinates}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
