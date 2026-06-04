import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { RulesLibrary } from "@/components/rules-library"

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppHeader />
        <main className="p-6">
          <RulesLibrary />
        </main>
      </div>
    </div>
  )
}
