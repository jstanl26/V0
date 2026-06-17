"use client"

import * as React from "react"
import {
  Bell,
  RefreshCw,
  Download,
  Search,
  Cpu,
  Network,
  Activity,
  Plug,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 告警来源
type AlertSource = "hardware" | "port" | "command" | "api"
// 告警级别
type AlertLevel = "critical" | "major" | "minor" | "info"
// 处置状态
type AlertStatus = "pending" | "processing" | "resolved"

interface AlertRecord {
  id: string
  source: AlertSource
  level: AlertLevel
  title: string
  device: string
  detail: string
  status: AlertStatus
  occurredAt: string
  // 溯源链路
  trace: string[]
}

const sourceMeta: Record<AlertSource, { label: string; icon: typeof Cpu; color: string }> = {
  hardware: { label: "本机硬件", icon: Cpu, color: "text-chart-1" },
  port: { label: "端口", icon: Network, color: "text-chart-2" },
  command: { label: "流量指令", icon: Activity, color: "text-chart-3" },
  api: { label: "接口调用", icon: Plug, color: "text-chart-4" },
}

const levelMeta: Record<
  AlertLevel,
  { label: string; icon: typeof AlertOctagon; variant: "destructive" | "default" | "secondary" | "outline" }
> = {
  critical: { label: "紧急", icon: AlertOctagon, variant: "destructive" },
  major: { label: "重要", icon: AlertTriangle, variant: "default" },
  minor: { label: "次要", icon: ShieldAlert, variant: "secondary" },
  info: { label: "提示", icon: Info, variant: "outline" },
}

const statusMeta: Record<AlertStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "待处置", icon: Clock, className: "text-destructive" },
  processing: { label: "处置中", icon: RefreshCw, className: "text-chart-4" },
  resolved: { label: "已处置", icon: CheckCircle2, className: "text-chart-2" },
}

// 模拟告警数据
const alertsData: AlertRecord[] = [
  {
    id: "ALM-20240115-001",
    source: "hardware",
    level: "critical",
    title: "CPU 温度超过阈值",
    device: "采集服务器 NODE-01",
    detail: "CPU 核心温度达到 92°C，超过安全阈值 85°C，存在宕机风险。",
    status: "pending",
    occurredAt: "2024-01-15 14:32:10",
    trace: ["硬件监控代理", "BMC 传感器", "温度采集模块 #3"],
  },
  {
    id: "ALM-20240115-002",
    source: "port",
    level: "major",
    title: "采集端口链路中断",
    device: "汇聚交换机 SW-CORE-02 / Port 24",
    detail: "端口 Port 24 物理链路 Down，已持续 3 分钟，影响北京分公司流量采集。",
    status: "processing",
    occurredAt: "2024-01-15 14:18:45",
    trace: ["端口监控", "SNMP Trap", "链路状态检测"],
  },
  {
    id: "ALM-20240115-003",
    source: "command",
    level: "major",
    title: "指令上报流量异常激增",
    device: "指令 CMD-20240112-0087",
    detail: "指令上报峰值流量达 18.6 Gbps，超过基线 200%，疑似规则匹配范围过宽。",
    status: "pending",
    occurredAt: "2024-01-15 13:55:22",
    trace: ["流量指令引擎", "上报通道监测", "基线对比模块"],
  },
  {
    id: "ALM-20240115-004",
    source: "api",
    level: "minor",
    title: "接口调用超时率上升",
    device: "能力开放网关 /api/command/dispatch",
    detail: "下发接口 5 分钟平均响应 1.8s，超时率 6.2%，建议检查下游服务。",
    status: "processing",
    occurredAt: "2024-01-15 13:40:08",
    trace: ["API 网关", "调用链追踪", "下游服务健康检查"],
  },
  {
    id: "ALM-20240115-005",
    source: "hardware",
    level: "minor",
    title: "磁盘使用率偏高",
    device: "存储节点 STORAGE-03",
    detail: "数据盘 /data 使用率达 87%，建议清理过期 PCAP 文件或扩容。",
    status: "resolved",
    occurredAt: "2024-01-15 11:20:33",
    trace: ["硬件监控代理", "磁盘容量采集"],
  },
  {
    id: "ALM-20240115-006",
    source: "port",
    level: "info",
    title: "端口流量负载提示",
    device: "汇聚交换机 SW-CORE-01 / Port 12",
    detail: "端口 Port 12 入向流量达额定带宽 78%，请关注后续增长趋势。",
    status: "resolved",
    occurredAt: "2024-01-15 10:05:17",
    trace: ["端口监控", "流量采样"],
  },
  {
    id: "ALM-20240115-007",
    source: "api",
    level: "critical",
    title: "接口鉴权失败频次异常",
    device: "能力开放网关 /api/auth/token",
    detail: "1 分钟内鉴权失败 142 次，疑似异常调用或凭证泄露，已触发限流。",
    status: "pending",
    occurredAt: "2024-01-15 09:48:51",
    trace: ["API 网关", "鉴权服务", "风控引擎"],
  },
  {
    id: "ALM-20240115-008",
    source: "command",
    level: "minor",
    title: "指令规则未命中",
    device: "指令 CMD-20240110-0042",
    detail: "指令运行 24 小时命中流量为 0，请检查规则策略配置是否有效。",
    status: "resolved",
    occurredAt: "2024-01-15 08:30:00",
    trace: ["流量指令引擎", "规则匹配统计"],
  },
]

const chartConfig = {
  count: { label: "告警数", color: "var(--chart-1)" },
  critical: { label: "紧急", color: "var(--chart-1)" },
  major: { label: "重要", color: "var(--chart-2)" },
  minor: { label: "次要", color: "var(--chart-3)" },
}

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

// 近 12 小时趋势模拟
const trendData = [
  { time: "04:00", critical: 0, major: 1, minor: 2 },
  { time: "06:00", critical: 1, major: 2, minor: 1 },
  { time: "08:00", critical: 1, major: 1, minor: 3 },
  { time: "10:00", critical: 0, major: 2, minor: 2 },
  { time: "12:00", critical: 1, major: 3, minor: 1 },
  { time: "14:00", critical: 2, major: 3, minor: 2 },
]

export function AlertsManagement() {
  const [sourceFilter, setSourceFilter] = React.useState<AlertSource | "all">("all")
  const [levelFilter, setLevelFilter] = React.useState<AlertLevel | "all">("all")
  const [statusFilter, setStatusFilter] = React.useState<AlertStatus | "all">("all")
  const [keyword, setKeyword] = React.useState("")
  const [selected, setSelected] = React.useState<AlertRecord | null>(null)

  const filtered = React.useMemo(() => {
    return alertsData.filter((a) => {
      if (sourceFilter !== "all" && a.source !== sourceFilter) return false
      if (levelFilter !== "all" && a.level !== levelFilter) return false
      if (statusFilter !== "all" && a.status !== statusFilter) return false
      if (keyword && !`${a.title}${a.device}${a.id}`.toLowerCase().includes(keyword.toLowerCase()))
        return false
      return true
    })
  }, [sourceFilter, levelFilter, statusFilter, keyword])

  // 汇总卡片
  const summary = React.useMemo(() => {
    return {
      total: alertsData.length,
      critical: alertsData.filter((a) => a.level === "critical").length,
      pending: alertsData.filter((a) => a.status === "pending").length,
      resolved: alertsData.filter((a) => a.status === "resolved").length,
    }
  }, [])

  // 按来源聚合
  const bySource = React.useMemo(() => {
    return (Object.keys(sourceMeta) as AlertSource[]).map((s) => ({
      name: sourceMeta[s].label,
      count: alertsData.filter((a) => a.source === s).length,
    }))
  }, [])

  // 按级别聚合
  const byLevel = React.useMemo(() => {
    return (Object.keys(levelMeta) as AlertLevel[]).map((l) => ({
      name: levelMeta[l].label,
      value: alertsData.filter((a) => a.level === l).length,
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            告警管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            统一收集硬件、端口、流量指令、接口调用异常告警，提供查询、分级、处置与溯源能力
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">告警总数</span>
              <Bell className="h-4 w-4 text-chart-1" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">紧急告警</span>
              <AlertOctagon className="h-4 w-4 text-destructive" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-destructive">{summary.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">待处置</span>
              <Clock className="h-4 w-4 text-chart-4" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{summary.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">已处置</span>
              <CheckCircle2 className="h-4 w-4 text-chart-2" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{summary.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* 图表 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">告警趋势（近 12 小时）</CardTitle>
            <CardDescription>分级别告警数量变化趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <AreaChart data={trendData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.5} />
                <Area type="monotone" dataKey="major" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.5} />
                <Area type="monotone" dataKey="minor" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.5} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">告警级别占比</CardTitle>
            <CardDescription>各级别分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={byLevel} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {byLevel.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 按来源统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">告警来源分布</CardTitle>
          <CardDescription>本机硬件 / 端口 / 流量指令 / 接口调用</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={bySource} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 告警列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">告警明细</CardTitle>
          <CardDescription>点击任意告警可查看处置与溯源详情</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 筛选栏 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索告警标题 / 设备 / 编号"
                className="pl-9"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as AlertSource | "all")}>
              <SelectTrigger className="w-36"><SelectValue placeholder="来源" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                {(Object.keys(sourceMeta) as AlertSource[]).map((s) => (
                  <SelectItem key={s} value={s}>{sourceMeta[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as AlertLevel | "all")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="级别" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部级别</SelectItem>
                {(Object.keys(levelMeta) as AlertLevel[]).map((l) => (
                  <SelectItem key={l} value={l}>{levelMeta[l].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AlertStatus | "all")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {(Object.keys(statusMeta) as AlertStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{statusMeta[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>告警编号</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>级别</TableHead>
                  <TableHead>告警标题</TableHead>
                  <TableHead>设备/对象</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>发生时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const SourceIcon = sourceMeta[a.source].icon
                  const LevelIcon = levelMeta[a.level].icon
                  const StatusIcon = statusMeta[a.status].icon
                  return (
                    <TableRow
                      key={a.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(a)}
                    >
                      <TableCell className="font-medium">{a.id}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5">
                          <SourceIcon className={`h-4 w-4 ${sourceMeta[a.source].color}`} />
                          {sourceMeta[a.source].label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={levelMeta[a.level].variant} className="gap-1">
                          <LevelIcon className="h-3 w-3" />
                          {levelMeta[a.level].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{a.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.device}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1.5 text-sm ${statusMeta[a.status].className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusMeta[a.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">{a.occurredAt}</TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      暂无匹配告警
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 详情对话框：处置与溯源 */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(levelMeta[selected.level].icon, { className: "h-5 w-5 text-primary" })}
                  {selected.title}
                </DialogTitle>
                <DialogDescription>{selected.id}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">来源</span>
                    <p className="font-medium">{sourceMeta[selected.source].label}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">级别</span>
                    <p><Badge variant={levelMeta[selected.level].variant}>{levelMeta[selected.level].label}</Badge></p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">设备/对象</span>
                    <p className="font-medium">{selected.device}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">发生时间</span>
                    <p className="font-medium tabular-nums">{selected.occurredAt}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">告警详情</span>
                  <p className="mt-1 text-sm rounded-md bg-muted p-3">{selected.detail}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">溯源链路</span>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {selected.trace.map((t, i) => (
                      <React.Fragment key={t}>
                        <Badge variant="outline">{t}</Badge>
                        {i < selected.trace.length - 1 && <span className="text-muted-foreground">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>关闭</Button>
                  {selected.status !== "resolved" && (
                    <Button size="sm" className="gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      标记处置
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
