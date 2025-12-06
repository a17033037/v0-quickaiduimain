"use client"

import { useState } from "react"
import { AlertTriangle, Check, Loader2, MapPin, Clock, Building2, X } from "lucide-react"
import { sosEmergency, getSOSPreview } from "@/app/actions"

interface SOSPreview {
  hospital: {
    id: string
    name: string
    location: string
    emergency_beds_available: number
    distance_km: number
  }
  estimatedTime: number
  userAddress: string
}

export function SOSButton() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [sosPreview, setSOSPreview] = useState<SOSPreview | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [userLocation, setUserLocation] = useState("")

  const handleSOSClick = async () => {
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
      setUserLocation(location)

      // Get SOS preview data
      const preview = await getSOSPreview(location)
      setSOSPreview(preview)
      setShowConfirmation(true)
    } catch (error) {
      console.error("[v0] SOS Error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to get location")
      setTimeout(() => {
        setErrorMessage("")
      }, 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmSOS = async () => {
    if (!userLocation || !sosPreview) return

    setIsProcessing(true)
    setShowConfirmation(false)

    try {
      // Create emergency and auto-assign hospital
      await sosEmergency(userLocation)

      // Show success message
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 6000)
    } catch (error) {
      console.error("[v0] SOS Error:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to process SOS")
      setTimeout(() => {
        setErrorMessage("")
      }, 5000)
    } finally {
      setIsProcessing(false)
      setSOSPreview(null)
      setUserLocation("")
    }
  }

  const handleCancelSOS = () => {
    setShowConfirmation(false)
    setSOSPreview(null)
    setUserLocation("")
  }

  return (
    <>
      {/* Main SOS Button */}
      <button
        onClick={handleSOSClick}
        disabled={isProcessing}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Emergency SOS"
      >
        {isProcessing && !showConfirmation ? (
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

      {/* Confirmation Dialog */}
      {showConfirmation && sosPreview && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Emergency</h3>
                  <p className="text-sm text-red-600 font-medium">Critical Priority</p>
                </div>
              </div>
              <button onClick={handleCancelSOS} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6">
              {/* Hospital Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-900 font-medium mb-1">Nearest Hospital</p>
                    <p className="font-semibold text-gray-900 mb-1">{sosPreview.hospital.name}</p>
                    <p className="text-sm text-gray-600">{sosPreview.hospital.distance_km.toFixed(1)} km away</p>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {sosPreview.hospital.emergency_beds_available} emergency beds available
                    </p>
                  </div>
                </div>
              </div>

              {/* ETA */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-orange-900 font-medium mb-1">Estimated Arrival</p>
                    <p className="font-semibold text-gray-900">{sosPreview.estimatedTime} minutes</p>
                    <p className="text-xs text-gray-600 mt-1">Ambulance will be dispatched immediately</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium mb-1">Your Location</p>
                    <p className="text-sm text-gray-600 break-words">{sosPreview.userAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelSOS}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSOS}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    Confirm Emergency
                  </>
                )}
              </button>
            </div>

            {/* Warning */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Only use for genuine medical emergencies. Misuse may result in penalties.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-in slide-in-from-bottom-5 max-w-sm">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Emergency Activated!</h4>
              <p className="text-sm text-white/90">
                {sosPreview?.hospital.name} notified. Ambulance dispatched - ETA {sosPreview?.estimatedTime} min.
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
