import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { TrafficPage } from "@/components/traffic-page"

export default function Traffic() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60 transition-all duration-300">
        <AppHeader />
        <main className="p-4 lg:p-6">
          <TrafficPage />
        </main>
      </div>
    </div>
  )
}
