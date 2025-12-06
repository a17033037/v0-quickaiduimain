"use client"

import { useEffect, useRef } from "react"
import type { Hospital } from "@/lib/types"

interface HospitalMapProps {
  hospitals: Hospital[]
  selectedHospitalId?: string | null
  userLocation?: {
    lat: number
    lng: number
  }
}

export default function HospitalMap({ hospitals, selectedHospitalId, userLocation }: HospitalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    if (typeof window === "undefined") return

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix Leaflet default icon path issues
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      if (!mapRef.current) return

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (e) {
          console.error("Error cleaning up map:", e)
        }
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = ""
        ;(mapRef.current as any)._leaflet_id = null
      }

      // Determine center point
      const center =
        userLocation ||
        (hospitals[0]?.coordinates
          ? { lat: hospitals[0].coordinates.lat, lng: hospitals[0].coordinates.lng }
          : { lat: 19.076, lng: 72.8777 }) // Default to Mumbai

      // Initialize map
      const map = L.map(mapRef.current).setView([center.lat, center.lng], 12)
      mapInstanceRef.current = map

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      // Clear old markers
      markersRef.current.forEach((marker) => {
        try {
          marker.remove()
        } catch (e) {
          console.error("Error removing marker:", e)
        }
      })
      markersRef.current = []

      // Add user location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup("<strong>Your Location</strong>")

        markersRef.current.push(userMarker)
      }

      // Add hospital markers
      hospitals.forEach((hospital) => {
        if (!hospital.coordinates) return

        const isSelected = hospital.id === selectedHospitalId
        const color = isSelected ? "#dc2626" : "#059669"

        const icon = L.divIcon({
          className: "custom-hospital-marker",
          html: `
            <div style="
              background-color: ${color}; 
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
            ">
              +
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width: 200px;">
              <strong style="font-size: 14px;">${hospital.name}</strong>
              <div style="margin-top: 8px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span>General Beds:</span>
                  <strong>${hospital.general_beds_available}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span>Emergency Beds:</span>
                  <strong>${hospital.emergency_beds_available}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span>ICU Beds:</span>
                  <strong>${hospital.icu_beds_available}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0; padding-top: 4px; border-top: 1px solid #e5e7eb;">
                  <span>Distance:</span>
                  <strong>${hospital.distance_km} km</strong>
                </div>
              </div>
            </div>
          `,
          )

        markersRef.current.push(marker)

        if (isSelected) {
          marker.openPopup()
        }
      })

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (e) {
          console.error("Error in cleanup:", e)
        }
      }
      markersRef.current = []
    }
  }, [hospitals, selectedHospitalId, userLocation])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </>
  )
}
