"use client"

import * as React from "react"
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Layers,
  Globe,
  Shield,
  FileCode,
  AlertTriangle,
  ChevronDown,
  Download,
  Upload,
  Eye
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// 规则类型配置
const ruleTypes = [
  { value: "five-tuple", label: "五元组", icon: Layers, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "cs", label: "CS规则", icon: Globe, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  { value: "host", label: "Host", icon: Globe, color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { value: "sni", label: "SNI", icon: Shield, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { value: "url", label: "URL", icon: Globe, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { value: "signature", label: "特征码", icon: FileCode, color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { value: "protocol", label: "协议头", icon: Layers, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { value: "anomaly", label: "异常包", icon: AlertTriangle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
]

// 模拟规则数据
const mockRules = [
  {
    id: "R-2024-001",
    name: "HTTP明文流量筛选",
    type: "five-tuple",
    source: "国家指令",
    status: "active",
    priority: 1,
    conditions: "dst_port=80,443 AND protocol=TCP",
    hitCount: 1234567,
    taskCount: 5,
    createdAt: "2024-03-15",
    updatedAt: "2024-03-20",
  },
  {
    id: "R-2024-002",
    name: "重点域名监测",
    type: "host",
    source: "省级指令",
    status: "active",
    priority: 2,
    conditions: "host CONTAINS example.com",
    hitCount: 567890,
    taskCount: 3,
    createdAt: "2024-03-14",
    updatedAt: "2024-03-19",
  },
  {
    id: "R-2024-003",
    name: "TLS SNI特定目标",
    type: "sni",
    source: "本地配置",
    status: "active",
    priority: 3,
    conditions: "sni MATCHES *.target.cn",
    hitCount: 234567,
    taskCount: 2,
    createdAt: "2024-03-13",
    updatedAt: "2024-03-18",
  },
  {
    id: "R-2024-004",
    name: "异常TCP标志位检测",
    type: "anomaly",
    source: "国家指令",
    status: "inactive",
    priority: 4,
    conditions: "tcp_flags ABNORMAL",
    hitCount: 12345,
    taskCount: 1,
    createdAt: "2024-03-12",
    updatedAt: "2024-03-17",
  },
  {
    id: "R-2024-005",
    name: "特定URL路径匹配",
    type: "url",
    source: "省级指令",
    status: "active",
    priority: 5,
    conditions: "url PATH /api/v1/*",
    hitCount: 89012,
    taskCount: 4,
    createdAt: "2024-03-11",
    updatedAt: "2024-03-16",
  },
  {
    id: "R-2024-006",
    name: "恶意特征码识别",
    type: "signature",
    source: "国家指令",
    status: "active",
    priority: 6,
    conditions: "payload HEX 4d5a9000",
    hitCount: 3456,
    taskCount: 2,
    createdAt: "2024-03-10",
    updatedAt: "2024-03-15",
  },
  {
    id: "R-2024-007",
    name: "CS连接方向筛选",
    type: "cs",
    source: "本地配置",
    status: "draft",
    priority: 7,
    conditions: "direction=outbound AND cs_role=client",
    hitCount: 0,
    taskCount: 0,
    createdAt: "2024-03-09",
    updatedAt: "2024-03-14",
  },
]

// 统计数据
const stats = [
  { label: "规则总数", value: "156", icon: Layers, trend: "+12" },
  { label: "活跃规则", value: "134", icon: CheckCircle2, trend: "+8" },
  { label: "今日命中", value: "2.3M", icon: Tag, trend: "+15%" },
  { label: "关联任务", value: "45", icon: Clock, trend: "+3" },
]

export function RulesLibrary() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedRules, setSelectedRules] = React.useState<string[]>([])
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">启用</Badge>
      case "inactive":
        return <Badge className="bg-muted text-muted-foreground border-border">停用</Badge>
      case "draft":
        return <Badge className="bg-warning/10 text-warning border-warning/20">草稿</Badge>
      default:
        return null
    }
  }

  const getRuleTypeBadge = (type: string) => {
    const config = ruleTypes.find(t => t.value === type)
    if (!config) return null
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredRules = mockRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || rule.type === selectedType
    const matchesStatus = selectedStatus === "all" || rule.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedRules.length === filteredRules.length) {
      setSelectedRules([])
    } else {
      setSelectedRules(filteredRules.map(r => r.id))
    }
  }

  const toggleSelectRule = (id: string) => {
    setSelectedRules(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">规则策略库</h1>
          <p className="text-sm text-muted-foreground mt-1">管理流量筛选规则与匹配策略</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入规则
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出规则
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建规则
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新建筛选规则</DialogTitle>
                <DialogDescription>
                  创建新的流量筛选规则，支持多种规则类型和条件组合
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>规则名称</Label>
                    <Input placeholder="输入规则名称" />
                  </div>
                  <div className="space-y-2">
                    <Label>规则类型</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择规则类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>规则来源</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择来源" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">国家指令</SelectItem>
                        <SelectItem value="province">省级指令</SelectItem>
                        <SelectItem value="local">本地配置</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>优先级</Label>
                    <Input type="number" placeholder="1-100" min={1} max={100} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>规则条件</Label>
                  <Textarea 
                    placeholder="输入规则条件表达式，如: src_ip=192.168.1.0/24 AND dst_port=80"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    支持 AND、OR 逻辑组合，字段包括: src_ip, dst_ip, src_port, dst_port, protocol, host, sni, url 等
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>规则描述</Label>
                  <Textarea placeholder="输入规则描述（可选）" rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setCreateDialogOpen(false)}>
                  创建规则
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
                <div className="flex flex-col items-end gap-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-success">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 规则类型快捷筛选 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === "all" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedType("all")}
        >
          全部类型
        </Button>
        {ruleTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type.value)}
            className="gap-1"
          >
            <type.icon className="h-3.5 w-3.5" />
            {type.label}
          </Button>
        ))}
      </div>

      {/* 规则列表 */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">规则列表</CardTitle>
              <CardDescription>共 {filteredRules.length} 条规则</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索规则..."
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
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedRules.length === filteredRules.length && filteredRules.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>规则编号</TableHead>
                <TableHead>规则名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>条件</TableHead>
                <TableHead className="text-right">命中次数</TableHead>
                <TableHead className="text-right">关联任务</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRules.includes(rule.id)}
                      onCheckedChange={() => toggleSelectRule(rule.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {rule.id}
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{getRuleTypeBadge(rule.type)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rule.source}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {rule.conditions.length > 30 
                        ? rule.conditions.substring(0, 30) + "..." 
                        : rule.conditions}
                    </code>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {rule.hitCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{rule.taskCount}</TableCell>
                  <TableCell>{getStatusBadge(rule.status)}</TableCell>
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
                          <Edit className="h-4 w-4 mr-2" />
                          编辑规则
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          复制规则
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除规则
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

      {/* 批量操作栏 */}
      {selectedRules.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="bg-card border shadow-lg">
            <CardContent className="flex items-center gap-4 p-3">
              <span className="text-sm text-muted-foreground">
                已选择 <span className="font-medium text-foreground">{selectedRules.length}</span> 条规则
              </span>
              <div className="h-4 w-px bg-border" />
              <Button variant="outline" size="sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                批量启用
              </Button>
              <Button variant="outline" size="sm">
                <XCircle className="h-4 w-4 mr-1" />
                批量停用
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                批量删除
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRules([])}>
                取消选择
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
