import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { ReportsManagement } from "@/components/reports-management"

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppHeader />
        <main className="p-6">
          <ReportsManagement />
        </main>
      </div>
    </div>
  )
}
