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
        dragging: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      }).setView([center.lat, center.lng], userLocation ? 16 : 13) // Higher zoom for user location
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
        className: "map-tiles",
      }).addTo(map)

      map.zoomControl.setPosition("bottomright")

      const attributionControl = L.control.attribution({ position: "bottomleft", prefix: false })
      attributionControl.addAttribution("© OpenStreetMap")
      attributionControl.addTo(map)

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
            <div style="position: relative; width: 32px; height: 32px;">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                width: 18px; 
                height: 18px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.2);
                z-index: 2;
              "></div>
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%);
                width: 32px; 
                height: 32px; 
                border-radius: 50%;
                animation: pulse-user 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse-user {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                50% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
              }
            </style>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(
            `<div style="text-align: center; padding: 4px;">
              <strong style="color: #3b82f6; font-size: 14px;">📍 Your Location</strong>
            </div>`,
            { className: "custom-popup" },
          )

        markersRef.current.push(userMarker)
      }

      hospitals.forEach((hospital) => {
        if (!hospital.coordinates) return

        const isSelected = hospital.id === selectedHospitalId
        const color = isSelected ? "#dc2626" : "#059669"
        const size = isSelected ? 44 : 36

        const icon = L.divIcon({
          className: "custom-hospital-marker",
          html: `
            <div style="
              position: relative;
              width: ${size}px;
              height: ${size}px;
            ">
              ${
                isSelected
                  ? `
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: ${color};
                  width: ${size + 16}px;
                  height: ${size + 16}px;
                  border-radius: 50%;
                  opacity: 0.2;
                  animation: pulse-hospital 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                "></div>
              `
                  : ""
              }
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
                width: ${size}px; 
                height: ${size}px; 
                border-radius: 50%; 
                border: 4px solid white; 
                box-shadow: 0 4px 16px rgba(0,0,0,0.25), 0 0 0 3px ${color}33;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${isSelected ? "22px" : "20px"};
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                ${isSelected ? "animation: bounce-hospital 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);" : ""}
              ">
                <svg width="${isSelected ? "24" : "20"}" height="${isSelected ? "24" : "20"}" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                </svg>
              </div>
            </div>
            <style>
              @keyframes bounce-hospital {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
              }
              @keyframes pulse-hospital {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
                50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
              }
            </style>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const marker = L.marker([hospital.coordinates.lat, hospital.coordinates.lng], {
          icon,
          zIndexOffset: isSelected ? 900 : 500,
        })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width: 240px; font-family: system-ui; padding: 4px;">
              <div style="
                background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
                color: white;
                padding: 12px;
                margin: -4px -4px 8px -4px;
                border-radius: 8px 8px 0 0;
              ">
                <strong style="font-size: 16px; display: block;">${hospital.name}</strong>
                <div style="margin-top: 6px; opacity: 0.95; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  ${hospital.distance_km} km away
                </div>
              </div>
              <div style="padding: 8px 4px;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                  <div style="
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #bfdbfe;
                  ">
                    <div style="color: #1e40af; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">General</div>
                    <strong style="color: #3b82f6; font-size: 20px; display: block; margin-top: 4px;">${hospital.general_beds_available}</strong>
                  </div>
                  <div style="
                    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #fed7aa;
                  ">
                    <div style="color: #c2410c; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Emergency</div>
                    <strong style="color: #f59e0b; font-size: 20px; display: block; margin-top: 4px;">${hospital.emergency_beds_available}</strong>
                  </div>
                  <div style="
                    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #fecaca;
                  ">
                    <div style="color: #991b1b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">ICU</div>
                    <strong style="color: #ef4444; font-size: 20px; display: block; margin-top: 4px;">${hospital.icu_beds_available}</strong>
                  </div>
                  <div style="
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    border: 1px solid #bbf7d0;
                  ">
                    <div style="color: #166534; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Available</div>
                    <strong style="color: #059669; font-size: 20px; display: block; margin-top: 4px;">✓</strong>
                  </div>
                </div>
              </div>
            </div>
          `,
            { maxWidth: 280, className: "custom-hospital-popup" },
          )

        markersRef.current.push(marker)

        if (isSelected) {
          marker.openPopup()
        }
      })

      if (selectedHospitalId && userLocation) {
        const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId)
        if (selectedHospital?.coordinates) {
          if (routePolylineRef.current) {
            try {
              map.removeLayer(routePolylineRef.current)
            } catch (e) {
              console.error("Error removing route:", e)
            }
          }

          try {
            // Fetch route from OSRM (Open Source Routing Machine)
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedHospital.coordinates.lng},${selectedHospital.coordinates.lat}?overview=full&geometries=geojson`
            const response = await fetch(osrmUrl)
            const data = await response.json()

            if (data.code === "Ok" && data.routes && data.routes[0]) {
              const route = data.routes[0]
              const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) // Convert [lng, lat] to [lat, lng]

              const routeLine = L.polyline(coordinates, {
                color: "#dc2626",
                weight: 5,
                opacity: 0.9,
                lineJoin: "round",
                lineCap: "round",
                className: "animated-route",
              }).addTo(map)

              routePolylineRef.current = routeLine

              // Add directional arrows along the route
              const arrowInterval = Math.floor(coordinates.length / 5)
              for (let i = arrowInterval; i < coordinates.length; i += arrowInterval) {
                const arrowIcon = L.divIcon({
                  className: "route-arrow",
                  html: `<div style="color: #dc2626; font-size: 20px; transform: rotate(${getArrowRotation(coordinates[i - 1], coordinates[i])}deg);">▶</div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })
                const arrowMarker = L.marker(coordinates[i], { icon: arrowIcon, interactive: false }).addTo(map)
                markersRef.current.push(arrowMarker)
              }

              const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng],
              ])
              map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 })
            } else {
              // Fallback to straight line if OSRM fails
              const routeLine = L.polyline(
                [
                  [userLocation.lat, userLocation.lng],
                  [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng],
                ],
                {
                  color: "#dc2626",
                  weight: 5,
                  opacity: 0.8,
                  dashArray: "15, 10",
                  lineJoin: "round",
                  lineCap: "round",
                  className: "animated-route",
                },
              ).addTo(map)

              routePolylineRef.current = routeLine

              const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng],
              ])
              map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 })
            }
          } catch (error) {
            console.error("Error fetching route:", error)
            // Fallback to straight line
            const routeLine = L.polyline(
              [
                [userLocation.lat, userLocation.lng],
                [selectedHospital.coordinates.lat, selectedHospital.coordinates.lng],
              ],
              {
                color: "#dc2626",
                weight: 5,
                opacity: 0.8,
                dashArray: "15, 10",
                lineJoin: "round",
                lineCap: "round",
                className: "animated-route",
              },
            ).addTo(map)

            routePolylineRef.current = routeLine
          }
        }
      } else if (!selectedHospitalId && userLocation) {
        if (markersRef.current.length > 1) {
          const bounds = L.latLngBounds(markersRef.current.map((m) => m.getLatLng()))
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
        }
      } else {
        if (markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current)
          map.fitBounds(group.getBounds().pad(0.15))
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

    // Helper function to calculate arrow rotation
    const getArrowRotation = (from: [number, number], to: [number, number]) => {
      const dy = to[0] - from[0]
      const dx = to[1] - from[1]
      return (Math.atan2(dy, dx) * 180) / Math.PI
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
      <style>{`
        .custom-hospital-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        .custom-hospital-popup .leaflet-popup-content {
          margin: 0;
          width: 280px !important;
        }
        .custom-hospital-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .animated-route {
          animation: flow 1.5s linear infinite;
        }
        @keyframes flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .leaflet-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
        .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
          border-radius: 8px !important;
          margin-bottom: 4px !important;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(8px) !important;
          padding: 2px 8px !important;
          border-radius: 4px !important;
        }
        .route-arrow {
          pointer-events: none;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg shadow-lg overflow-hidden" />
    </>
  )
}
