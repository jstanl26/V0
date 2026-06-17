"use client"

import * as React from "react"

export interface AppUser {
  id: string
  username: string
  displayName: string
  role: "admin" | "operator" | "viewer"
  org: string
  status: "active" | "disabled"
  createdAt: string
  // 权限：可访问的模块
  permissions: {
    command: boolean // 指令管理
    io: boolean // 输入输出管理
    stats: boolean // 流量统计
    rules: boolean // 规则策略库
    users: boolean // 用户管理
  }
}

// 角色权限模板
export const rolePermissions: Record<AppUser["role"], AppUser["permissions"]> = {
  admin: { command: true, io: true, stats: true, rules: true, users: true },
  operator: { command: true, io: true, stats: true, rules: true, users: false },
  viewer: { command: true, io: false, stats: true, rules: false, users: false },
}

export const roleLabels: Record<AppUser["role"], string> = {
  admin: "管理员",
  operator: "操作员",
  viewer: "只读用户",
}

// 模拟初始用户列表
const initialUsers: AppUser[] = [
  {
    id: "U-001",
    username: "admin",
    displayName: "系统管理员",
    role: "admin",
    org: "集团网络安全部",
    status: "active",
    createdAt: "2024-01-01",
    permissions: rolePermissions.admin,
  },
  {
    id: "U-002",
    username: "operator1",
    displayName: "张运维",
    role: "operator",
    org: "北京分公司",
    status: "active",
    createdAt: "2024-02-10",
    permissions: rolePermissions.operator,
  },
  {
    id: "U-003",
    username: "analyst",
    displayName: "李分析",
    role: "operator",
    org: "上海分公司",
    status: "active",
    createdAt: "2024-02-15",
    permissions: rolePermissions.operator,
  },
  {
    id: "U-004",
    username: "monitor",
    displayName: "王监控",
    role: "viewer",
    org: "广东分公司",
    status: "active",
    createdAt: "2024-03-01",
    permissions: rolePermissions.viewer,
  },
]

interface UserContextValue {
  currentUser: AppUser
  users: AppUser[]
  switchUser: (userId: string) => void
  addUser: (user: Omit<AppUser, "id" | "createdAt" | "permissions"> & { password?: string }) => void
  updateUser: (userId: string, updates: Partial<AppUser>) => void
  deleteUser: (userId: string) => void
}

const UserContext = React.createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = React.useState<AppUser[]>(initialUsers)
  const [currentUserId, setCurrentUserId] = React.useState<string>("U-001")

  const currentUser = users.find((u) => u.id === currentUserId) || users[0]

  const switchUser = (userId: string) => setCurrentUserId(userId)

  const addUser: UserContextValue["addUser"] = (user) => {
    const newUser: AppUser = {
      id: `U-${String(users.length + 1).padStart(3, "0")}`,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      org: user.org,
      status: user.status,
      createdAt: new Date().toISOString().slice(0, 10),
      permissions: rolePermissions[user.role],
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser: UserContextValue["updateUser"] = (userId, updates) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const merged = { ...u, ...updates }
        // 角色变化时同步权限模板
        if (updates.role && !updates.permissions) {
          merged.permissions = rolePermissions[updates.role]
        }
        return merged
      })
    )
  }

  const deleteUser: UserContextValue["deleteUser"] = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <UserContext.Provider value={{ currentUser, users, switchUser, addUser, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = React.useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
