"use client"

import * as React from "react"
import {
  BarChart3,
  Download,
  RefreshCw,
  Activity,
  Gauge,
  Database,
  Boxes,
  Target,
  ChevronDown,
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
  Line,
  LineChart,
} from "recharts"
import { Button } from "@/components/ui/button"
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
import { useUser } from "@/lib/user-context"
import {
  commandsData,
  filterCommandsByUser,
  type CommandRecord,
} from "@/lib/commands-data"
import {
  OperatorCodes,
  CommandLevel,
  DataOutputMethod,
} from "@/lib/command-types"

type Dimension = "operator" | "level" | "output"

const dimensionLabels: Record<Dimension, string> = {
  operator: "运营商",
  level: "优先级",
  output: "输出方式",
}

// 按维度聚合统计
function aggregate(data: CommandRecord[], dim: Dimension) {
  const groups: Record<string, { totalTraffic: number; hitTraffic: number; totalPackets: number; reportFreq: number; count: number }> = {}

  for (const c of data) {
    let key = ""
    if (dim === "operator") key = OperatorCodes[c.comCode as keyof typeof OperatorCodes] ?? c.comCode
    else if (dim === "level") key = CommandLevel[c.level as keyof typeof CommandLevel] ?? String(c.level)
    else key = DataOutputMethod[c.dataOutputMethod as keyof typeof DataOutputMethod] ?? String(c.dataOutputMethod)

    if (!groups[key]) {
      groups[key] = { totalTraffic: 0, hitTraffic: 0, totalPackets: 0, reportFreq: 0, count: 0 }
    }
    groups[key].totalTraffic += c.totalTraffic
    groups[key].hitTraffic += c.hitTraffic
    groups[key].totalPackets += c.totalPackets
    groups[key].reportFreq += c.reportFreq
    groups[key].count += 1
  }

  return Object.entries(groups).map(([name, v]) => ({
    name,
    totalTraffic: Number(v.totalTraffic.toFixed(1)),
    hitTraffic: Number(v.hitTraffic.toFixed(1)),
    totalPackets: v.totalPackets,
    reportFreq: v.reportFreq,
    count: v.count,
  }))
}

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
]

const chartConfig = {
  totalTraffic: { label: "总流量(TB)", color: "var(--chart-1)" },
  hitTraffic: { label: "命中流量(Gbps)", color: "var(--chart-2)" },
  totalPackets: { label: "总包数(亿)", color: "var(--chart-3)" },
  reportFreq: { label: "上报频次(次/天)", color: "var(--chart-4)" },
}

// 趋势模拟数据（近 7 天总流量）
const trendData = [
  { day: "01-09", traffic: 38.2, hit: 9.1 },
  { day: "01-10", traffic: 42.6, hit: 10.4 },
  { day: "01-11", traffic: 40.1, hit: 9.8 },
  { day: "01-12", traffic: 47.3, hit: 12.2 },
  { day: "01-13", traffic: 51.8, hit: 13.5 },
  { day: "01-14", traffic: 49.2, hit: 12.9 },
  { day: "01-15", traffic: 55.4, hit: 14.7 },
]

export function ReportsManagement() {
  const { currentUser } = useUser()
  const [dimension, setDimension] = React.useState<Dimension>("operator")

  const userData = React.useMemo(
    () => filterCommandsByUser(commandsData, currentUser.username, currentUser.role),
    [currentUser]
  )

  const aggregated = React.useMemo(() => aggregate(userData, dimension), [userData, dimension])

  // 汇总卡片指标
  const summary = React.useMemo(() => {
    return userData.reduce(
      (acc, c) => {
        acc.reportFreq += c.reportFreq
        acc.peakTraffic = Math.max(acc.peakTraffic, c.peakTraffic)
        acc.totalTraffic += c.totalTraffic
        acc.totalPackets += c.totalPackets
        acc.hitTraffic += c.hitTraffic
        return acc
      },
      { reportFreq: 0, peakTraffic: 0, totalTraffic: 0, totalPackets: 0, hitTraffic: 0 }
    )
  }, [userData])

  const summaryCards = [
    { label: "上报频次", value: summary.reportFreq.toLocaleString(), unit: "次/天", icon: Activity, color: "text-chart-4" },
    { label: "峰值流量", value: summary.peakTraffic.toFixed(1), unit: "Gbps", icon: Gauge, color: "text-chart-2" },
    { label: "总流量", value: summary.totalTraffic.toFixed(1), unit: "TB", icon: Database, color: "text-chart-1" },
    { label: "总包数", value: summary.totalPackets.toLocaleString(), unit: "亿", icon: Boxes, color: "text-chart-3" },
    { label: "命中流量", value: summary.hitTraffic.toFixed(1), unit: "Gbps", icon: Target, color: "text-primary" },
  ]

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            流量统计
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            统计各指令数据上报的频次、峰值流量、总流量、总包数与命中流量
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-foreground">{card.value}</span>
                <span className="text-xs text-muted-foreground">{card.unit}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 维度切换 + 图表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">多维度统计分析</CardTitle>
            <CardDescription>按不同统计维度查看流量分布</CardDescription>
          </div>
          <Select value={dimension} onValueChange={(v) => setDimension(v as Dimension)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operator">按运营商</SelectItem>
              <SelectItem value="level">按优先级</SelectItem>
              <SelectItem value="output">按输出方式</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bar" className="w-full">
            <TabsList>
              <TabsTrigger value="bar">流量柱状图</TabsTrigger>
              <TabsTrigger value="pie">总流量占比</TabsTrigger>
              <TabsTrigger value="trend">流量趋势</TabsTrigger>
            </TabsList>

            <TabsContent value="bar" className="pt-4">
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <BarChart data={aggregated} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="totalTraffic" fill="var(--color-totalTraffic)" radius={4} />
                  <Bar dataKey="hitTraffic" fill="var(--color-hitTraffic)" radius={4} />
                </BarChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="pie" className="pt-4">
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={aggregated} dataKey="totalTraffic" nameKey="name" innerRadius={60} outerRadius={110}>
                    {aggregated.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="trend" className="pt-4">
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <LineChart data={trendData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="traffic" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="总流量(TB)" />
                  <Line type="monotone" dataKey="hit" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="命中流量(Gbps)" />
                </LineChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 明细列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">指令上报统计明细</CardTitle>
          <CardDescription>每条指令的数据上报统计指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>指令ID</TableHead>
                  <TableHead>运营商</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>输出方式</TableHead>
                  <TableHead className="text-right">上报频次(次/天)</TableHead>
                  <TableHead className="text-right">峰值流量(Gbps)</TableHead>
                  <TableHead className="text-right">总流量(TB)</TableHead>
                  <TableHead className="text-right">总包数(亿)</TableHead>
                  <TableHead className="text-right">命中流量(Gbps)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.map((c) => (
                  <TableRow key={c.commandId}>
                    <TableCell className="font-medium">{c.commandId}</TableCell>
                    <TableCell>{OperatorCodes[c.comCode as keyof typeof OperatorCodes] ?? c.comCode}</TableCell>
                    <TableCell>
                      <Badge variant={c.level === 1 ? "destructive" : c.level === 2 ? "default" : "secondary"}>
                        {CommandLevel[c.level as keyof typeof CommandLevel]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{DataOutputMethod[c.dataOutputMethod as keyof typeof DataOutputMethod]}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.reportFreq.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.peakTraffic.toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.totalTraffic.toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.totalPackets.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.hitTraffic.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
                {userData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
