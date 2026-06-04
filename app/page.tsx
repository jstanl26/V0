import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { DashboardOverview } from "@/components/dashboard-overview"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60 transition-all duration-300">
        <AppHeader />
        <main className="p-4 lg:p-6">
          <DashboardOverview />
        </main>
      </div>
    </div>
  )
}
