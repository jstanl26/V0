"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Settings2,
  FileText,
  FileSearch,
  Plus,
  Eye,
  Play,
  Pause,
  AlertTriangle,
  FileArchive,
  ScrollText,
  Code,
  Upload,
  Server,
  Link2,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

// 可选的源采集任务
const sourceTaskOptions = [
  { id: "TASK-2024-001", name: "省网出口HTTP监测", link: "LK-PROV-01", status: "running" },
  { id: "TASK-2024-002", name: "城域网DNS监测", link: "LK-CITY-01", status: "running" },
  { id: "TASK-2024-003", name: "城域网加密流量采集", link: "LK-CITY-03", status: "running" },
  { id: "TASK-2024-005", name: "省网出口全流量", link: "LK-PROV-02", status: "running" },
  { id: "TASK-2024-008", name: "IDC邮件协议监测", link: "LK-IDC-02", status: "paused" },
]

// 上报目标配置选项
const reportTargetOptions = [
  { id: "national-1", name: "国家侧主平台", address: "10.200.1.1:9090", protocol: "TCP" },
  { id: "national-2", name: "国家侧备份平台", address: "10.200.1.2:9090", protocol: "TCP" },
  { id: "provincial", name: "省级汇聚平台", address: "10.100.1.1:8080", protocol: "HTTP" },
]

// 提取任务数据
const extractionTasks = [
  {
    id: "EXT-001",
    name: "省网HTTP流量提取",
    sourceTask: "TASK-2024-001",
    sourceTaskName: "省网出口HTTP监测",
    status: "running",
    link: "LK-PROV-01",
    config: {
      pcap: true,
      flowLog: true,
      metadata: true,
      fileRestore: true,
      protocols: ["HTTP", "HTTPS", "DNS"],
      pcapConfig: { splitSize: "256MB", splitTime: 60, compress: true },
      flowLogConfig: { fields: ["五元组", "时间戳", "包数", "字节数", "标志位"], format: "json" },
      metadataConfig: { protocols: ["HTTP", "TLS", "DNS"], depth: "full" },
      fileRestoreConfig: { types: ["document", "archive", "image"], maxSize: "50MB" },
    },
    report: {
      enabled: true,
      targets: ["national-1"],
      autoReport: true,
      interval: 60,
      retryCount: 3,
      retryInterval: 30,
      dataTypes: ["pcap", "flowLog", "metadata"],
    },
    storage: {
      location: "local",
      retention: "7d",
      path: "/data/extraction/ext-001",
    },
    stats: {
      inputRate: "2.4 Gbps",
      pcapCount: 1256,
      flowLogCount: "8.2M",
      metadataCount: "15.6M",
      restoredFiles: 4521,
      errorRate: "0.02%",
      reportSuccess: "99.8%",
      reportPending: 12,
    },
    lastUpdate: "2024-01-15 14:32:00"
  },
  {
    id: "EXT-002",
    name: "城域网加密流量分析",
    sourceTask: "TASK-2024-003",
    sourceTaskName: "城域网加密流量采集",
    status: "running",
    link: "LK-CITY-03",
    config: {
      pcap: true,
      flowLog: true,
      metadata: true,
      fileRestore: false,
      protocols: ["TLS", "SSH"],
      pcapConfig: { splitSize: "128MB", splitTime: 30, compress: true },
      flowLogConfig: { fields: ["五元组", "时间戳", "包数", "字节数"], format: "json" },
      metadataConfig: { protocols: ["TLS", "SSH"], depth: "basic" },
      fileRestoreConfig: { types: [], maxSize: "0" },
    },
    report: {
      enabled: true,
      targets: ["national-1", "provincial"],
      autoReport: true,
      interval: 30,
      retryCount: 5,
      retryInterval: 60,
      dataTypes: ["flowLog", "metadata"],
    },
    storage: {
      location: "local",
      retention: "3d",
      path: "/data/extraction/ext-002",
    },
    stats: {
      inputRate: "1.8 Gbps",
      pcapCount: 892,
      flowLogCount: "5.1M",
      metadataCount: "9.2M",
      restoredFiles: 0,
      errorRate: "0.01%",
      reportSuccess: "100%",
      reportPending: 0,
    },
    lastUpdate: "2024-01-15 14:31:45"
  },
  {
    id: "EXT-003",
    name: "IDC邮件协议提取",
    sourceTask: "TASK-2024-008",
    sourceTaskName: "IDC邮件协议监测",
    status: "paused",
    link: "LK-IDC-02",
    config: {
      pcap: false,
      flowLog: true,
      metadata: true,
      fileRestore: true,
      protocols: ["SMTP", "POP3", "IMAP"],
      pcapConfig: { splitSize: "256MB", splitTime: 60, compress: false },
      flowLogConfig: { fields: ["五元组", "时间戳", "包数", "字节数", "标志位"], format: "csv" },
      metadataConfig: { protocols: ["SMTP", "POP3", "IMAP"], depth: "full" },
      fileRestoreConfig: { types: ["document", "archive"], maxSize: "100MB" },
    },
    report: {
      enabled: false,
      targets: [],
      autoReport: false,
      interval: 0,
      retryCount: 0,
      retryInterval: 0,
      dataTypes: [],
    },
    storage: {
      location: "local",
      retention: "30d",
      path: "/data/extraction/ext-003",
    },
    stats: {
      inputRate: "0 Mbps",
      pcapCount: 0,
      flowLogCount: "2.3M",
      metadataCount: "4.8M",
      restoredFiles: 12890,
      errorRate: "0.05%",
      reportSuccess: "-",
      reportPending: 0,
    },
    lastUpdate: "2024-01-15 10:15:00"
  },
]

// 单个任务的详细输出数据
const taskOutputData = {
  pcapFiles: [
    { id: 1, filename: "EXT001_20240115_143200.pcap", timeRange: "14:32:00 - 14:32:59", size: "256 MB", storage: "本地", pushStatus: "success", taskId: "EXT-001" },
    { id: 2, filename: "EXT001_20240115_143300.pcap", timeRange: "14:33:00 - 14:33:59", size: "312 MB", storage: "本地", pushStatus: "success", taskId: "EXT-001" },
    { id: 3, filename: "EXT001_20240115_143400.pcap", timeRange: "14:34:00 - 14:34:59", size: "189 MB", storage: "本地", pushStatus: "pending", taskId: "EXT-001" },
  ],
  flowLogs: [
    { id: 1, srcIp: "192.168.1.100", srcPort: 45678, dstIp: "10.0.0.5", dstPort: 80, protocol: "TCP", packets: 1245, bytes: "1.8 MB", duration: "32.5s" },
    { id: 2, srcIp: "192.168.1.102", srcPort: 52341, dstIp: "10.0.0.8", dstPort: 443, protocol: "TCP", packets: 3892, bytes: "18.2 MB", duration: "125.8s" },
    { id: 3, srcIp: "192.168.1.105", srcPort: 38921, dstIp: "10.0.0.12", dstPort: 443, protocol: "TCP", packets: 856, bytes: "4.5 MB", duration: "18.2s" },
  ],
  metadata: {
    http: [
      { id: 1, method: "GET", url: "/api/users", host: "api.example.com", status: 200, contentType: "application/json" },
      { id: 2, method: "POST", url: "/api/login", host: "auth.example.com", status: 401, contentType: "application/json" },
    ],
    tls: [
      { id: 1, sni: "www.example.com", version: "TLS 1.3", cipher: "TLS_AES_256_GCM_SHA384", certIssuer: "DigiCert" },
      { id: 2, sni: "api.service.com", version: "TLS 1.2", cipher: "ECDHE-RSA-AES256-GCM", certIssuer: "Let's Encrypt" },
    ],
    dns: [
      { id: 1, queryType: "A", domain: "www.example.com", response: "93.184.216.34", ttl: 3600 },
    ],
  },
  restoredFiles: [
    { id: 1, protocol: "HTTP", fileType: "application/pdf", source: "192.168.1.100 -> 10.0.0.5", hash: "a1b2c3d4...", size: "2.4 MB", risk: "low" },
    { id: 2, protocol: "HTTP", fileType: "application/zip", source: "192.168.1.102 -> 10.0.0.8", hash: "f6e5d4c3...", size: "15.8 MB", risk: "medium" },
  ],
  errors: [
    { id: 1, type: "重组失败", session: "192.168.1.100:45678 -> 10.0.0.5:80", errorMsg: "分片超时", time: "14:32:15", count: 12 },
    { id: 2, type: "解析失败", session: "192.168.1.102:52341 -> 10.0.0.8:21", errorMsg: "协议不支持", time: "14:33:22", count: 5 },
  ]
}

// 新建任务表单初始值
const initialNewTaskForm = {
  name: "",
  sourceTask: "",
  // 提取项配置
  pcapEnabled: true,
  flowLogEnabled: true,
  metadataEnabled: true,
  fileRestoreEnabled: false,
  // PCAP配置
  pcapSplitSize: "256MB",
  pcapSplitTime: "60",
  pcapCompress: true,
  // 流日志配置
  flowLogFields: ["五元组", "时间戳", "包数", "字节数"],
  flowLogFormat: "json",
  // 元数据配置
  metadataProtocols: ["HTTP", "TLS", "DNS"],
  metadataDepth: "full",
  // 文件还原配置
  fileRestoreTypes: ["document", "archive"],
  fileRestoreMaxSize: "50MB",
  // 存储配置
  storageLocation: "local",
  storageRetention: "7d",
  storagePath: "/data/extraction/",
  // 上报配置
  reportEnabled: true,
  reportTargets: ["national-1"],
  reportAutoReport: true,
  reportInterval: "60",
  reportRetryCount: "3",
  reportRetryInterval: "30",
  reportDataTypes: ["pcap", "flowLog", "metadata"],
}

export function ExtractionDetail() {
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("pcap")
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [createStep, setCreateStep] = React.useState(1)
  const [metadataType, setMetadataType] = React.useState("http")
  const [newTaskForm, setNewTaskForm] = React.useState(initialNewTaskForm)

  const currentTask = extractionTasks.find(t => t.id === selectedTask)

  const updateForm = (field: string, value: unknown) => {
    setNewTaskForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: string, item: string) => {
    setNewTaskForm(prev => {
      const arr = prev[field as keyof typeof prev] as string[]
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(i => i !== item) }
      } else {
        return { ...prev, [field]: [...arr, item] }
      }
    })
  }

  const resetCreateDialog = () => {
    setCreateStep(1)
    setNewTaskForm(initialNewTaskForm)
    setCreateDialogOpen(false)
  }

  const selectedSourceTask = sourceTaskOptions.find(t => t.id === newTaskForm.sourceTask)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">信息提取</h1>
          <p className="text-sm text-muted-foreground mt-1">管理提取任务配置，查看提取结果</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：任务列表 */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>提取任务</span>
                <Badge variant="secondary">{extractionTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {extractionTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-all border",
                    selectedTask === task.id
                      ? "bg-primary/10 border-primary"
                      : "bg-secondary/30 border-transparent hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        源任务: {task.sourceTaskName}
                      </div>
                    </div>
                    <Badge
                      variant={task.status === "running" ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        task.status === "running" && "bg-green-500/20 text-green-500 border-green-500/30"
                      )}
                    >
                      {task.status === "running" ? "运行中" : "已暂停"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>链路: {task.link}</span>
                    <span>入流量: {task.stats.inputRate}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {task.config.pcap && <Badge variant="outline" className="text-[10px] px-1.5 py-0">PCAP</Badge>}
                    {task.config.flowLog && <Badge variant="outline" className="text-[10px] px-1.5 py-0">流日志</Badge>}
                    {task.config.metadata && <Badge variant="outline" className="text-[10px] px-1.5 py-0">元数据</Badge>}
                    {task.config.fileRestore && <Badge variant="outline" className="text-[10px] px-1.5 py-0">文件还原</Badge>}
                    {task.report.enabled && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-400 border-blue-500/30">
                        <Upload className="h-2.5 w-2.5 mr-0.5" />上报
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 快捷统计 */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">全局统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded bg-secondary/30">
                  <div className="text-lg font-bold text-foreground">2,148</div>
                  <div className="text-[10px] text-muted-foreground">PCAP文件</div>
                </div>
                <div className="text-center p-2 rounded bg-secondary/30">
                  <div className="text-lg font-bold text-foreground">15.6M</div>
                  <div className="text-[10px] text-muted-foreground">流日志</div>
                </div>
                <div className="text-center p-2 rounded bg-secondary/30">
                  <div className="text-lg font-bold text-foreground">29.6M</div>
                  <div className="text-[10px] text-muted-foreground">元数据</div>
                </div>
                <div className="text-center p-2 rounded bg-secondary/30">
                  <div className="text-lg font-bold text-foreground">17.4K</div>
                  <div className="text-[10px] text-muted-foreground">还原文件</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：任务详情和输出 */}
        <div className="lg:col-span-2">
          {selectedTask && currentTask ? (
            <div className="space-y-4">
              {/* 任务详情头部 */}
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{currentTask.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        ID: {currentTask.id} | 源任务: {currentTask.sourceTaskName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(true)}>
                        <Settings2 className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                      {currentTask.status === "running" ? (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-1" />
                          暂停
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          启动
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 提取配置概览 */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", currentTask.config.pcap ? "bg-green-500" : "bg-muted")} />
                      <span className="text-sm">PCAP提取</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", currentTask.config.flowLog ? "bg-green-500" : "bg-muted")} />
                      <span className="text-sm">流日志</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", currentTask.config.metadata ? "bg-green-500" : "bg-muted")} />
                      <span className="text-sm">协议元数据</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", currentTask.config.fileRestore ? "bg-green-500" : "bg-muted")} />
                      <span className="text-sm">文件还原</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", currentTask.report.enabled ? "bg-blue-500" : "bg-muted")} />
                      <span className="text-sm">自动上报</span>
                    </div>
                  </div>

                  {/* 实时统计 */}
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{currentTask.stats.inputRate}</div>
                      <div className="text-[10px] text-muted-foreground">入流量</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{currentTask.stats.pcapCount}</div>
                      <div className="text-[10px] text-muted-foreground">PCAP数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{currentTask.stats.flowLogCount}</div>
                      <div className="text-[10px] text-muted-foreground">流日志</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{currentTask.stats.metadataCount}</div>
                      <div className="text-[10px] text-muted-foreground">元数据</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{currentTask.stats.restoredFiles}</div>
                      <div className="text-[10px] text-muted-foreground">还原文件</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-yellow-500">{currentTask.stats.errorRate}</div>
                      <div className="text-[10px] text-muted-foreground">异常率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-500">{currentTask.stats.reportSuccess}</div>
                      <div className="text-[10px] text-muted-foreground">上报成功</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-400">{currentTask.stats.reportPending}</div>
                      <div className="text-[10px] text-muted-foreground">待上报</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 输出结果 */}
              <Card className="bg-card border-border">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <TabsList>
                        <TabsTrigger value="pcap" className="gap-1.5">
                          <FileArchive className="h-3.5 w-3.5" />
                          PCAP
                        </TabsTrigger>
                        <TabsTrigger value="flowLog" className="gap-1.5">
                          <ScrollText className="h-3.5 w-3.5" />
                          流日志
                        </TabsTrigger>
                        <TabsTrigger value="metadata" className="gap-1.5">
                          <Code className="h-3.5 w-3.5" />
                          元数据
                        </TabsTrigger>
                        <TabsTrigger value="files" className="gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          还原文件
                        </TabsTrigger>
                        <TabsTrigger value="errors" className="gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          异常
                        </TabsTrigger>
                      </TabsList>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="搜索..." className="pl-8 h-8 w-48 bg-secondary border-0" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* PCAP 文件 */}
                    <TabsContent value="pcap" className="m-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead>文件名</TableHead>
                            <TableHead>时间范围</TableHead>
                            <TableHead>大小</TableHead>
                            <TableHead>存储</TableHead>
                            <TableHead>上报状态</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taskOutputData.pcapFiles.map((file) => (
                            <TableRow key={file.id} className="border-border">
                              <TableCell className="font-mono text-sm">{file.filename}</TableCell>
                              <TableCell className="text-muted-foreground">{file.timeRange}</TableCell>
                              <TableCell>{file.size}</TableCell>
                              <TableCell><Badge variant="outline">{file.storage}</Badge></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {file.pushStatus === "success" && <><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-green-500 text-sm">成功</span></>}
                                  {file.pushStatus === "pending" && <><Clock className="h-4 w-4 text-yellow-500" /><span className="text-yellow-500 text-sm">待上报</span></>}
                                  {file.pushStatus === "failed" && <><XCircle className="h-4 w-4 text-red-500" /><span className="text-red-500 text-sm">失败</span></>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    {/* 流日志 */}
                    <TabsContent value="flowLog" className="m-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead>源IP:端口</TableHead>
                            <TableHead>目的IP:端口</TableHead>
                            <TableHead>协议</TableHead>
                            <TableHead>包数</TableHead>
                            <TableHead>字节数</TableHead>
                            <TableHead>持续时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taskOutputData.flowLogs.map((log) => (
                            <TableRow key={log.id} className="border-border">
                              <TableCell className="font-mono text-sm">{log.srcIp}:{log.srcPort}</TableCell>
                              <TableCell className="font-mono text-sm">{log.dstIp}:{log.dstPort}</TableCell>
                              <TableCell><Badge variant="outline">{log.protocol}</Badge></TableCell>
                              <TableCell>{log.packets.toLocaleString()}</TableCell>
                              <TableCell>{log.bytes}</TableCell>
                              <TableCell>{log.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    {/* 协议元数据 */}
                    <TabsContent value="metadata" className="m-0">
                      <div className="mb-4">
                        <Select value={metadataType} onValueChange={setMetadataType}>
                          <SelectTrigger className="w-32 bg-secondary border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="http">HTTP</SelectItem>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="dns">DNS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {metadataType === "http" && (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead>方法</TableHead>
                              <TableHead>URL</TableHead>
                              <TableHead>Host</TableHead>
                              <TableHead>状态码</TableHead>
                              <TableHead>Content-Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taskOutputData.metadata.http.map((item) => (
                              <TableRow key={item.id} className="border-border">
                                <TableCell><Badge variant="outline">{item.method}</Badge></TableCell>
                                <TableCell className="font-mono text-sm max-w-48 truncate">{item.url}</TableCell>
                                <TableCell>{item.host}</TableCell>
                                <TableCell>
                                  <Badge variant={item.status < 400 ? "default" : "destructive"} className={item.status < 400 ? "bg-green-500/20 text-green-500" : ""}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{item.contentType}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {metadataType === "tls" && (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead>SNI</TableHead>
                              <TableHead>版本</TableHead>
                              <TableHead>加密套件</TableHead>
                              <TableHead>证书颁发者</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taskOutputData.metadata.tls.map((item) => (
                              <TableRow key={item.id} className="border-border">
                                <TableCell className="font-mono">{item.sni}</TableCell>
                                <TableCell><Badge variant="outline">{item.version}</Badge></TableCell>
                                <TableCell className="font-mono text-sm">{item.cipher}</TableCell>
                                <TableCell>{item.certIssuer}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {metadataType === "dns" && (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead>查询类型</TableHead>
                              <TableHead>域名</TableHead>
                              <TableHead>响应</TableHead>
                              <TableHead>TTL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taskOutputData.metadata.dns.map((item) => (
                              <TableRow key={item.id} className="border-border">
                                <TableCell><Badge variant="outline">{item.queryType}</Badge></TableCell>
                                <TableCell className="font-mono">{item.domain}</TableCell>
                                <TableCell className="font-mono">{item.response}</TableCell>
                                <TableCell>{item.ttl}s</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </TabsContent>

                    {/* 还原文件 */}
                    <TabsContent value="files" className="m-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead>协议</TableHead>
                            <TableHead>文件类型</TableHead>
                            <TableHead>来源</TableHead>
                            <TableHead>哈希</TableHead>
                            <TableHead>大小</TableHead>
                            <TableHead>风险</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taskOutputData.restoredFiles.map((file) => (
                            <TableRow key={file.id} className="border-border">
                              <TableCell><Badge variant="outline">{file.protocol}</Badge></TableCell>
                              <TableCell className="font-mono text-sm">{file.fileType}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{file.source}</TableCell>
                              <TableCell className="font-mono text-sm">{file.hash}</TableCell>
                              <TableCell>{file.size}</TableCell>
                              <TableCell>
                                <Badge variant={file.risk === "high" ? "destructive" : file.risk === "medium" ? "default" : "secondary"} className={cn(file.risk === "low" && "bg-green-500/20 text-green-500", file.risk === "medium" && "bg-yellow-500/20 text-yellow-500")}>
                                  {file.risk === "high" ? "高危" : file.risk === "medium" ? "中危" : "低危"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    {/* 解析异常 */}
                    <TabsContent value="errors" className="m-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border">
                            <TableHead>异常类型</TableHead>
                            <TableHead>会话</TableHead>
                            <TableHead>错误信息</TableHead>
                            <TableHead>时间</TableHead>
                            <TableHead>次数</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {taskOutputData.errors.map((error) => (
                            <TableRow key={error.id} className="border-border">
                              <TableCell><Badge variant="destructive">{error.type}</Badge></TableCell>
                              <TableCell className="font-mono text-sm">{error.session}</TableCell>
                              <TableCell className="text-muted-foreground">{error.errorMsg}</TableCell>
                              <TableCell>{error.time}</TableCell>
                              <TableCell>{error.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <FileSearch className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">选择提取任务</h3>
                <p className="text-sm text-muted-foreground">从左侧列表选择一个任务查看详情和输出结果</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 配置弹窗 */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>提取配置 - {currentTask?.name}</DialogTitle>
            <DialogDescription>配置提取项、存储策略和上报参数</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 提取项开关 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileArchive className="h-4 w-4" />
                提取项配置
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <FileArchive className="h-4 w-4 text-muted-foreground" />
                    <Label>PCAP 文件提取</Label>
                  </div>
                  <Switch defaultChecked={currentTask?.config.pcap} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-muted-foreground" />
                    <Label>流日志提取</Label>
                  </div>
                  <Switch defaultChecked={currentTask?.config.flowLog} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <Label>协议元数据提取</Label>
                  </div>
                  <Switch defaultChecked={currentTask?.config.metadata} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label>文件还原</Label>
                  </div>
                  <Switch defaultChecked={currentTask?.config.fileRestore} />
                </div>
              </div>
            </div>

            {/* 协议选择 */}
            <div>
              <h4 className="text-sm font-medium mb-3">协议范围</h4>
              <div className="flex flex-wrap gap-2">
                {["HTTP", "HTTPS", "DNS", "TLS", "SSH", "FTP", "SMTP", "POP3", "IMAP", "SOCKS"].map((protocol) => (
                  <Badge
                    key={protocol}
                    variant={currentTask?.config.protocols.includes(protocol) ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {protocol}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 存储配置 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Server className="h-4 w-4" />
                存储配置
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">PCAP 保留时间</Label>
                  <Select defaultValue={currentTask?.storage.retention}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1天</SelectItem>
                      <SelectItem value="3d">3天</SelectItem>
                      <SelectItem value="7d">7天</SelectItem>
                      <SelectItem value="30d">30天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">存储位置</Label>
                  <Select defaultValue={currentTask?.storage.location}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">本地存储</SelectItem>
                      <SelectItem value="remote">远程存储</SelectItem>
                      <SelectItem value="both">本地+远程</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">存储路径</Label>
                  <Input defaultValue={currentTask?.storage.path} className="mt-1" />
                </div>
              </div>
            </div>

            {/* 上报配置 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                上报配置
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <Label>启用上报</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">开启后提取结果将推送至配置的目标平台</p>
                  </div>
                  <Switch defaultChecked={currentTask?.report.enabled} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">上报目标</Label>
                    <div className="mt-2 space-y-2">
                      {reportTargetOptions.map((target) => (
                        <div key={target.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={target.id} 
                            defaultChecked={currentTask?.report.targets.includes(target.id)} 
                          />
                          <label htmlFor={target.id} className="text-sm flex-1 cursor-pointer">
                            {target.name}
                            <span className="text-xs text-muted-foreground ml-2">({target.address})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">上报数据类型</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        { id: "pcap", label: "PCAP 文件" },
                        { id: "flowLog", label: "流日志" },
                        { id: "metadata", label: "协议元数据" },
                        { id: "files", label: "还原文件" },
                      ].map((type) => (
                        <div key={type.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`report-${type.id}`} 
                            defaultChecked={currentTask?.report.dataTypes.includes(type.id)} 
                          />
                          <label htmlFor={`report-${type.id}`} className="text-sm cursor-pointer">
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">上报间隔 (秒)</Label>
                    <Input type="number" defaultValue={currentTask?.report.interval} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">重试次数</Label>
                    <Input type="number" defaultValue={currentTask?.report.retryCount} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">重试间隔 (秒)</Label>
                    <Input type="number" defaultValue={currentTask?.report.retryInterval} className="mt-1" />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2 p-2 rounded bg-secondary/30 w-full justify-center">
                      <Checkbox id="auto-report" defaultChecked={currentTask?.report.autoReport} />
                      <label htmlFor="auto-report" className="text-sm cursor-pointer">自动上报</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>取消</Button>
            <Button onClick={() => setConfigDialogOpen(false)}>保存配置</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 新建任务弹窗 */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => !open && resetCreateDialog()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建提取任务</DialogTitle>
            <DialogDescription>
              配置信息提取任务，从采集任务获取流量并提取所需信息
            </DialogDescription>
          </DialogHeader>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-between py-4 border-b">
            {[
              { step: 1, label: "基本信息" },
              { step: 2, label: "提取配置" },
              { step: 3, label: "存储配置" },
              { step: 4, label: "上报配置" },
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div 
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    createStep >= item.step ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setCreateStep(item.step)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    createStep >= item.step ? "bg-primary text-primary-foreground" : "bg-secondary"
                  )}>
                    {item.step}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
                </div>
                {index < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>

          <div className="py-6">
            {/* 步骤1: 基本信息 */}
            {createStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>任务名称 <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="例如：省网HTTP流量提取" 
                    className="mt-2"
                    value={newTaskForm.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>关联采集任务 <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-muted-foreground mt-1">选择要提取信息的源采集任务</p>
                  <Select value={newTaskForm.sourceTask} onValueChange={(v) => updateForm("sourceTask", v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择采集任务" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTaskOptions.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center gap-2">
                            <span>{task.name}</span>
                            <Badge variant="outline" className="text-[10px]">{task.link}</Badge>
                            <Badge 
                              variant={task.status === "running" ? "default" : "secondary"}
                              className={cn("text-[10px]", task.status === "running" && "bg-green-500/20 text-green-500")}
                            >
                              {task.status === "running" ? "运行中" : "已暂停"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSourceTask && (
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">已选择采集任务</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">任务ID: </span>
                        <span className="font-mono">{selectedSourceTask.id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">接入链路: </span>
                        <span>{selectedSourceTask.link}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">状态: </span>
                        <Badge 
                          variant={selectedSourceTask.status === "running" ? "default" : "secondary"}
                          className={cn("text-xs", selectedSourceTask.status === "running" && "bg-green-500/20 text-green-500")}
                        >
                          {selectedSourceTask.status === "running" ? "运行中" : "已暂停"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 步骤2: 提取配置 */}
            {createStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <FileArchive className="h-4 w-4" />
                    提取项配置
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* PCAP */}
                    <div className={cn("p-4 rounded-lg border transition-colors", newTaskForm.pcapEnabled ? "border-primary bg-primary/5" : "border-border bg-secondary/30")}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileArchive className="h-4 w-4" />
                          <Label>PCAP 文件提取</Label>
                        </div>
                        <Switch checked={newTaskForm.pcapEnabled} onCheckedChange={(v) => updateForm("pcapEnabled", v)} />
                      </div>
                      {newTaskForm.pcapEnabled && (
                        <div className="space-y-3 pt-3 border-t border-border/50">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">分片大小</Label>
                              <Select value={newTaskForm.pcapSplitSize} onValueChange={(v) => updateForm("pcapSplitSize", v)}>
                                <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="64MB">64MB</SelectItem>
                                  <SelectItem value="128MB">128MB</SelectItem>
                                  <SelectItem value="256MB">256MB</SelectItem>
                                  <SelectItem value="512MB">512MB</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">分片时间(秒)</Label>
                              <Input type="number" className="mt-1 h-8" value={newTaskForm.pcapSplitTime} onChange={(e) => updateForm("pcapSplitTime", e.target.value)} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={newTaskForm.pcapCompress} onCheckedChange={(v) => updateForm("pcapCompress", v)} id="pcap-compress" />
                            <label htmlFor="pcap-compress" className="text-xs cursor-pointer">启用压缩存储</label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 流日志 */}
                    <div className={cn("p-4 rounded-lg border transition-colors", newTaskForm.flowLogEnabled ? "border-primary bg-primary/5" : "border-border bg-secondary/30")}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ScrollText className="h-4 w-4" />
                          <Label>流日志提取</Label>
                        </div>
                        <Switch checked={newTaskForm.flowLogEnabled} onCheckedChange={(v) => updateForm("flowLogEnabled", v)} />
                      </div>
                      {newTaskForm.flowLogEnabled && (
                        <div className="space-y-3 pt-3 border-t border-border/50">
                          <div>
                            <Label className="text-xs text-muted-foreground">提取字段</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {["五元组", "时间戳", "包数", "字节数", "标志位", "TTL"].map((field) => (
                                <Badge 
                                  key={field} 
                                  variant={newTaskForm.flowLogFields.includes(field) ? "default" : "outline"} 
                                  className="cursor-pointer text-xs"
                                  onClick={() => toggleArrayItem("flowLogFields", field)}
                                >
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">输出格式</Label>
                            <Select value={newTaskForm.flowLogFormat} onValueChange={(v) => updateForm("flowLogFormat", v)}>
                              <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="binary">Binary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 协议元数据 */}
                    <div className={cn("p-4 rounded-lg border transition-colors", newTaskForm.metadataEnabled ? "border-primary bg-primary/5" : "border-border bg-secondary/30")}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          <Label>协议元数据提取</Label>
                        </div>
                        <Switch checked={newTaskForm.metadataEnabled} onCheckedChange={(v) => updateForm("metadataEnabled", v)} />
                      </div>
                      {newTaskForm.metadataEnabled && (
                        <div className="space-y-3 pt-3 border-t border-border/50">
                          <div>
                            <Label className="text-xs text-muted-foreground">协议类型</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {["HTTP", "TLS", "DNS", "SSH", "FTP", "SMTP"].map((protocol) => (
                                <Badge 
                                  key={protocol} 
                                  variant={newTaskForm.metadataProtocols.includes(protocol) ? "default" : "outline"} 
                                  className="cursor-pointer text-xs"
                                  onClick={() => toggleArrayItem("metadataProtocols", protocol)}
                                >
                                  {protocol}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">解析深度</Label>
                            <Select value={newTaskForm.metadataDepth} onValueChange={(v) => updateForm("metadataDepth", v)}>
                              <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">基础 (头部字段)</SelectItem>
                                <SelectItem value="full">完整 (含Payload)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 文件还原 */}
                    <div className={cn("p-4 rounded-lg border transition-colors", newTaskForm.fileRestoreEnabled ? "border-primary bg-primary/5" : "border-border bg-secondary/30")}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <Label>文件还原</Label>
                        </div>
                        <Switch checked={newTaskForm.fileRestoreEnabled} onCheckedChange={(v) => updateForm("fileRestoreEnabled", v)} />
                      </div>
                      {newTaskForm.fileRestoreEnabled && (
                        <div className="space-y-3 pt-3 border-t border-border/50">
                          <div>
                            <Label className="text-xs text-muted-foreground">文件类型</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {["document", "archive", "image", "video", "audio", "executable"].map((type) => (
                                <Badge 
                                  key={type} 
                                  variant={newTaskForm.fileRestoreTypes.includes(type) ? "default" : "outline"} 
                                  className="cursor-pointer text-xs"
                                  onClick={() => toggleArrayItem("fileRestoreTypes", type)}
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">最大文件大小</Label>
                            <Select value={newTaskForm.fileRestoreMaxSize} onValueChange={(v) => updateForm("fileRestoreMaxSize", v)}>
                              <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10MB">10MB</SelectItem>
                                <SelectItem value="50MB">50MB</SelectItem>
                                <SelectItem value="100MB">100MB</SelectItem>
                                <SelectItem value="unlimited">不限制</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤3: 存储配置 */}
            {createStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Server className="h-4 w-4" />
                    存储配置
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">存储位置 <span className="text-red-500">*</span></Label>
                      <Select value={newTaskForm.storageLocation} onValueChange={(v) => updateForm("storageLocation", v)}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">本地存储</SelectItem>
                          <SelectItem value="remote">远程存储</SelectItem>
                          <SelectItem value="both">本地+远程</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">数据保留时间 <span className="text-red-500">*</span></Label>
                      <Select value={newTaskForm.storageRetention} onValueChange={(v) => updateForm("storageRetention", v)}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1d">1天</SelectItem>
                          <SelectItem value="3d">3天</SelectItem>
                          <SelectItem value="7d">7天</SelectItem>
                          <SelectItem value="14d">14天</SelectItem>
                          <SelectItem value="30d">30天</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">存储路径</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="/data/extraction/" 
                        value={newTaskForm.storagePath}
                        onChange={(e) => updateForm("storagePath", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">存储说明</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>- 本地存储：数据保存在本地服务器，访问速度快，但容量有限</li>
                    <li>- 远程存储：数据保存在远程存储集群，容量大，但访问延迟较高</li>
                    <li>- 本地+远程：数据同时保存在本地和远程，本地用于快速访问，远程用于长期归档</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 步骤4: 上报配置 */}
            {createStep === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 mb-4">
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-blue-400" />
                      <div>
                        <Label className="text-base">启用数据上报</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">开启后提取结果将自动推送至配置的目标平台</p>
                      </div>
                    </div>
                    <Switch checked={newTaskForm.reportEnabled} onCheckedChange={(v) => updateForm("reportEnabled", v)} />
                  </div>
                </div>

                {newTaskForm.reportEnabled && (
                  <>
                    <div>
                      <Label className="text-sm mb-3 block">上报目标 <span className="text-red-500">*</span></Label>
                      <div className="space-y-2">
                        {reportTargetOptions.map((target) => (
                          <div 
                            key={target.id} 
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                              newTaskForm.reportTargets.includes(target.id) ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                            )}
                            onClick={() => toggleArrayItem("reportTargets", target.id)}
                          >
                            <Checkbox checked={newTaskForm.reportTargets.includes(target.id)} />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{target.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{target.address}</span>
                                <Badge variant="outline" className="text-[10px]">{target.protocol}</Badge>
                              </div>
                            </div>
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-3 block">上报数据类型</Label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: "pcap", label: "PCAP 文件", icon: FileArchive },
                          { id: "flowLog", label: "流日志", icon: ScrollText },
                          { id: "metadata", label: "协议元数据", icon: Code },
                          { id: "files", label: "还原文件", icon: FileText },
                        ].map((type) => (
                          <div 
                            key={type.id} 
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                              newTaskForm.reportDataTypes.includes(type.id) ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                            )}
                            onClick={() => toggleArrayItem("reportDataTypes", type.id)}
                          >
                            <Checkbox checked={newTaskForm.reportDataTypes.includes(type.id)} />
                            <type.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{type.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-3 block">上报策略</Label>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">上报间隔 (秒)</Label>
                          <Input 
                            type="number" 
                            className="mt-1" 
                            value={newTaskForm.reportInterval}
                            onChange={(e) => updateForm("reportInterval", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">重试次数</Label>
                          <Input 
                            type="number" 
                            className="mt-1" 
                            value={newTaskForm.reportRetryCount}
                            onChange={(e) => updateForm("reportRetryCount", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">重试间隔 (秒)</Label>
                          <Input 
                            type="number" 
                            className="mt-1" 
                            value={newTaskForm.reportRetryInterval}
                            onChange={(e) => updateForm("reportRetryInterval", e.target.value)}
                          />
                        </div>
                        <div className="flex items-end">
                          <div 
                            className={cn(
                              "flex items-center gap-2 p-2 rounded border w-full justify-center cursor-pointer transition-colors",
                              newTaskForm.reportAutoReport ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                            )}
                            onClick={() => updateForm("reportAutoReport", !newTaskForm.reportAutoReport)}
                          >
                            <Checkbox checked={newTaskForm.reportAutoReport} />
                            <label className="text-sm cursor-pointer">自动上报</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-500">上报注意事项</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- 请确保上报目标网络可达，建议先进行连通性测试</li>
                        <li>- PCAP 文件体积较大，建议根据网络带宽调整上报间隔</li>
                        <li>- 上报失败的数据会自动重试，超过重试次数后标记为失败</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => createStep > 1 ? setCreateStep(createStep - 1) : resetCreateDialog()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {createStep > 1 ? "上一步" : "取消"}
            </Button>
            <div className="flex gap-2">
              {createStep < 4 ? (
                <Button 
                  onClick={() => setCreateStep(createStep + 1)}
                  disabled={createStep === 1 && (!newTaskForm.name || !newTaskForm.sourceTask)}
                >
                  下一步
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={resetCreateDialog}>
                  创建任务
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
