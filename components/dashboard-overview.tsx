"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Network,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts"

// 模拟数据
const trafficData = [
  { time: "00:00", inbound: 4200, outbound: 2400 },
  { time: "02:00", inbound: 3800, outbound: 2200 },
  { time: "04:00", inbound: 2800, outbound: 1800 },
  { time: "06:00", inbound: 3200, outbound: 2000 },
  { time: "08:00", inbound: 5600, outbound: 3400 },
  { time: "10:00", inbound: 7800, outbound: 4200 },
  { time: "12:00", inbound: 8200, outbound: 4800 },
  { time: "14:00", inbound: 7400, outbound: 4400 },
  { time: "16:00", inbound: 8600, outbound: 5200 },
  { time: "18:00", inbound: 9200, outbound: 5800 },
  { time: "20:00", inbound: 6800, outbound: 4000 },
  { time: "22:00", inbound: 5200, outbound: 3200 },
]

const ruleHitData = [
  { name: "五元组", hits: 42580 },
  { name: "Host", hits: 28340 },
  { name: "SNI", hits: 18920 },
  { name: "URL", hits: 15680 },
  { name: "特征码", hits: 8450 },
  { name: "协议头", hits: 5230 },
]

const protocolDistribution = [
  { name: "HTTP/HTTPS", value: 45, color: "oklch(0.65 0.18 250)" },
  { name: "DNS", value: 20, color: "oklch(0.70 0.15 180)" },
  { name: "SSH/TLS", value: 15, color: "oklch(0.75 0.12 85)" },
  { name: "FTP", value: 10, color: "oklch(0.60 0.20 25)" },
  { name: "其他", value: 10, color: "oklch(0.55 0.15 300)" },
]

const statsCards = [
  {
    title: "活跃任务数",
    value: "128",
    change: "+12",
    trend: "up",
    icon: Activity,
    description: "较昨日",
  },
  {
    title: "实时流速",
    value: "8.6 Gbps",
    change: "+15.2%",
    trend: "up",
    icon: Network,
    description: "较昨日同期",
  },
  {
    title: "规则命中量",
    value: "1.2M",
    change: "+8.5%",
    trend: "up",
    icon: FileText,
    description: "今日累计",
  },
  {
    title: "上报成功率",
    value: "99.8%",
    change: "-0.1%",
    trend: "down",
    icon: Upload,
    description: "过去24小时",
  },
]

const secondaryStats = [
  { label: "包速率", value: "12.4M pps", icon: TrendingUp },
  { label: "连接数", value: "856K", icon: Activity },
  { label: "PCAP输出", value: "2.8 TB", icon: FileText },
  { label: "文件还原", value: "45,280", icon: FileText },
  { label: "流日志", value: "8.2M", icon: FileText },
  { label: "元数据", value: "15.6M", icon: FileText },
]

const recentTasks = [
  { id: "T-20240115-001", name: "省网出口监测任务", status: "running", hitRate: "12.5K/s" },
  { id: "T-20240115-002", name: "城域网HTTP采集", status: "running", hitRate: "8.2K/s" },
  { id: "T-20240115-003", name: "加密流量检测", status: "running", hitRate: "5.6K/s" },
  { id: "T-20240114-018", name: "DNS流量分析", status: "paused", hitRate: "0/s" },
  { id: "T-20240114-015", name: "特定应用监测", status: "running", hitRate: "3.2K/s" },
]

const alerts = [
  { type: "warning", message: "链路 LK-PROV-03 丢包率上升至 2.3%", time: "5分钟前" },
  { type: "error", message: "任务 T-20240114-012 重组失败数量异常", time: "15分钟前" },
  { type: "info", message: "新指令 CMD-2024-0892 已接收", time: "32分钟前" },
]

export function DashboardOverview() {
  const [currentTime, setCurrentTime] = React.useState<string | null>(null)

  React.useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("zh-CN"))
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("zh-CN"))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">采集总览</h1>
          <p className="text-sm text-muted-foreground mt-1">实时监控采集任务状态与流量数据</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>最后更新: {currentTime ?? "--:--:--"}</span>
        </div>
      </div>

      {/* 主要指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 次要指标 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {secondaryStats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <stat.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-lg font-semibold mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 流量趋势图 */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">流量趋势</CardTitle>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ background: "oklch(0.65 0.18 250)" }} />
                  <span className="text-muted-foreground">入向流量</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ background: "oklch(0.70 0.15 180)" }} />
                  <span className="text-muted-foreground">出向流量</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="inbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.70 0.15 180)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.70 0.15 180)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="oklch(0.5 0 0)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="oklch(0.5 0 0)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.005 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "oklch(0.95 0 0)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    stroke="oklch(0.65 0.18 250)"
                    fillOpacity={1}
                    fill="url(#inbound)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    stroke="oklch(0.70 0.15 180)"
                    fillOpacity={1}
                    fill="url(#outbound)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 协议分布 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">协议分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {protocolDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.005 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {protocolDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 规则命中和任务列表 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 规则命中统计 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">规则命中统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ruleHitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 260)" horizontal={false} />
                  <XAxis 
                    type="number" 
                    stroke="oklch(0.5 0 0)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}K`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="oklch(0.5 0 0)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.005 260)",
                      border: "1px solid oklch(0.28 0.01 260)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar 
                    dataKey="hits" 
                    fill="oklch(0.65 0.18 250)" 
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 最近任务 */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">活跃任务</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {recentTasks.filter(t => t.status === "running").length} 运行中
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      task.status === "running" ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{task.name}</div>
                      <div className="text-xs text-muted-foreground">{task.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{task.hitRate}</div>
                    <Badge 
                      variant={task.status === "running" ? "default" : "secondary"}
                      className="text-xs mt-1"
                    >
                      {task.status === "running" ? "运行中" : "已暂停"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 告警信息 */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">系统告警</CardTitle>
            <Badge variant="outline" className="text-xs">
              {alerts.length} 条未处理
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
              >
                {alert.type === "error" ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                ) : alert.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                )}
                <span className="text-sm flex-1">{alert.message}</span>
                <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
