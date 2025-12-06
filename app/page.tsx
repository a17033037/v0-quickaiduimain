import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, Ambulance, HeartPulse, MapPin } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 lg:py-24">
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <Activity className="h-4 w-4" />
            <span>Real-Time Emergency Response</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance max-w-4xl">
            Get Emergency Care <span className="text-red-600">When Every Second Counts</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            QuickAid connects you to the nearest available hospital beds in real-time. Fast, accurate, and potentially
            life-saving.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
              <Link href="/emergency">
                <Ambulance className="mr-2 h-5 w-5" />
                Report Emergency
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">Real-Time Location</h3>
              <p className="text-muted-foreground text-pretty">
                Instantly find hospitals near you with live bed availability data
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Live Bed Tracking</h3>
              <p className="text-muted-foreground text-pretty">
                See available general, emergency, and ICU beds updated in real-time
              </p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-green-100 rounded-full">
                <HeartPulse className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Emergency Priority</h3>
              <p className="text-muted-foreground text-pretty">
                Quick response for cardiac, trauma, stroke, and other critical emergencies
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <Card className="bg-gradient-to-r from-red-600 to-red-500 text-white p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold">Every Second Matters</h2>
              <p className="text-red-50 text-pretty max-w-2xl">
                In a medical emergency, finding the right hospital quickly can save lives. QuickAid helps you make
                informed decisions fast.
              </p>
            </div>
            <Button asChild size="lg" className="bg-white text-red-600 hover:bg-red-50 shrink-0">
              <Link href="/emergency">
                <Ambulance className="mr-2 h-5 w-5" />
                Get Help Now
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
