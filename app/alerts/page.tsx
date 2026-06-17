import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { AlertsManagement } from "@/components/alerts-management"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppHeader />
        <main className="p-6">
          <AlertsManagement />
        </main>
      </div>
    </div>
  )
}
