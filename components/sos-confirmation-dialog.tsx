"use client"

import { MapPin, Clock, Building2, AlertTriangle, X } from "lucide-react"
import type { Hospital } from "@/lib/types"

interface SOSConfirmationDialogProps {
  isOpen: boolean
  hospital: Hospital | null
  estimatedTime: number
  userAddress: string
  onConfirm: () => void
  onCancel: () => void
  isProcessing: boolean
}

export function SOSConfirmationDialog({
  isOpen,
  hospital,
  estimatedTime,
  userAddress,
  onConfirm,
  onCancel,
  isProcessing,
}: SOSConfirmationDialogProps) {
  if (!isOpen || !hospital) return null

  const [lat, lng] = hospital.location.split(",").map(Number)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Emergency SOS</h2>
                <p className="text-red-100 text-sm">Confirm Emergency Dispatch</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Your Location */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 mb-1">Your Location</p>
                <p className="text-sm text-blue-700 break-words">{userAddress}</p>
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-900 mb-1">Nearest Hospital</p>
                <p className="text-sm font-medium text-green-800 break-words mb-2">{hospital.name}</p>
                <div className="flex items-center gap-4 text-xs text-green-700">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {hospital.emergency_beds_available} Emergency Beds
                  </span>
                  <span>{hospital.distance_km.toFixed(1)} km away</span>
                </div>
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">Estimated Arrival Time</p>
                <p className="text-2xl font-bold text-amber-700">{estimatedTime} minutes</p>
                <p className="text-xs text-amber-600 mt-1">Ambulance will be dispatched immediately</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700 text-center font-medium">
              This will notify emergency services and dispatch an ambulance. Only use for genuine emergencies.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Dispatching..." : "Confirm Emergency"}
          </button>
        </div>
      </div>
    </div>
  )
}
