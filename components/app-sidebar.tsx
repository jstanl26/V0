"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Network,
  BarChart3,
  BookOpen,
  ArrowLeftRight,
  Users,
  ChevronDown,
  Activity,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/lib/user-context"

type PermKey = "command" | "io" | "stats" | "rules" | "users"

const navItems: {
  title: string
  href: string
  icon: typeof LayoutDashboard
  perm?: PermKey
}[] = [
  { title: "总览", href: "/", icon: LayoutDashboard },
  { title: "指令管理", href: "/traffic", icon: Network, perm: "command" },
  { title: "流量统计", href: "/reports", icon: BarChart3, perm: "stats" },
  { title: "规则策略库", href: "/rules", icon: BookOpen, perm: "rules" },
  { title: "输入输出管理", href: "/links", icon: ArrowLeftRight, perm: "io" },
  { title: "用户管理", href: "/users", icon: Users, perm: "users" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser } = useUser()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const visibleItems = navItems.filter(
    (item) => !item.perm || currentUser.permissions[item.perm]
  )

  return (
    <>
      {/* 移动端菜单按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-primary-foreground hover:bg-sidebar-accent"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 border-b border-sidebar-border px-4 h-14",
            collapsed && "justify-center px-2"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">基础采集</span>
                <span className="text-[10px] text-sidebar-foreground/70">能力平台</span>
              </div>
            )}
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 p-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-foreground")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </nav>

          {/* 折叠按钮 */}
          <div className="border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                !collapsed && "justify-start"
              )}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed ? "rotate-[-90deg]" : "rotate-90"
                )}
              />
              {!collapsed && <span className="ml-2">收起菜单</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
