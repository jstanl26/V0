import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { LinksManagement } from "@/components/links-management"

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppHeader />
        <main className="p-6">
          <LinksManagement />
        </main>
      </div>
    </div>
  )
}
