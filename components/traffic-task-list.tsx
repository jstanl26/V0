"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Eye,
  Trash2,
  Upload,
  Download,
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileJson,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import {
  CommandSource,
  CommandLevel,
  CommandScene,
  DataOutputMethod,
  TrafficReportType,
  RuleType,
  OperatorCodes,
} from "@/lib/command-types"

// 模拟指令数据 - 符合 F.1.35 规范
const commandsData = [
  {
    commandId: 10001,
    commandSource: 1,
    level: 1,
    owner: "admin",
    createTime: "2024-01-15 14:32:18",
    operationType: 0,
    comCode: "0010",
    effectProvince: ["110000", "310000", "440000"],
    commandScene: 0,
    dataOutputMethod: 4,
    rulesCount: 3,
    ruleTypes: [1, 8], // 五元组+Host
    status: "running",
    hitTraffic: "12.5 Gbps",
    reportStatus: "success"
  },
  {
    commandId: 10002,
    commandSource: 1,
    level: 2,
    owner: "operator1",
    createTime: "2024-01-15 14:30:05",
    operationType: 0,
    comCode: "0011",
    effectProvince: ["320000", "330000"],
    commandScene: 1,
    dataOutputMethod: 0,
    rulesCount: 2,
    ruleTypes: [9, 3], // SNI+特征码
    status: "running",
    hitTraffic: "8.2 Gbps",
    reportStatus: "success"
  },
  {
    commandId: 10003,
    commandSource: 2,
    level: 2,
    owner: "analyst",
    createTime: "2024-01-15 14:28:42",
    operationType: 0,
    comCode: "0013",
    effectProvince: ["510000"],
    commandScene: 2,
    dataOutputMethod: 5,
    rulesCount: 1,
    ruleTypes: [11], // 应用协议
    status: "running",
    hitTraffic: "5.6 Gbps",
    reportStatus: "success"
  },
  {
    commandId: 10004,
    commandSource: 1,
    level: 1,
    owner: "admin",
    createTime: "2024-01-14 23:15:30",
    operationType: 0,
    comCode: "0010",
    effectProvince: ["440000", "450000"],
    commandScene: 1,
    dataOutputMethod: 1,
    rulesCount: 4,
    ruleTypes: [10, 3], // URL+特征码
    status: "paused",
    hitTraffic: "0 Gbps",
    reportStatus: "pending"
  },
  {
    commandId: 10005,
    commandSource: 2,
    level: 3,
    owner: "monitor",
    createTime: "2024-01-14 18:45:22",
    operationType: 0,
    comCode: "0011",
    effectProvince: ["610000", "620000", "630000"],
    commandScene: 2,
    dataOutputMethod: 5,
    rulesCount: 2,
    ruleTypes: [0], // 无规则
    status: "running",
    hitTraffic: "3.2 Gbps",
    reportStatus: "success"
  },
  {
    commandId: 10006,
    commandSource: 1,
    level: 1,
    owner: "admin",
    createTime: "2024-01-14 16:22:10",
    operationType: 0,
    comCode: "0010",
    effectProvince: ["110000"],
    commandScene: 1,
    dataOutputMethod: 2,
    rulesCount: 3,
    ruleTypes: [7, 9], // CS+SNI
    status: "error",
    hitTraffic: "0 Gbps",
    reportStatus: "failed"
  },
  {
    commandId: 10007,
    commandSource: 2,
    level: 2,
    owner: "operator2",
    createTime: "2024-01-14 10:30:45",
    operationType: 0,
    comCode: "0013",
    effectProvince: ["420000", "430000"],
    commandScene: 0,
    dataOutputMethod: 4,
    rulesCount: 1,
    ruleTypes: [1], // 五元组
    status: "running",
    hitTraffic: "1.8 Gbps",
    reportStatus: "success"
  },
  {
    commandId: 10008,
    commandSource: 1,
    level: 2,
    owner: "admin",
    createTime: "2024-01-13 22:00:00",
    operationType: 0,
    comCode: "0010",
    effectProvince: ["310000", "320000", "330000", "340000"],
    commandScene: 1,
    dataOutputMethod: 3,
    rulesCount: 5,
    ruleTypes: [2, 3], // 掩码五元组+特征码
    status: "completed",
    hitTraffic: "-",
    reportStatus: "success"
  },
]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  running: { label: "运行中", variant: "default", icon: <Play className="h-3 w-3" /> },
  paused: { label: "已暂停", variant: "secondary", icon: <Pause className="h-3 w-3" /> },
  error: { label: "异常", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  completed: { label: "已完成", variant: "outline", icon: <CheckCircle className="h-3 w-3" /> },
}

const reportStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  success: { label: "成功", color: "text-green-500", icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: "待上报", color: "text-yellow-500", icon: <Clock className="h-3 w-3" /> },
  failed: { label: "失败", color: "text-red-500", icon: <AlertCircle className="h-3 w-3" /> },
}

interface TrafficTaskListProps {
  onCreateTask?: () => void
}

export function TrafficTaskList({ onCreateTask }: TrafficTaskListProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [sceneFilter, setSceneFilter] = React.useState("all")
  const [selectedCommands, setSelectedCommands] = React.useState<number[]>([])
  const [detailCommand, setDetailCommand] = React.useState<typeof commandsData[0] | null>(null)

  const filteredCommands = commandsData.filter((cmd) => {
    const matchesSearch = 
      String(cmd.commandId).includes(searchTerm) ||
      cmd.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cmd.status === statusFilter
    const matchesSource = sourceFilter === "all" || String(cmd.commandSource) === sourceFilter
    const matchesScene = sceneFilter === "all" || String(cmd.commandScene) === sceneFilter
    return matchesSearch && matchesStatus && matchesSource && matchesScene
  })

  const toggleCommandSelection = (commandId: number) => {
    setSelectedCommands(prev => 
      prev.includes(commandId) 
        ? prev.filter(id => id !== commandId)
        : [...prev, commandId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedCommands.length === filteredCommands.length) {
      setSelectedCommands([])
    } else {
      setSelectedCommands(filteredCommands.map(c => c.commandId))
    }
  }

  const getRuleTypesDisplay = (ruleTypes: number[]) => {
    return ruleTypes.map(t => {
      const name = RuleType[t as keyof typeof RuleType]
      // 简化显示
      return name?.replace("规则", "").replace("灵活", "").replace("固定位置", "固定").replace("全包浮动位置", "浮动") || t
    }).join("+")
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">动态流量获取指令管理</h1>
          <p className="text-sm text-muted-foreground mt-1">F.1.35 公共互联网动态流量获取指令下发</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入指令
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出指令
          </Button>
          <Button size="sm" onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            新建指令
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{commandsData.filter(c => c.status === "running").length}</div>
            <div className="text-xs text-muted-foreground mt-1">运行中</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{commandsData.filter(c => c.status === "paused").length}</div>
            <div className="text-xs text-muted-foreground mt-1">已暂停</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{commandsData.filter(c => c.status === "error").length}</div>
            <div className="text-xs text-muted-foreground mt-1">异常</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{commandsData.filter(c => c.status === "completed").length}</div>
            <div className="text-xs text-muted-foreground mt-1">已完成</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{commandsData.length}</div>
            <div className="text-xs text-muted-foreground mt-1">总指令数</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索栏 */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索指令ID或属主..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-secondary border-0"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 bg-secondary border-0">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="running">运行中</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                  <SelectItem value="error">异常</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-32 bg-secondary border-0">
                  <SelectValue placeholder="指令来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  {Object.entries(CommandSource).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sceneFilter} onValueChange={setSceneFilter}>
                <SelectTrigger className="w-40 bg-secondary border-0">
                  <SelectValue placeholder="指令场景" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部场景</SelectItem>
                  {Object.entries(CommandScene).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {selectedCommands.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedCommands.length} 项
                  </span>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    批量启用
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-1" />
                    批量暂停
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 指令列表表格 */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCommands.length === filteredCommands.length && filteredCommands.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-border"
                    />
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    <Button variant="ghost" className="h-8 p-0 font-medium hover:bg-transparent">
                      指令ID
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[100px]">指令来源</TableHead>
                  <TableHead className="min-w-[80px]">优先级</TableHead>
                  <TableHead className="min-w-[80px]">属主</TableHead>
                  <TableHead className="min-w-[80px]">运营商</TableHead>
                  <TableHead className="min-w-[140px]">指令场景</TableHead>
                  <TableHead className="min-w-[100px]">输出方式</TableHead>
                  <TableHead className="min-w-[120px]">规则类型</TableHead>
                  <TableHead className="min-w-[60px]">规则数</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[100px]">命中流量</TableHead>
                  <TableHead className="min-w-[80px]">上报状态</TableHead>
                  <TableHead className="min-w-[160px]">
                    <Button variant="ghost" className="h-8 p-0 font-medium hover:bg-transparent">
                      创建时间
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommands.map((cmd) => (
                  <TableRow key={cmd.commandId} className="border-border">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCommands.includes(cmd.commandId)}
                        onChange={() => toggleCommandSelection(cmd.commandId)}
                        className="rounded border-border"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cmd.commandId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {CommandSource[cmd.commandSource as keyof typeof CommandSource]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={cmd.level === 1 ? "destructive" : cmd.level === 2 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {CommandLevel[cmd.level as keyof typeof CommandLevel]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cmd.owner}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {OperatorCodes[cmd.comCode as keyof typeof OperatorCodes]?.slice(2) || cmd.comCode}
                    </TableCell>
                    <TableCell className="text-sm">
                      {CommandScene[cmd.commandScene as keyof typeof CommandScene]}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {DataOutputMethod[cmd.dataOutputMethod as keyof typeof DataOutputMethod]?.slice(0, 6)}...
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="text-xs font-mono">
                        {getRuleTypesDisplay(cmd.ruleTypes)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{cmd.rulesCount}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[cmd.status]?.variant || "default"} className="gap-1">
                        {statusConfig[cmd.status]?.icon}
                        {statusConfig[cmd.status]?.label || cmd.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cmd.hitTraffic}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 text-sm ${reportStatusConfig[cmd.reportStatus]?.color}`}>
                        {reportStatusConfig[cmd.reportStatus]?.icon}
                        {reportStatusConfig[cmd.reportStatus]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cmd.createTime}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDetailCommand(cmd)}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileJson className="h-4 w-4 mr-2" />
                            导出JSON
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {cmd.status === "running" ? (
                            <DropdownMenuItem>
                              <Pause className="h-4 w-4 mr-2" />
                              暂停指令
                            </DropdownMenuItem>
                          ) : cmd.status !== "completed" ? (
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              启用指令
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            复制指令
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除指令
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              显示 {filteredCommands.length} 条，共 {commandsData.length} 条
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 指令详情对话框 */}
      <Dialog open={!!detailCommand} onOpenChange={() => setDetailCommand(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>指令详情</DialogTitle>
            <DialogDescription>
              指令ID: {detailCommand?.commandId}
            </DialogDescription>
          </DialogHeader>
          {detailCommand && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">指令来源</div>
                  <div className="font-medium">{CommandSource[detailCommand.commandSource as keyof typeof CommandSource]}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">优先级</div>
                  <div className="font-medium">{CommandLevel[detailCommand.level as keyof typeof CommandLevel]}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">属主</div>
                  <div className="font-medium">{detailCommand.owner}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">运营商</div>
                  <div className="font-medium">{OperatorCodes[detailCommand.comCode as keyof typeof OperatorCodes]}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">指令场景</div>
                  <div className="font-medium">{CommandScene[detailCommand.commandScene as keyof typeof CommandScene]}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">数据输出方式</div>
                  <div className="font-medium">{DataOutputMethod[detailCommand.dataOutputMethod as keyof typeof DataOutputMethod]}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">生效省份</div>
                  <div className="font-medium">{detailCommand.effectProvince.length} 个省份</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">规则数量</div>
                  <div className="font-medium">{detailCommand.rulesCount} 条</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">规则类型</div>
                  <div className="font-medium">{getRuleTypesDisplay(detailCommand.ruleTypes)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">创建时间</div>
                  <div className="font-medium">{detailCommand.createTime}</div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30">
                <div className="text-sm text-muted-foreground mb-2">关联指令反馈数据项</div>
                <div className="grid gap-1 text-sm">
                  <div>A.13.3 公共互联网前N包结果数据上报</div>
                  <div>B.2.4 公共互联网流日志上报</div>
                  <div>B.11.1 公共互联网网络应用和协议元数据监测上报</div>
                  <div>C.1.13 公共互联网动态筛选流量PCAP记录上报</div>
                  <div>F.1.51 公共互联网动态流量获取统计信息反馈</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
