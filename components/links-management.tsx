"use client"

import * as React from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  Network,
  Zap,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileArchive,
  FileText,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { OperatorCodes, ProvinceCodes, SystemType, TrafficReportType } from "@/lib/command-types"
import { useUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"

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

// 输出流量发生方式
const outputTrafficTypes = [
  { value: "traffic", label: "流量发送", icon: Send, desc: "通过端口组转发原始流量" },
  { value: "pcap", label: "PCAP文件发送", icon: FileArchive, desc: "生成PCAP文件并发送至指定位置" },
  { value: "log", label: "网络行为日志", icon: FileText, desc: "生成网络行为日志记录" },
]

interface IOMethod {
  id: string
  name: string
  category: "input" | "output"
  owner: string
  description: string
  status: "active" | "inactive"
  taskCount: number
  createdAt: string
  // 输入方式 / 输出流量发送方式 的端口组配置
  portConfig?: {
    comCode: string
    effectProvince: string[]
    effectSystem: string[]
    device: string
    ports: string
    portType: string
    vlanRange: string
    accessType: string
    bandwidth: number
  }
  // 输出方式专属
  outputType?: "traffic" | "pcap" | "log"
  pcapConfig?: { url: string; storagePath: string; maxSize: number; retention: number }
  logConfig?: { logType: string; format: string; pushUrl: string; sampleRatio: string }
}

const initialMethods: IOMethod[] = [
  {
    id: "IN-001",
    name: "省网出口-输入方式A",
    category: "input",
    owner: "admin",
    description: "省网核心出口主链路输入方式",
    status: "active",
    taskCount: 8,
    createdAt: "2024-03-15",
    portConfig: { comCode: "0013", effectProvince: ["110000", "120000"], effectSystem: ["2"], device: "DPI-CORE-01", ports: "GE0/0/1, GE0/0/2", portType: "GE", vlanRange: "100-200", accessType: "split", bandwidth: 10000 },
  },
  {
    id: "IN-002",
    name: "城域网出口-输入方式B",
    category: "input",
    owner: "operator1",
    description: "城域网汇聚层输入方式",
    status: "active",
    taskCount: 12,
    createdAt: "2024-03-14",
    portConfig: { comCode: "0013", effectProvince: ["310000", "320000"], effectSystem: ["2"], device: "DPI-EDGE-01", ports: "XGE0/0/1, XGE0/0/2", portType: "XGE", vlanRange: "300-500", accessType: "mirror", bandwidth: 40000 },
  },
  {
    id: "OUT-001",
    name: "国家侧-流量发送方式",
    category: "output",
    owner: "admin",
    description: "通过端口组发送至国家侧",
    status: "active",
    taskCount: 15,
    createdAt: "2024-03-13",
    outputType: "traffic",
    portConfig: { comCode: "0013", effectProvince: ["110000"], effectSystem: ["2"], device: "FORWARD-01", ports: "100GE0/0/1", portType: "100GE", vlanRange: "ALL", accessType: "split", bandwidth: 100000 },
  },
  {
    id: "OUT-002",
    name: "本地PCAP留存方式",
    category: "output",
    owner: "analyst",
    description: "PCAP文件留存至本地存储",
    status: "active",
    taskCount: 6,
    createdAt: "2024-03-12",
    outputType: "pcap",
    pcapConfig: { url: "ftp://10.1.1.20/pcap", storagePath: "/data/pcap/store", maxSize: 5000, retention: 30 },
  },
  {
    id: "OUT-003",
    name: "网络行为日志方式",
    category: "output",
    owner: "monitor",
    description: "生成网络行为日志并推送",
    status: "inactive",
    taskCount: 0,
    createdAt: "2024-03-10",
    outputType: "log",
    logConfig: { logType: "flow", format: "json", pushUrl: "https://log.center/api/ingest", sampleRatio: "10:1" },
  },
]

export function LinksManagement() {
  const { currentUser } = useUser()
  const [methods, setMethods] = React.useState<IOMethod[]>(initialMethods)
  const [activeTab, setActiveTab] = React.useState<"input" | "output">("input")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [addOpen, setAddOpen] = React.useState(false)
  const [viewMethod, setViewMethod] = React.useState<IOMethod | null>(null)

  // 数据隔离
  const visibleMethods = React.useMemo(() => {
    if (currentUser.role === "admin") return methods
    return methods.filter((m) => m.owner === currentUser.username)
  }, [methods, currentUser])

  const inputMethods = visibleMethods.filter((m) => m.category === "input")
  const outputMethods = visibleMethods.filter((m) => m.category === "output")

  const currentList = (activeTab === "input" ? inputMethods : outputMethods).filter(
    (m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = (method: IOMethod) => {
    setMethods((prev) => [...prev, method])
    setAddOpen(false)
  }

  const handleDelete = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">输入输出管理</h1>
          <p className="text-sm text-muted-foreground mt-1">预配置输入方式与输出方式，供指令下发时快速选择</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新状态
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建{activeTab === "input" ? "输入" : "输出"}方式
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="输入方式" value={inputMethods.length} icon={ArrowDownToLine} />
        <StatCard label="输出方式" value={outputMethods.length} icon={ArrowUpFromLine} />
        <StatCard label="启用中" value={visibleMethods.filter((m) => m.status === "active").length} icon={Zap} />
        <StatCard label="关联指令" value={visibleMethods.reduce((s, m) => s + m.taskCount, 0)} icon={Network} />
      </div>

      {/* Tab 切换 + 列表 */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "input" | "output")}>
        <TabsList>
          <TabsTrigger value="input" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            输入方式列表
          </TabsTrigger>
          <TabsTrigger value="output" className="gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            输出方式列表
          </TabsTrigger>
        </TabsList>

        <div className="relative max-w-sm my-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="搜索方式名称或编号..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary border-0" />
        </div>

        <TabsContent value="input">
          <MethodTable list={currentList} category="input" onView={setViewMethod} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="output">
          <MethodTable list={currentList} category="output" onView={setViewMethod} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      {/* 新建对话框 */}
      {addOpen && (
        <AddMethodDialog defaultCategory={activeTab} owner={currentUser.username} existingCount={methods.length} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      )}

      {/* 详情对话框 */}
      {viewMethod && <ViewMethodDialog method={viewMethod} onClose={() => setViewMethod(null)} />}
    </div>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Network }) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MethodTable({ list, category, onView, onDelete }: { list: IOMethod[]; category: "input" | "output"; onView: (m: IOMethod) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="min-w-[100px]">编号</TableHead>
                <TableHead className="min-w-[160px]">方式名称</TableHead>
                {category === "output" && <TableHead className="min-w-[120px]">流量发送方式</TableHead>}
                {category === "input" && <TableHead className="min-w-[100px]">采集设备</TableHead>}
                <TableHead className="min-w-[120px]">关键配置</TableHead>
                <TableHead className="min-w-[80px]">属主</TableHead>
                <TableHead className="min-w-[80px]">状态</TableHead>
                <TableHead className="min-w-[80px]">关联指令</TableHead>
                <TableHead className="min-w-[100px]">创建时间</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    暂无{category === "input" ? "输入" : "输出"}方式数据
                  </TableCell>
                </TableRow>
              ) : (
                list.map((m) => (
                  <TableRow key={m.id} className="border-border">
                    <TableCell className="font-mono text-sm">{m.id}</TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    {category === "output" && (
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {outputTrafficTypes.find((t) => t.value === m.outputType)?.label || "-"}
                        </Badge>
                      </TableCell>
                    )}
                    {category === "input" && <TableCell className="text-sm text-muted-foreground">{m.portConfig?.device || "-"}</TableCell>}
                    <TableCell className="text-sm text-muted-foreground">
                      {m.outputType === "pcap"
                        ? m.pcapConfig?.storagePath
                        : m.outputType === "log"
                        ? m.logConfig?.format?.toUpperCase()
                        : m.portConfig?.ports || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.owner}</TableCell>
                    <TableCell>
                      {m.status === "active" ? (
                        <Badge className="bg-success/10 text-success border-success/20">启用</Badge>
                      ) : (
                        <Badge variant="secondary">停用</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{m.taskCount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(m)}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(m.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// 端口组配置子表单
function PortConfigForm({ config, onChange }: { config: NonNullable<IOMethod["portConfig"]>; onChange: (c: NonNullable<IOMethod["portConfig"]>) => void }) {
  const toggleProvince = (code: string) => {
    onChange({ ...config, effectProvince: config.effectProvince.includes(code) ? config.effectProvince.filter((p) => p !== code) : [...config.effectProvince, code] })
  }
  const toggleSystem = (code: string) => {
    onChange({ ...config, effectSystem: config.effectSystem.includes(code) ? config.effectSystem.filter((s) => s !== code) : [...config.effectSystem, code] })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>运营商代码 <span className="text-destructive">*</span></Label>
          <Select value={config.comCode} onValueChange={(v) => onChange({ ...config, comCode: v })}>
            <SelectTrigger>
              <SelectValue placeholder="选择运营商" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OperatorCodes).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name} ({code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>采集设备 <span className="text-destructive">*</span></Label>
          <Input placeholder="如: DPI-CORE-01" value={config.device} onChange={(e) => onChange({ ...config, device: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>生效系统 <span className="text-destructive">*</span></Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SystemType).map(([key, label]) => (
            <Badge key={key} variant={config.effectSystem.includes(key) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleSystem(key)}>
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>生效省份 <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-secondary/50 max-h-[160px] overflow-y-auto">
          {Object.entries(ProvinceCodes).map(([code, name]) => (
            <div
              key={code}
              onClick={() => toggleProvince(code)}
              className={cn(
                "px-2 py-1.5 rounded text-xs cursor-pointer transition-colors text-center",
                config.effectProvince.includes(code) ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              )}
            >
              {String(name).replace(/省|市|自治区|壮族|回族|维吾尔/g, "")}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">已选择 {config.effectProvince.length} 个省份</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>端口类型 <span className="text-destructive">*</span></Label>
          <Select value={config.portType} onValueChange={(v) => onChange({ ...config, portType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {portTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>接入方式 <span className="text-destructive">*</span></Label>
          <Select value={config.accessType} onValueChange={(v) => onChange({ ...config, accessType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {accessTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>端口列表 <span className="text-destructive">*</span></Label>
        <Input placeholder="多个端口用逗号分隔，如: GE0/0/1, GE0/0/2" value={config.ports} onChange={(e) => onChange({ ...config, ports: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>VLAN范围</Label>
          <Input placeholder="如: 100-200 或 ALL" value={config.vlanRange} onChange={(e) => onChange({ ...config, vlanRange: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>带宽容量 (Mbps)</Label>
          <Input type="number" placeholder="10000" value={config.bandwidth} onChange={(e) => onChange({ ...config, bandwidth: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  )
}

// 新建方式对话框
function AddMethodDialog({ defaultCategory, owner, existingCount, onClose, onAdd }: { defaultCategory: "input" | "output"; owner: string; existingCount: number; onClose: () => void; onAdd: (m: IOMethod) => void }) {
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState<"input" | "output">(defaultCategory)
  const [description, setDescription] = React.useState("")
  const [outputType, setOutputType] = React.useState<"traffic" | "pcap" | "log">("traffic")
  const emptyPortConfig = { comCode: "0013", effectProvince: [] as string[], effectSystem: ["2"], device: "", ports: "", portType: "GE", vlanRange: "", accessType: "split", bandwidth: 10000 }
  const [portConfig, setPortConfig] = React.useState(emptyPortConfig)
  const [pcapConfig, setPcapConfig] = React.useState({ url: "", storagePath: "", maxSize: 5000, retention: 30 })
  const [logConfig, setLogConfig] = React.useState({ logType: "flow", format: "json", pushUrl: "", sampleRatio: "10:1" })

  const handleSubmit = () => {
    const prefix = category === "input" ? "IN" : "OUT"
    const method: IOMethod = {
      id: `${prefix}-${String(existingCount + 1).padStart(3, "0")}`,
      name: name || `未命名${category === "input" ? "输入" : "输出"}方式`,
      category,
      owner,
      description,
      status: "active",
      taskCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    if (category === "input") {
      method.portConfig = portConfig
    } else {
      method.outputType = outputType
      if (outputType === "traffic") method.portConfig = portConfig
      else if (outputType === "pcap") method.pcapConfig = pcapConfig
      else method.logConfig = logConfig
    }
    onAdd(method)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建方式</DialogTitle>
          <DialogDescription>配置输入/输出方式，详情配置将根据方式类型自动变化</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* 基础信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>方式名称 <span className="text-destructive">*</span></Label>
              <Input placeholder="输入方式名称" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>方式类型 <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={(v) => setCategory(v as "input" | "output")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="input">输入方式</SelectItem>
                  <SelectItem value="output">输出方式</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>方式描述</Label>
            <Textarea placeholder="输入方式描述（可选）" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          {/* 详情配置：根据类型变化 */}
          <div className="border-t border-border pt-4">
            {category === "input" ? (
              <>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  端口组配置
                </h3>
                <PortConfigForm config={portConfig} onChange={setPortConfig} />
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold mb-3">输出流量发生方式 <span className="text-destructive">*</span></h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {outputTrafficTypes.map((t) => (
                    <div
                      key={t.value}
                      onClick={() => setOutputType(t.value as "traffic" | "pcap" | "log")}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors text-center",
                        outputType === t.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      )}
                    >
                      <t.icon className={cn("h-5 w-5 mx-auto mb-1", outputType === t.value ? "text-primary" : "text-muted-foreground")} />
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{t.desc}</div>
                    </div>
                  ))}
                </div>

                {/* 流量发送 -> 端口组配置 */}
                {outputType === "traffic" && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Network className="h-4 w-4 text-primary" />
                      端口组配置
                    </h3>
                    <PortConfigForm config={portConfig} onChange={setPortConfig} />
                  </div>
                )}

                {/* PCAP文件发送 -> URL/存储配置 */}
                {outputType === "pcap" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>发送URL <span className="text-destructive">*</span></Label>
                        <Input placeholder="如: ftp://10.1.1.20/pcap" value={pcapConfig.url} onChange={(e) => setPcapConfig({ ...pcapConfig, url: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>本地存储位置 <span className="text-destructive">*</span></Label>
                        <Input placeholder="如: /data/pcap/store" value={pcapConfig.storagePath} onChange={(e) => setPcapConfig({ ...pcapConfig, storagePath: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>单文件最大容量 (MB)</Label>
                        <Input type="number" value={pcapConfig.maxSize} onChange={(e) => setPcapConfig({ ...pcapConfig, maxSize: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>留存时长 (天)</Label>
                        <Input type="number" value={pcapConfig.retention} onChange={(e) => setPcapConfig({ ...pcapConfig, retention: Number(e.target.value) })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 网络行为日志 -> 日志配置 */}
                {outputType === "log" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>日志类型</Label>
                        <Select value={logConfig.logType} onValueChange={(v) => setLogConfig({ ...logConfig, logType: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flow">流日志</SelectItem>
                            <SelectItem value="session">会话日志</SelectItem>
                            <SelectItem value="dns">DNS日志</SelectItem>
                            <SelectItem value="http">HTTP日志</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>日志格式</Label>
                        <Select value={logConfig.format} onValueChange={(v) => setLogConfig({ ...logConfig, format: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="syslog">Syslog</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>推送地址</Label>
                        <Input placeholder="如: https://log.center/api/ingest" value={logConfig.pushUrl} onChange={(e) => setLogConfig({ ...logConfig, pushUrl: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>采样比</Label>
                        <Select value={logConfig.sampleRatio} onValueChange={(v) => setLogConfig({ ...logConfig, sampleRatio: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1">全量 (1:1)</SelectItem>
                            <SelectItem value="10:1">10:1</SelectItem>
                            <SelectItem value="100:1">100:1</SelectItem>
                            <SelectItem value="1000:1">1000:1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>创建方式</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 详情对话框
function ViewMethodDialog({ method, onClose }: { method: IOMethod; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{method.name}</DialogTitle>
          <DialogDescription>
            {method.category === "input" ? "输入方式" : "输出方式"} · {method.id}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <p className="text-muted-foreground">{method.description || "无描述"}</p>

          {method.category === "output" && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">流量发送方式：</span>
              <Badge variant="outline">{outputTrafficTypes.find((t) => t.value === method.outputType)?.label}</Badge>
            </div>
          )}

          {method.portConfig && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
              <DetailRow label="运营商" value={OperatorCodes[method.portConfig.comCode as keyof typeof OperatorCodes]} />
              <DetailRow label="采集设备" value={method.portConfig.device} />
              <DetailRow label="端口类型" value={method.portConfig.portType} />
              <DetailRow label="接入方式" value={accessTypes.find((a) => a.value === method.portConfig!.accessType)?.label || ""} />
              <DetailRow label="端口列表" value={method.portConfig.ports} />
              <DetailRow label="VLAN范围" value={method.portConfig.vlanRange} />
              <DetailRow label="带宽容量" value={`${(method.portConfig.bandwidth / 1000).toFixed(0)} Gbps`} />
              <DetailRow label="生效省份" value={method.portConfig.effectProvince.map((c) => String(ProvinceCodes[c as keyof typeof ProvinceCodes]).replace(/省|市|自治区|壮族|回族|维吾尔/g, "")).join("、")} />
            </div>
          )}

          {method.pcapConfig && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
              <DetailRow label="发送URL" value={method.pcapConfig.url} />
              <DetailRow label="存储位置" value={method.pcapConfig.storagePath} />
              <DetailRow label="单文件最大容量" value={`${method.pcapConfig.maxSize} MB`} />
              <DetailRow label="留存时长" value={`${method.pcapConfig.retention} 天`} />
            </div>
          )}

          {method.logConfig && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
              <DetailRow label="日志类型" value={method.logConfig.logType} />
              <DetailRow label="日志格式" value={method.logConfig.format.toUpperCase()} />
              <DetailRow label="推送地址" value={method.logConfig.pushUrl} />
              <DetailRow label="采样比" value={method.logConfig.sampleRatio} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium break-all">{value || "-"}</span>
    </div>
  )
}
