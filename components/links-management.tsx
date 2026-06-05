"use client"

import * as React from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Server,
  Network,
  Settings,
  RefreshCw,
  Eye,
  Trash2,
  Power,
  Copy,
  Edit,
  Layers
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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { OperatorCodes, ProvinceCodes, SystemType } from "@/lib/command-types"

// 端口组类型
const portGroupTypes = [
  { value: "input", label: "输入端口组", description: "用于流量采集输入" },
  { value: "output", label: "输出端口组", description: "用于流量输出转发" },
]

// 端口类型选项
const portTypes = [
  { value: "GE", label: "千兆口 (GE)" },
  { value: "XGE", label: "万兆口 (XGE)" },
  { value: "25GE", label: "25G口 (25GE)" },
  { value: "40GE", label: "40G口 (40GE)" },
  { value: "100GE", label: "100G口 (100GE)" },
]

// 接入方式
const accessTypes = [
  { value: "split", label: "分光接入" },
  { value: "mirror", label: "镜像接入" },
]

// 模拟端口组数据
const mockPortGroups = [
  {
    id: "PG-001",
    name: "省网出口-输入端口组A",
    type: "input",
    comCode: "0013",
    effectProvince: ["110000", "120000"],
    effectSystem: ["2"],
    effectVendor: "华为",
    effectHouse: "北京亦庄数据中心",
    device: "DPI-CORE-01",
    ports: ["GE0/0/1", "GE0/0/2"],
    portType: "GE",
    vlanRange: "100-200",
    accessType: "split",
    bandwidth: 10000,
    status: "active",
    taskCount: 8,
    createdAt: "2024-03-15",
    description: "省网核心出口主链路输入端口组",
  },
  {
    id: "PG-002",
    name: "城域网出口-输入端口组B",
    type: "input",
    comCode: "0013",
    effectProvince: ["310000", "320000"],
    effectSystem: ["2"],
    effectVendor: "中兴",
    effectHouse: "上海浦东数据中心",
    device: "DPI-EDGE-01",
    ports: ["XGE0/0/1", "XGE0/0/2", "XGE0/0/3"],
    portType: "XGE",
    vlanRange: "300-500",
    accessType: "mirror",
    bandwidth: 40000,
    status: "active",
    taskCount: 12,
    createdAt: "2024-03-14",
    description: "城域网汇聚层输入端口组",
  },
  {
    id: "PG-003",
    name: "国家侧-输出端口组",
    type: "output",
    comCode: "0013",
    effectProvince: ["110000"],
    effectSystem: ["2"],
    effectVendor: "",
    effectHouse: "北京总部机房",
    device: "FORWARD-01",
    ports: ["100GE0/0/1"],
    portType: "100GE",
    vlanRange: "ALL",
    accessType: "split",
    bandwidth: 100000,
    status: "active",
    taskCount: 15,
    createdAt: "2024-03-13",
    description: "上报国家侧的输出端口组",
  },
  {
    id: "PG-004",
    name: "企业侧-输出端口组",
    type: "output",
    comCode: "0013",
    effectProvince: ["440000"],
    effectSystem: ["2", "3"],
    effectVendor: "华为",
    effectHouse: "广州天河数据中心",
    device: "FORWARD-02",
    ports: ["40GE0/0/1", "40GE0/0/2"],
    portType: "40GE",
    vlanRange: "600-800",
    accessType: "split",
    bandwidth: 80000,
    status: "inactive",
    taskCount: 0,
    createdAt: "2024-03-12",
    description: "发送至企业侧监测设备的输出端口组",
  },
  {
    id: "PG-005",
    name: "IDC出口-输入端口组",
    type: "input",
    comCode: "0013",
    effectProvince: ["330000"],
    effectSystem: ["5"],
    effectVendor: "锐捷",
    effectHouse: "杭州云栖数据中心",
    device: "DPI-IDC-01",
    ports: ["100GE0/0/1", "100GE0/0/2"],
    portType: "100GE",
    vlanRange: "ALL",
    accessType: "split",
    bandwidth: 200000,
    status: "active",
    taskCount: 20,
    createdAt: "2024-03-10",
    description: "IDC出口大流量采集端口组",
  },
]

// 统计数据
const stats = [
  { label: "端口组总数", value: "5", icon: Layers, color: "text-primary" },
  { label: "输入端口组", value: "3", icon: Network, color: "text-info" },
  { label: "输出端口组", value: "2", icon: Zap, color: "text-success" },
  { label: "关联任务", value: "55", icon: CheckCircle2, color: "text-warning" },
]

export function LinksManagement() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState<typeof mockPortGroups[0] | null>(null)
  
  // 新建端口组表单状态
  const [newPortGroup, setNewPortGroup] = React.useState({
    name: "",
    type: "input",
    comCode: "",
    effectProvince: [] as string[],
    effectSystem: ["2"],
    effectVendor: "",
    effectHouse: "",
    device: "",
    ports: "",
    portType: "GE",
    vlanRange: "",
    accessType: "split",
    bandwidth: 10000,
    description: "",
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            启用
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            停用
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "input":
        return <Badge className="bg-primary/10 text-primary border-primary/20">输入端口组</Badge>
      case "output":
        return <Badge className="bg-info/10 text-info border-info/20">输出端口组</Badge>
      default:
        return null
    }
  }

  const filteredGroups = mockPortGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || group.type === selectedType
    const matchesStatus = selectedStatus === "all" || group.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const formatBandwidth = (bandwidth: number) => {
    if (bandwidth >= 1000) {
      return `${(bandwidth / 1000).toFixed(0)}Gbps`
    }
    return `${bandwidth}Mbps`
  }

  const toggleProvince = (code: string) => {
    setNewPortGroup(prev => ({
      ...prev,
      effectProvince: prev.effectProvince.includes(code)
        ? prev.effectProvince.filter(p => p !== code)
        : [...prev.effectProvince, code]
    }))
  }

  const toggleSystem = (code: string) => {
    setNewPortGroup(prev => ({
      ...prev,
      effectSystem: prev.effectSystem.includes(code)
        ? prev.effectSystem.filter(s => s !== code)
        : [...prev.effectSystem, code]
    }))
  }

  const handleViewDetail = (group: typeof mockPortGroups[0]) => {
    setSelectedGroup(group)
    setViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">端口组管理</h1>
          <p className="text-sm text-muted-foreground mt-1">预配置输入/输出端口组，便于指令下发时快速选择</p>
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
                新建端口组
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新建端口组</DialogTitle>
                <DialogDescription>
                  配置端口组信息，包含指令对象字段和网络配置
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="object">指令对象</TabsTrigger>
                  <TabsTrigger value="network">网络配置</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>端口组名称 <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="输入端口组名称"
                        value={newPortGroup.name}
                        onChange={(e) => setNewPortGroup(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>端口组类型 <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newPortGroup.type}
                        onValueChange={(v) => setNewPortGroup(prev => ({ ...prev, type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {portGroupTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div>{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>端口组描述</Label>
                    <Textarea 
                      placeholder="输入端口组描述（可选）"
                      value={newPortGroup.description}
                      onChange={(e) => setNewPortGroup(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="object" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>运营商代码 <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newPortGroup.comCode}
                        onValueChange={(v) => setNewPortGroup(prev => ({ ...prev, comCode: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择运营商" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(OperatorCodes).map(([code, name]) => (
                            <SelectItem key={code} value={code}>{name} ({code})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>生效厂商</Label>
                      <Input 
                        placeholder="输入生效厂商（可选）"
                        value={newPortGroup.effectVendor}
                        onChange={(e) => setNewPortGroup(prev => ({ ...prev, effectVendor: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>生效机房</Label>
                    <Input 
                      placeholder="输入生效机房（可选）"
                      value={newPortGroup.effectHouse}
                      onChange={(e) => setNewPortGroup(prev => ({ ...prev, effectHouse: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>生效系统 <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SystemType).map(([key, label]) => (
                        <Badge
                          key={key}
                          variant={newPortGroup.effectSystem.includes(key) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleSystem(key)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>生效省份 <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-secondary/50 max-h-[200px] overflow-y-auto">
                      {Object.entries(ProvinceCodes).map(([code, name]) => (
                        <div
                          key={code}
                          onClick={() => toggleProvince(code)}
                          className={`px-2 py-1.5 rounded text-xs cursor-pointer transition-colors text-center ${
                            newPortGroup.effectProvince.includes(code)
                              ? "bg-primary text-primary-foreground"
                              : "bg-background hover:bg-muted"
                          }`}
                        >
                          {String(name).replace(/省|市|自治区|壮族|回族|维吾尔/g, "")}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">已选择 {newPortGroup.effectProvince.length} 个省份</p>
                  </div>
                </TabsContent>

                <TabsContent value="network" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>采集设备 <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="如: DPI-CORE-01"
                        value={newPortGroup.device}
                        onChange={(e) => setNewPortGroup(prev => ({ ...prev, device: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>端口类型 <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newPortGroup.portType}
                        onValueChange={(v) => setNewPortGroup(prev => ({ ...prev, portType: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {portTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>端口列表 <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="多个端口用逗号分隔，如: GE0/0/1, GE0/0/2"
                      value={newPortGroup.ports}
                      onChange={(e) => setNewPortGroup(prev => ({ ...prev, ports: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">输入端口标识，多个端口用逗号分隔</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>VLAN范围</Label>
                      <Input 
                        placeholder="如: 100-200 或 ALL"
                        value={newPortGroup.vlanRange}
                        onChange={(e) => setNewPortGroup(prev => ({ ...prev, vlanRange: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>接入方式 <span className="text-destructive">*</span></Label>
                      <Select 
                        value={newPortGroup.accessType}
                        onValueChange={(v) => setNewPortGroup(prev => ({ ...prev, accessType: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accessTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>带宽容量 (Mbps)</Label>
                    <Input 
                      type="number"
                      placeholder="10000"
                      value={newPortGroup.bandwidth}
                      onChange={(e) => setNewPortGroup(prev => ({ ...prev, bandwidth: Number(e.target.value) }))}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setAddDialogOpen(false)}>
                  创建端口组
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

      {/* 端口组类型快捷筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType("all")}
        >
          全部类型
        </Button>
        {portGroupTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type.value)}
            className="gap-1"
          >
            {type.value === "input" ? <Network className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
            {type.label}
          </Button>
        ))}
      </div>

      {/* 端口组列表 */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">端口组列表</CardTitle>
              <CardDescription>共 {filteredGroups.length} 个端口组</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索端口组..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>端口组名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>运营商</TableHead>
                <TableHead>设备/端口</TableHead>
                <TableHead>带宽容量</TableHead>
                <TableHead>生效省份</TableHead>
                <TableHead className="text-right">关联任务</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-xs text-muted-foreground">{group.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(group.type)}</TableCell>
                  <TableCell className="text-sm">
                    {OperatorCodes[group.comCode as keyof typeof OperatorCodes]}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Server className="h-3.5 w-3.5 text-muted-foreground" />
                        {group.device}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {group.ports.join(", ")} / VLAN {group.vlanRange}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatBandwidth(group.bandwidth)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {group.effectProvince.slice(0, 2).map(code => (
                        <Badge key={code} variant="outline" className="text-xs">
                          {String(ProvinceCodes[code as keyof typeof ProvinceCodes] || code).replace(/省|市|自治区|壮族|回族|维吾尔/g, "")}
                        </Badge>
                      ))}
                      {group.effectProvince.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{group.effectProvince.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{group.taskCount}</TableCell>
                  <TableCell>{getStatusBadge(group.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(group)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑配置
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          复制端口组
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Power className="h-4 w-4 mr-2" />
                          {group.status === "inactive" ? "启用端口组" : "停用端口组"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除端口组
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

      {/* 详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>端口组详情</DialogTitle>
            <DialogDescription>
              {selectedGroup?.id} - {selectedGroup?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">端口组类型</Label>
                  <div className="mt-1">{getTypeBadge(selectedGroup.type)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedGroup.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">运营商</Label>
                  <p className="text-sm mt-1">{OperatorCodes[selectedGroup.comCode as keyof typeof OperatorCodes]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">生效厂商</Label>
                  <p className="text-sm mt-1">{selectedGroup.effectVendor || "-"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">生效机房</Label>
                <p className="text-sm mt-1">{selectedGroup.effectHouse || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">生效省份</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedGroup.effectProvince.map(code => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {ProvinceCodes[code as keyof typeof ProvinceCodes]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">生效系统</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedGroup.effectSystem.map(code => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {SystemType[code as keyof typeof SystemType]}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">采集设备</Label>
                  <p className="text-sm mt-1">{selectedGroup.device}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">接入方式</Label>
                  <p className="text-sm mt-1">{selectedGroup.accessType === "split" ? "分光接入" : "镜像接入"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">端口列表</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedGroup.ports.map(port => (
                    <Badge key={port} variant="secondary" className="font-mono text-xs">
                      {port}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">VLAN范围</Label>
                  <p className="text-sm mt-1 font-mono">{selectedGroup.vlanRange}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">带宽容量</Label>
                  <p className="text-sm mt-1 font-mono">{formatBandwidth(selectedGroup.bandwidth)}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">描述</Label>
                <p className="text-sm mt-1">{selectedGroup.description || "-"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              编辑配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
