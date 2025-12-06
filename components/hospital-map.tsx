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
  const routingControlRef = useRef<any>(null)
  const routePolylineRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const initMap = async () => {
      const L = (await import("leaflet")).default

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

      const center =
        userLocation ||
        (hospitals[0]?.coordinates
          ? { lat: hospitals[0].coordinates.lat, lng: hospitals[0].coordinates.lng }
          : { lat: 19.076, lng: 72.8777 })

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
      }).setView([center.lat, center.lng], 13)
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      map.zoomControl.setPosition("bottomright")

      markersRef.current.forEach((marker) => {
        try {
          marker.remove()
        } catch (e) {
          console.error("Error removing marker:", e)
        }
      })
      markersRef.current = []

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `
            <div style="position: relative; width: 24px; height: 24px;">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #3b82f6; 
                width: 16px; 
                height: 16px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
                z-index: 2;
              "></div>
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(59, 130, 246, 0.2); 
                width: 24px; 
                height: 24px; 
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
              }
            </style>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        })
          .addTo(map)
          .bindPopup("<strong style='color: #3b82f6;'>📍 Your Location</strong>")

        markersRef.current.push(userMarker)
      }

      hospitals.forEach((hospital) => {
        if (!hospital.coordinates) return

        const isSelected = hospital.id === selectedHospitalId
        const color = isSelected ? "#dc2626" : "#059669"

        const icon = L.divIcon({
          className: "custom-hospital-marker",
          html: `
            <div style="
              background-color: ${color}; 
              width: ${isSelected ? "40px" : "32px"}; 
              height: ${isSelected ? "40px" : "32px"}; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: ${isSelected ? "20px" : "18px"};
              transition: all 0.3s ease;
              ${isSelected ? "animation: bounce 0.6s ease;" : ""}
            ">
              +
            </div>
            ${
              isSelected
                ? `<style>
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            </style>`
                : ""
            }
          `,
          iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
          iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
        })

        const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width: 220px; font-family: system-ui;">
              <strong style="font-size: 15px; color: ${color}; display: block; margin-bottom: 8px;">${hospital.name}</strong>
              <div style="font-size: 13px; background: #f9fafb; padding: 8px; border-radius: 6px; margin-top: 8px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                  <div style="padding: 4px;">
                    <div style="color: #6b7280; font-size: 11px;">General</div>
                    <strong style="color: #3b82f6; font-size: 16px;">${hospital.general_beds_available}</strong>
                  </div>
                  <div style="padding: 4px;">
                    <div style="color: #6b7280; font-size: 11px;">Emergency</div>
                    <strong style="color: #f59e0b; font-size: 16px;">${hospital.emergency_beds_available}</strong>
                  </div>
                  <div style="padding: 4px;">
                    <div style="color: #6b7280; font-size: 11px;">ICU</div>
                    <strong style="color: #ef4444; font-size: 16px;">${hospital.icu_beds_available}</strong>
                  </div>
                  <div style="padding: 4px;">
                    <div style="color: #6b7280; font-size: 11px;">Distance</div>
                    <strong style="color: #059669; font-size: 16px;">${hospital.distance_km} km</strong>
                  </div>
                </div>
              </div>
            </div>
          `,
            { maxWidth: 250 },
          )

        markersRef.current.push(marker)

        if (isSelected) {
          marker.openPopup()
        }
      })

      if (selectedHospitalId && userLocation) {
        const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId)
        if (selectedHospital?.coordinates) {
          // Remove previous route
          if (routePolylineRef.current) {
            try {
              map.removeLayer(routePolylineRef.current)
            } catch (e) {
              console.error("Error removing route:", e)
            }
          }

          // Draw route using simple straight line (can be enhanced with routing API)
          const routeLine = L.polyline(
            [
              [userLocation.lat, userLocation.lng],
              [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng],
            ],
            {
              color: "#dc2626",
              weight: 4,
              opacity: 0.7,
              dashArray: "10, 10",
              lineJoin: "round",
            },
          ).addTo(map)

          routePolylineRef.current = routeLine

          // Fit bounds to show both user and hospital
          const bounds = L.latLngBounds([
            [userLocation.lat, userLocation.lng],
            [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng],
          ])
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      } else {
        if (markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current)
          map.fitBounds(group.getBounds().pad(0.1))
        }
      }

      const handleResize = () => {
        if (mapInstanceRef.current) {
          setTimeout(() => {
            mapInstanceRef.current.invalidateSize()
          }, 100)
        }
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }

    initMap()

    return () => {
      if (routePolylineRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(routePolylineRef.current)
        } catch (e) {
          console.error("Error in cleanup:", e)
        }
      }
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
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg shadow-inner" />
    </>
  )
}
