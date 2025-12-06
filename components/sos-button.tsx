"use client"

import { useState } from "react"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import { sosEmergency } from "@/app/actions"

export function SOSButton() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSOS = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setErrorMessage("")

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported"))
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const location = `${position.coords.latitude},${position.coords.longitude}`

      // Create emergency and auto-assign hospital
      const result = await sosEmergency(location)

      // Show success message
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("[v0] SOS Error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to process SOS")
      setTimeout(() => {
        setErrorMessage("")
      }, 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Main SOS Button */}
      <button
        onClick={handleSOS}
        disabled={isProcessing}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Emergency SOS"
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : (
          <>
            <AlertTriangle className="w-8 h-8 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          </>
        )}

        {/* Tooltip */}
        <span className="absolute bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Emergency SOS
        </span>
      </button>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-24 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom-5 max-w-sm">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Emergency Activated!</h4>
              <p className="text-sm text-white/90">
                Nearest hospital found and ambulance dispatched. You'll receive updates soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom-5 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Error</h4>
              <p className="text-sm text-white/90">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
