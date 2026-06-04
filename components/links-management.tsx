"use client"

import * as React from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Zap,
  Server,
  Network,
  Settings,
  RefreshCw,
  Eye,
  Trash2,
  Power,
  ArrowUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

// 模拟链路数据
const mockLinks = [
  {
    id: "LNK-001",
    name: "省网出口-主链路A",
    type: "province",
    accessType: "分光",
    device: "DPI-CORE-01",
    port: "GE0/0/1",
    vlan: "100-200",
    status: "online",
    bandwidth: 10000,
    currentRate: 7850,
    packetRate: 1250000,
    taskCount: 8,
    lastCheck: "2024-03-20 14:30:00",
  },
  {
    id: "LNK-002",
    name: "省网出口-主链路B",
    type: "province",
    accessType: "分光",
    device: "DPI-CORE-01",
    port: "GE0/0/2",
    vlan: "100-200",
    status: "online",
    bandwidth: 10000,
    currentRate: 6420,
    packetRate: 980000,
    taskCount: 6,
    lastCheck: "2024-03-20 14:30:00",
  },
  {
    id: "LNK-003",
    name: "城域网出口-区域1",
    type: "metro",
    accessType: "镜像",
    device: "DPI-EDGE-01",
    port: "XGE0/0/1",
    vlan: "300-400",
    status: "online",
    bandwidth: 40000,
    currentRate: 28500,
    packetRate: 4200000,
    taskCount: 12,
    lastCheck: "2024-03-20 14:30:00",
  },
  {
    id: "LNK-004",
    name: "城域网出口-区域2",
    type: "metro",
    accessType: "镜像",
    device: "DPI-EDGE-02",
    port: "XGE0/0/1",
    vlan: "500-600",
    status: "warning",
    bandwidth: 40000,
    currentRate: 38200,
    packetRate: 5800000,
    taskCount: 10,
    lastCheck: "2024-03-20 14:28:00",
  },
  {
    id: "LNK-005",
    name: "备份链路-省网",
    type: "province",
    accessType: "分光",
    device: "DPI-CORE-02",
    port: "GE0/0/1",
    vlan: "100-200",
    status: "offline",
    bandwidth: 10000,
    currentRate: 0,
    packetRate: 0,
    taskCount: 0,
    lastCheck: "2024-03-20 10:00:00",
  },
  {
    id: "LNK-006",
    name: "IDC出口-数据中心",
    type: "idc",
    accessType: "分光",
    device: "DPI-IDC-01",
    port: "100GE0/0/1",
    vlan: "ALL",
    status: "online",
    bandwidth: 100000,
    currentRate: 45600,
    packetRate: 7200000,
    taskCount: 15,
    lastCheck: "2024-03-20 14:30:00",
  },
]

// 统计数据
const stats = [
  { label: "链路总数", value: "6", icon: Network, color: "text-primary" },
  { label: "在线链路", value: "5", icon: CheckCircle2, color: "text-success" },
  { label: "告警链路", value: "1", icon: AlertCircle, color: "text-warning" },
  { label: "总带宽", value: "210G", icon: Zap, color: "text-cyan-400" },
]

export function LinksManagement() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            在线
          </Badge>
        )
      case "offline":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            离线
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
            告警
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "province":
        return <Badge variant="outline" className="text-blue-400 border-blue-500/30">省网</Badge>
      case "metro":
        return <Badge variant="outline" className="text-green-400 border-green-500/30">城域网</Badge>
      case "idc":
        return <Badge variant="outline" className="text-purple-400 border-purple-500/30">IDC</Badge>
      default:
        return null
    }
  }

  const filteredLinks = mockLinks.filter(link => {
    const matchesSearch = link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || link.type === selectedType
    const matchesStatus = selectedStatus === "all" || link.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const formatRate = (rate: number) => {
    if (rate >= 1000) {
      return `${(rate / 1000).toFixed(1)}G`
    }
    return `${rate}M`
  }

  const formatPacketRate = (rate: number) => {
    if (rate >= 1000000) {
      return `${(rate / 1000000).toFixed(1)}Mpps`
    }
    return `${(rate / 1000).toFixed(0)}Kpps`
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">采集链路管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理流量采集链路接入与监控</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新状态
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加链路
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>添加采集链路</DialogTitle>
                <DialogDescription>
                  配置新的流量采集链路接入
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>链路名称</Label>
                  <Input placeholder="输入链路名称" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>链路类型</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="province">省网出口</SelectItem>
                        <SelectItem value="metro">城域网出口</SelectItem>
                        <SelectItem value="idc">IDC出口</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>接入方式</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="split">分光</SelectItem>
                        <SelectItem value="mirror">镜像</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>采集设备</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择设备" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dpi-core-01">DPI-CORE-01</SelectItem>
                        <SelectItem value="dpi-core-02">DPI-CORE-02</SelectItem>
                        <SelectItem value="dpi-edge-01">DPI-EDGE-01</SelectItem>
                        <SelectItem value="dpi-edge-02">DPI-EDGE-02</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>端口</Label>
                    <Input placeholder="如: GE0/0/1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>VLAN范围</Label>
                    <Input placeholder="如: 100-200 或 ALL" />
                  </div>
                  <div className="space-y-2">
                    <Label>带宽(Mbps)</Label>
                    <Input type="number" placeholder="10000" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setAddDialogOpen(false)}>
                  添加链路
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 链路列表 */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">链路列表</CardTitle>
              <CardDescription>共 {filteredLinks.length} 条链路</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索链路..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="province">省网</SelectItem>
                  <SelectItem value="metro">城域网</SelectItem>
                  <SelectItem value="idc">IDC</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="warning">告警</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>链路名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>接入方式</TableHead>
                <TableHead>设备/端口</TableHead>
                <TableHead>带宽使用</TableHead>
                <TableHead>包速率</TableHead>
                <TableHead className="text-right">关联任务</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{link.name}</div>
                      <div className="text-xs text-muted-foreground">{link.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(link.type)}</TableCell>
                  <TableCell className="text-sm">{link.accessType}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Server className="h-3.5 w-3.5 text-muted-foreground" />
                        {link.device}
                      </div>
                      <div className="text-xs text-muted-foreground">{link.port} / VLAN {link.vlan}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-32">
                      <div className="flex justify-between text-xs">
                        <span>{formatRate(link.currentRate)}</span>
                        <span className="text-muted-foreground">/ {formatRate(link.bandwidth)}</span>
                      </div>
                      <Progress 
                        value={(link.currentRate / link.bandwidth) * 100} 
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatPacketRate(link.packetRate)}
                  </TableCell>
                  <TableCell className="text-right">{link.taskCount}</TableCell>
                  <TableCell>{getStatusBadge(link.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="h-4 w-4 mr-2" />
                          流量监控
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          配置修改
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Power className="h-4 w-4 mr-2" />
                          {link.status === "offline" ? "启用链路" : "停用链路"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除链路
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
