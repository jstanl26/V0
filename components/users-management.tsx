"use client"

import * as React from "react"
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  Eye,
  Trash2,
  Pencil,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  useUser,
  roleLabels,
  rolePermissions,
  type AppUser,
} from "@/lib/user-context"

const permLabels: Record<keyof AppUser["permissions"], string> = {
  command: "指令管理",
  io: "输入输出管理",
  stats: "流量统计",
  rules: "规则策略库",
  users: "用户管理",
}

const roleIcons = {
  admin: ShieldCheck,
  operator: Shield,
  viewer: Eye,
}

export function UsersManagement() {
  const { currentUser, users, addUser, updateUser, deleteUser } = useUser()
  const [search, setSearch] = React.useState("")
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState<AppUser | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<AppUser | null>(null)

  // 仅管理员可访问；非管理员仅可见自己
  const isAdmin = currentUser.role === "admin"
  const visibleUsers = isAdmin
    ? users.filter(
        (u) =>
          u.displayName.includes(search) ||
          u.username.includes(search) ||
          u.org.includes(search)
      )
    : users.filter((u) => u.id === currentUser.id)

  // 新建用户表单
  const [form, setForm] = React.useState({
    username: "",
    displayName: "",
    password: "",
    role: "operator" as AppUser["role"],
    org: "",
    status: "active" as AppUser["status"],
  })

  const resetForm = () =>
    setForm({ username: "", displayName: "", password: "", role: "operator", org: "", status: "active" })

  const handleCreate = () => {
    if (!form.username || !form.displayName) return
    addUser(form)
    resetForm()
    setCreateOpen(false)
  }

  if (!isAdmin) {
    // 非管理员只展示自己的账户信息与权限
    const me = currentUser
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            用户管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">您当前为{roleLabels[me.role]}，仅可查看本人账户信息与权限。</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{me.displayName}</CardTitle>
            <CardDescription>{me.username} · {me.org}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(me.permissions)
                .filter(([, v]) => v)
                .map(([k]) => (
                  <Badge key={k} variant="secondary">
                    {permLabels[k as keyof AppUser["permissions"]]}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            用户管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理用户账号与权限。每个用户在指令管理与输入输出模块仅能查看其专属内容。
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" />
          新增用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">用户总数</span>
            <div className="mt-1 text-2xl font-semibold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">管理员</span>
            <div className="mt-1 text-2xl font-semibold">{users.filter((u) => u.role === "admin").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">操作员</span>
            <div className="mt-1 text-2xl font-semibold">{users.filter((u) => u.role === "operator").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">只读用户</span>
            <div className="mt-1 text-2xl font-semibold">{users.filter((u) => u.role === "viewer").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 用户列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">用户列表</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索用户名/姓名/机构"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户ID</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>登录名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>所属机构</TableHead>
                  <TableHead>权限</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.map((u) => {
                  const RoleIcon = roleIcons[u.role]
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.id}</TableCell>
                      <TableCell>{u.displayName}</TableCell>
                      <TableCell className="text-muted-foreground">{u.username}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="gap-1">
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[u.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{u.org}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {Object.entries(u.permissions).filter(([, v]) => v).length} 个模块
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.status === "active" ? (
                          <Badge variant="outline" className="gap-1 border-chart-2 text-chart-2">
                            <CheckCircle2 className="h-3 w-3" />
                            启用
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <XCircle className="h-3 w-3" />
                            禁用
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditUser(u)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={u.id === currentUser.id || u.username === "admin"}
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 新增用户对话框 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增用户</DialogTitle>
            <DialogDescription>创建新用户账号并分配角色与权限。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>登录名 *</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="如 operator2" />
            </div>
            <div className="space-y-2">
              <Label>姓名 *</Label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="如 赵工程师" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                初始密码
              </Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
            </div>
            <div className="space-y-2">
              <Label>所属机构</Label>
              <Input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="如 江苏分公司" />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AppUser["role"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="operator">操作员</SelectItem>
                  <SelectItem value="viewer">只读用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AppUser["status"] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="disabled">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* 角色权限预览 */}
          <div className="rounded-md border bg-muted/30 p-3">
            <span className="text-xs font-medium text-muted-foreground">该角色默认权限：</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(rolePermissions[form.role])
                .filter(([, v]) => v)
                .map(([k]) => (
                  <Badge key={k} variant="secondary">
                    {permLabels[k as keyof AppUser["permissions"]]}
                  </Badge>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!form.username || !form.displayName}>
              创建用户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户对话框 */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑用户权限</DialogTitle>
            <DialogDescription>{editUser?.displayName}（{editUser?.username}）</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>角色</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(v) => setEditUser({ ...editUser, role: v as AppUser["role"], permissions: rolePermissions[v as AppUser["role"]] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="operator">操作员</SelectItem>
                      <SelectItem value="viewer">只读用户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>状态</Label>
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      checked={editUser.status === "active"}
                      onCheckedChange={(c) => setEditUser({ ...editUser, status: c ? "active" : "disabled" })}
                    />
                    <span className="text-sm">{editUser.status === "active" ? "启用" : "禁用"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>模块权限</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(permLabels) as (keyof AppUser["permissions"])[]).map((k) => (
                    <label key={k} className="flex items-center justify-between rounded-md border p-2">
                      <span className="text-sm">{permLabels[k]}</span>
                      <Switch
                        checked={editUser.permissions[k]}
                        onCheckedChange={(c) =>
                          setEditUser({ ...editUser, permissions: { ...editUser.permissions, [k]: c } })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (editUser) {
                  updateUser(editUser.id, {
                    role: editUser.role,
                    status: editUser.status,
                    permissions: editUser.permissions,
                  })
                  setEditUser(null)
                }
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户「{deleteTarget?.displayName}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteUser(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
