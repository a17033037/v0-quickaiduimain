"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Shield, HospitalIcon, Activity, Plus, RefreshCw } from "lucide-react"
import { updateEmergencyStatus, addHospital } from "./admin-actions"
import { getAddress } from "@/lib/geocoding"
import type { Emergency, Hospital } from "@/lib/types"

export function AdminDashboard() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddHospital, setShowAddHospital] = useState(false)
  const [addresses, setAddresses] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [emergenciesRes, hospitalsRes] = await Promise.all([fetch("/api/emergencies"), fetch("/api/hospitals")])
      const emergenciesData = await emergenciesRes.json()
      const hospitalsData = await hospitalsRes.json()
      setEmergencies(Array.isArray(emergenciesData) ? emergenciesData : [])
      setHospitals(Array.isArray(hospitalsData) ? hospitalsData : [])

      // Fetch addresses for emergencies
      if (Array.isArray(emergenciesData)) {
        const addressPromises = emergenciesData.map(async (emergency: Emergency) => {
          const [lat, lng] = emergency.location.split(",").map(Number)
          return { id: emergency.id, address: await getAddress(lat, lng) }
        })
        const addressResults = await Promise.all(addressPromises)
        const addressMap = addressResults.reduce(
          (acc, { id, address }) => {
            acc[id] = address
            return acc
          },
          {} as Record<string, string>,
        )
        setAddresses(addressMap)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (emergencyId: string, newStatus: string) => {
    try {
      await updateEmergencyStatus(emergencyId, newStatus)
      fetchData()
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update emergency status")
    }
  }

  const handleAddHospital = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      await addHospital({
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        general_beds_available: Number(formData.get("general_beds")),
        emergency_beds_available: Number(formData.get("emergency_beds")),
        icu_beds_available: Number(formData.get("icu_beds")),
        distance_km: Number(formData.get("distance_km")),
      })
      setShowAddHospital(false)
      fetchData()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Failed to add hospital:", error)
      alert("Failed to add hospital")
    }
  }

  const statusColors = {
    new: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    en_route: "bg-purple-100 text-purple-800",
    at_hospital: "bg-green-100 text-green-800",
    resolved: "bg-gray-100 text-gray-800",
  }

  const statusOptions = ["new", "assigned", "en_route", "at_hospital", "resolved"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-red-100">Manage emergencies and hospitals system-wide</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Emergencies</p>
                <p className="text-3xl font-bold text-red-600">
                  {emergencies.filter((e) => e.status !== "resolved").length}
                </p>
              </div>
              <Activity className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Hospitals</p>
                <p className="text-3xl font-bold text-blue-600">{hospitals.length}</p>
              </div>
              <HospitalIcon className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Available Beds</p>
                <p className="text-3xl font-bold text-green-600">
                  {hospitals.reduce((sum, h) => sum + h.emergency_beds_available, 0)}
                </p>
              </div>
              <HospitalIcon className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-red-600" />
              Emergency Management
            </h2>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {emergencies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active emergencies</p>
            ) : (
              emergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[emergency.status as keyof typeof statusColors]
                          }`}
                        >
                          {emergency.status}
                        </span>
                        {emergency.severity === "critical" && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white animate-pulse">
                            CRITICAL
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {emergency.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Location:</span> {addresses[emergency.id] || emergency.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(emergency.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        value={emergency.status}
                        onChange={(e) => handleStatusUpdate(emergency.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <HospitalIcon className="w-6 h-6 text-blue-600" />
              Hospital Management
            </h2>
            <button
              onClick={() => setShowAddHospital(!showAddHospital)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Hospital
            </button>
          </div>

          {showAddHospital && (
            <form onSubmit={handleAddHospital} className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Hospital Name"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <input
                  name="location"
                  placeholder="Location (lat,lng)"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <input
                  name="general_beds"
                  type="number"
                  placeholder="General Beds"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <input
                  name="emergency_beds"
                  type="number"
                  placeholder="Emergency Beds"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <input
                  name="icu_beds"
                  type="number"
                  placeholder="ICU Beds"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <input
                  name="distance_km"
                  type="number"
                  step="0.1"
                  placeholder="Distance (km)"
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Add Hospital
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddHospital(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{hospital.name}</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">General</p>
                    <p className="font-semibold text-green-600">{hospital.general_beds_available}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Emergency</p>
                    <p className="font-semibold text-red-600">{hospital.emergency_beds_available}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ICU</p>
                    <p className="font-semibold text-blue-600">{hospital.icu_beds_available}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
