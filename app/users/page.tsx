import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { UsersManagement } from "@/components/users-management"

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppHeader />
        <main className="p-4 lg:p-6">
          <UsersManagement />
        </main>
      </div>
    </div>
  )
}
