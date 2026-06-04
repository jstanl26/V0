"use client"

import * as React from "react"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Database,
  Server,
  ArrowUpRight,
  RotateCcw,
  Eye,
  ChevronDown
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// 模拟上报记录数据
const mockReports = [
  {
    id: "RPT-20240320-001",
    taskId: "TSK-2024-001",
    taskName: "重点目标流量监测",
    type: "pcap",
    target: "国家侧-主节点",
    fileSize: "256.8 MB",
    recordCount: 125000,
    status: "success",
    startTime: "2024-03-20 14:00:00",
    endTime: "2024-03-20 14:05:32",
    duration: "5分32秒",
    retryCount: 0,
  },
  {
    id: "RPT-20240320-002",
    taskId: "TSK-2024-002",
    taskName: "异常流量采集",
    type: "flow_log",
    target: "国家侧-主节点",
    fileSize: "45.2 MB",
    recordCount: 890000,
    status: "success",
    startTime: "2024-03-20 14:10:00",
    endTime: "2024-03-20 14:12:15",
    duration: "2分15秒",
    retryCount: 0,
  },
  {
    id: "RPT-20240320-003",
    taskId: "TSK-2024-003",
    taskName: "协议元数据提取",
    type: "metadata",
    target: "国家侧-备节点",
    fileSize: "128.5 MB",
    recordCount: 456000,
    status: "uploading",
    startTime: "2024-03-20 14:20:00",
    endTime: null,
    duration: null,
    retryCount: 0,
    progress: 67,
  },
  {
    id: "RPT-20240320-004",
    taskId: "TSK-2024-001",
    taskName: "重点目标流量监测",
    type: "file",
    target: "国家侧-主节点",
    fileSize: "512.3 MB",
    recordCount: 2300,
    status: "failed",
    startTime: "2024-03-20 13:30:00",
    endTime: "2024-03-20 13:35:00",
    duration: "5分00秒",
    retryCount: 2,
    errorMsg: "网络连接超时",
  },
  {
    id: "RPT-20240320-005",
    taskId: "TSK-2024-004",
    taskName: "DNS解析日志",
    type: "flow_log",
    target: "省级节点",
    fileSize: "89.6 MB",
    recordCount: 1250000,
    status: "pending",
    startTime: null,
    endTime: null,
    duration: null,
    retryCount: 0,
  },
  {
    id: "RPT-20240320-006",
    taskId: "TSK-2024-005",
    taskName: "HTTP元数据采集",
    type: "metadata",
    target: "国家侧-主节点",
    fileSize: "67.8 MB",
    recordCount: 234000,
    status: "success",
    startTime: "2024-03-20 12:00:00",
    endTime: "2024-03-20 12:02:45",
    duration: "2分45秒",
    retryCount: 1,
  },
]

// 输出统计数据
const outputStats = [
  { label: "今日上报", value: "156", unit: "次", trend: "+12", icon: Upload },
  { label: "成功率", value: "98.2", unit: "%", trend: "+0.5%", icon: CheckCircle2 },
  { label: "上报数据量", value: "2.8", unit: "TB", trend: "+256GB", icon: Database },
  { label: "平均耗时", value: "3.2", unit: "分钟", trend: "-0.3", icon: Clock },
]

// 输出类型统计
const typeStats = [
  { type: "PCAP文件", count: 45, size: "1.2 TB", color: "bg-blue-500" },
  { type: "流日志", count: 68, size: "890 GB", color: "bg-green-500" },
  { type: "元数据", count: 32, size: "456 GB", color: "bg-purple-500" },
  { type: "还原文件", count: 11, size: "234 GB", color: "bg-orange-500" },
]

export function ReportsManagement() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState("records")

  const getStatusBadge = (status: string, progress?: number) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            成功
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="h-3 w-3 mr-1" />
            失败
          </Badge>
        )
      case "uploading":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            上报中 {progress}%
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <Clock className="h-3 w-3 mr-1" />
            待上报
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "pcap":
        return <Badge variant="outline" className="text-blue-400 border-blue-500/30">PCAP</Badge>
      case "flow_log":
        return <Badge variant="outline" className="text-green-400 border-green-500/30">流日志</Badge>
      case "metadata":
        return <Badge variant="outline" className="text-purple-400 border-purple-500/30">元数据</Badge>
      case "file":
        return <Badge variant="outline" className="text-orange-400 border-orange-500/30">还原文件</Badge>
      default:
        return null
    }
  }

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || report.type === selectedType
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">输出与上报</h1>
          <p className="text-sm text-muted-foreground mt-1">管理数据输出与国家侧上报记录</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新状态
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出记录
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {outputStats.map((stat) => (
          <Card key={stat.label} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-semibold">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">{stat.unit}</span>
                  </div>
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

      {/* 输出类型分布 */}
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">输出类型分布</CardTitle>
          <CardDescription>今日各类型数据输出统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {typeStats.map((item) => (
              <div key={item.type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`h-10 w-1 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.type}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-lg font-semibold">{item.count}</span>
                    <span className="text-xs text-muted-foreground">次 / {item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 上报记录 */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">上报记录</CardTitle>
              <CardDescription>数据输出与上报历史记录</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索记录..."
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
                  <SelectItem value="pcap">PCAP</SelectItem>
                  <SelectItem value="flow_log">流日志</SelectItem>
                  <SelectItem value="metadata">元数据</SelectItem>
                  <SelectItem value="file">还原文件</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="uploading">上报中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="pending">待上报</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>记录编号</TableHead>
                <TableHead>关联任务</TableHead>
                <TableHead>数据类型</TableHead>
                <TableHead>目标节点</TableHead>
                <TableHead>数据量</TableHead>
                <TableHead>记录数</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-24">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {report.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{report.taskName}</div>
                      <div className="text-xs text-muted-foreground">{report.taskId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(report.type)}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Server className="h-3.5 w-3.5 text-muted-foreground" />
                      {report.target}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{report.fileSize}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {report.recordCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {report.duration || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(report.status, report.progress)}
                      {report.status === "uploading" && report.progress && (
                        <Progress value={report.progress} className="h-1 w-20" />
                      )}
                      {report.status === "failed" && (
                        <div className="text-xs text-destructive">{report.errorMsg}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {report.status === "failed" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
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
