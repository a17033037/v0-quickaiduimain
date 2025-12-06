"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Activity, Home, LayoutDashboard, Shield } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/emergency", label: "Emergency", icon: Activity },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin", label: "Admin", icon: Shield },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-all lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      <nav
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-xl z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              QuickAid
            </span>
          </div>

          <div className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active ? "bg-red-50 text-red-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            QuickAid Emergency System
            <br />
            Real-time Hospital Tracking
          </p>
        </div>
      </nav>

      <div className="hidden lg:block w-64" />
    </>
  )
}
