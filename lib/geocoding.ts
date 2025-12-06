// Utility functions for geocoding and reverse geocoding using Nominatim (OpenStreetMap)

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "QuickAid Emergency Response System",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data = await response.json()

    // Format address nicely
    const address = data.address
    const parts = []

    if (address.road) parts.push(address.road)
    if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb)
    if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village)
    if (address.state) parts.push(address.state)

    return parts.length > 0 ? parts.join(", ") : data.display_name
  } catch (error) {
    console.error("[v0] Reverse geocoding error:", error)
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

export function parseLocation(location: string): { lat: number; lng: number } | null {
  const parts = location.split(",").map((p) => Number.parseFloat(p.trim()))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] }
  }
  return null
}
