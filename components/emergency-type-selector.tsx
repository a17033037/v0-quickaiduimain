"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import type { EmergencyType } from "@/lib/types"
import { emergencyTypeLabels } from "@/lib/types"
import { Heart, Car, Brain, Wind, AlertTriangle, Baby } from "lucide-react"

interface EmergencyTypeSelectorProps {
  selected: EmergencyType | null
  onSelect: (type: EmergencyType) => void
}

const emergencyIcons: Record<EmergencyType, React.ReactNode> = {
  cardiac: <Heart className="h-5 w-5" />,
  accident: <Car className="h-5 w-5" />,
  stroke: <Brain className="h-5 w-5" />,
  respiratory: <Wind className="h-5 w-5" />,
  trauma: <AlertTriangle className="h-5 w-5" />,
  pediatric: <Baby className="h-5 w-5" />,
}

const emergencyColors: Record<EmergencyType, string> = {
  cardiac: "hover:bg-red-50 hover:border-red-300",
  accident: "hover:bg-orange-50 hover:border-orange-300",
  stroke: "hover:bg-purple-50 hover:border-purple-300",
  respiratory: "hover:bg-blue-50 hover:border-blue-300",
  trauma: "hover:bg-yellow-50 hover:border-yellow-300",
  pediatric: "hover:bg-pink-50 hover:border-pink-300",
}

const selectedColors: Record<EmergencyType, string> = {
  cardiac: "bg-red-100 border-red-500 text-red-700",
  accident: "bg-orange-100 border-orange-500 text-orange-700",
  stroke: "bg-purple-100 border-purple-500 text-purple-700",
  respiratory: "bg-blue-100 border-blue-500 text-blue-700",
  trauma: "bg-yellow-100 border-yellow-500 text-yellow-700",
  pediatric: "bg-pink-100 border-pink-500 text-pink-700",
}

export default function EmergencyTypeSelector({ selected, onSelect }: EmergencyTypeSelectorProps) {
  const types: EmergencyType[] = ["cardiac", "accident", "stroke", "respiratory", "trauma", "pediatric"]

  return (
    <div className="grid grid-cols-2 gap-2">
      {types.map((type) => (
        <Card
          key={type}
          className={`p-3 cursor-pointer transition-all border-2 ${
            selected === type ? selectedColors[type] : `border-gray-200 ${emergencyColors[type]}`
          }`}
          onClick={() => onSelect(type)}
        >
          <div className="flex items-center gap-2">
            <div className="shrink-0">{emergencyIcons[type]}</div>
            <span className="text-sm font-medium leading-tight">{emergencyTypeLabels[type]}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
