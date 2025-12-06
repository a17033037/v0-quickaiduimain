"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ambulance, AlertCircle, Phone } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [emergencyType, setEmergencyType] = useState<string>("medical")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSOS = async () => {
    setIsLoading(true)
    try {
      // Get approximate location (mocked for demo)
      const location = "User Location (Demo Area)"

      const response = await fetch("/api/emergencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emergencyType,
          location,
        }),
      })

      if (!response.ok) throw new Error("Failed to create emergency")

      const emergency = await response.json()
      router.push(`/emergency/${emergency.id}`)
    } catch (error) {
      console.error("[v0] Error creating emergency:", error)
      alert("Failed to send emergency alert. Please try again.")
    } finally {
      setIsLoading(false)
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
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/dashboard/hospital">Hospital Dashboard</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/dashboard/responder">Responder Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-balance">Emergency Response System</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            QuickAid automatically checks nearby hospitals for available beds in real time so responders know exactly
            where to go.
          </p>
        </div>

        {/* SOS Card */}
        <Card className="max-w-md mx-auto shadow-2xl border-2">
          <CardContent className="p-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Emergency Alert</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Emergency Type</label>
                <Select value={emergencyType} onValueChange={setEmergencyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">🚑 Medical Emergency</SelectItem>
                    <SelectItem value="fire">🚒 Fire Emergency</SelectItem>
                    <SelectItem value="police">🚓 Police Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="w-full h-32 text-2xl font-bold bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={handleSOS}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Sending Alert..."
                ) : (
                  <>
                    <Phone className="h-8 w-8 mr-2" />
                    SOS
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Press SOS to immediately alert emergency services and find the nearest available hospital
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ambulance className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Instant Response</h3>
              <p className="text-sm text-muted-foreground">
                Emergency alerts are dispatched immediately to nearby responders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Real-Time Beds</h3>
              <p className="text-sm text-muted-foreground">
                View live hospital bed availability across all nearby facilities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Smart Routing</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered hospital recommendations based on availability and distance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
