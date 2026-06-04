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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Filter,
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
  ChevronRight
} from "lucide-react"

// 模拟任务数据
const tasksData = [
  {
    id: "T-20240115-001",
    source: "国家侧",
    name: "省网出口HTTP监测",
    link: "LK-PROV-01",
    ruleType: "五元组+Host",
    sampling: "Hash 1:100",
    outputTarget: "全流量检测",
    status: "running",
    hitTraffic: "12.5K/s",
    updateTime: "2024-01-15 14:32:18",
    reportStatus: "success"
  },
  {
    id: "T-20240115-002",
    source: "国家侧",
    name: "城域网加密流量采集",
    link: "LK-CITY-03",
    ruleType: "SNI+特征码",
    sampling: "Hash 1:50",
    outputTarget: "加密流量检测",
    status: "running",
    hitTraffic: "8.2K/s",
    updateTime: "2024-01-15 14:30:05",
    reportStatus: "success"
  },
  {
    id: "T-20240115-003",
    source: "省级",
    name: "DNS流量分析任务",
    link: "LK-PROV-02",
    ruleType: "协议头",
    sampling: "轮巡 10ms",
    outputTarget: "协议元数据",
    status: "running",
    hitTraffic: "5.6K/s",
    updateTime: "2024-01-15 14:28:42",
    reportStatus: "success"
  },
  {
    id: "T-20240114-018",
    source: "国家侧",
    name: "特定应用检测任务",
    link: "LK-PROV-01",
    ruleType: "URL+特征码",
    sampling: "Hash 1:200",
    outputTarget: "特定应用检测",
    status: "paused",
    hitTraffic: "0/s",
    updateTime: "2024-01-14 23:15:30",
    reportStatus: "pending"
  },
  {
    id: "T-20240114-015",
    source: "省级",
    name: "异常包识别任务",
    link: "LK-CITY-01",
    ruleType: "异常包",
    sampling: "无采样",
    outputTarget: "前N包检测",
    status: "running",
    hitTraffic: "3.2K/s",
    updateTime: "2024-01-14 18:45:22",
    reportStatus: "success"
  },
  {
    id: "T-20240114-012",
    source: "国家侧",
    name: "HTTPS流量筛选",
    link: "LK-PROV-03",
    ruleType: "CS+SNI",
    sampling: "Hash 1:100",
    outputTarget: "PCAP提取",
    status: "error",
    hitTraffic: "0/s",
    updateTime: "2024-01-14 16:22:10",
    reportStatus: "failed"
  },
  {
    id: "T-20240114-008",
    source: "省级",
    name: "FTP文件还原任务",
    link: "LK-CITY-02",
    ruleType: "五元组",
    sampling: "轮巡 5ms",
    outputTarget: "文件还原",
    status: "running",
    hitTraffic: "1.8K/s",
    updateTime: "2024-01-14 10:30:45",
    reportStatus: "success"
  },
  {
    id: "T-20240113-025",
    source: "国家侧",
    name: "SSH流量监测",
    link: "LK-PROV-02",
    ruleType: "协议头+特征码",
    sampling: "Hash 1:50",
    outputTarget: "流日志",
    status: "completed",
    hitTraffic: "-",
    updateTime: "2024-01-13 22:00:00",
    reportStatus: "success"
  },
]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  running: { label: "运行中", variant: "default" },
  paused: { label: "已暂停", variant: "secondary" },
  error: { label: "异常", variant: "destructive" },
  completed: { label: "已完成", variant: "outline" },
}

const reportStatusConfig: Record<string, { label: string; color: string }> = {
  success: { label: "成功", color: "text-green-500" },
  pending: { label: "待上报", color: "text-yellow-500" },
  failed: { label: "失败", color: "text-red-500" },
}

interface TrafficTaskListProps {
  onCreateTask?: () => void
}

export function TrafficTaskList({ onCreateTask }: TrafficTaskListProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([])

  const filteredTasks = tasksData.filter((task) => {
    const matchesSearch = 
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesSource = sourceFilter === "all" || task.source === sourceFilter
    return matchesSearch && matchesStatus && matchesSource
  })

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">动态流量获取</h1>
          <p className="text-sm text-muted-foreground mt-1">管理采集任务，配置流量筛选规则</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入指令
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出任务
          </Button>
          <Button size="sm" onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{tasksData.filter(t => t.status === "running").length}</div>
            <div className="text-xs text-muted-foreground mt-1">运行中任务</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{tasksData.filter(t => t.status === "paused").length}</div>
            <div className="text-xs text-muted-foreground mt-1">已暂停任务</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{tasksData.filter(t => t.status === "error").length}</div>
            <div className="text-xs text-muted-foreground mt-1">异常任务</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{tasksData.length}</div>
            <div className="text-xs text-muted-foreground mt-1">总任务数</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索栏 */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索任务编号或名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-secondary border-0"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-secondary border-0">
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
                  <SelectValue placeholder="来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部来源</SelectItem>
                  <SelectItem value="国家侧">国家侧</SelectItem>
                  <SelectItem value="省级">省级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {selectedTasks.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedTasks.length} 项
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

      {/* 任务列表表格 */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-border"
                    />
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    <Button variant="ghost" className="h-8 p-0 font-medium hover:bg-transparent">
                      任务编号
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[80px]">指令来源</TableHead>
                  <TableHead className="min-w-[180px]">任务名称</TableHead>
                  <TableHead className="min-w-[100px]">接入链路</TableHead>
                  <TableHead className="min-w-[120px]">规则类型</TableHead>
                  <TableHead className="min-w-[100px]">采样方式</TableHead>
                  <TableHead className="min-w-[120px]">输出目标</TableHead>
                  <TableHead className="min-w-[80px]">状态</TableHead>
                  <TableHead className="min-w-[100px]">命中流量</TableHead>
                  <TableHead className="min-w-[160px]">
                    <Button variant="ghost" className="h-8 p-0 font-medium hover:bg-transparent">
                      最近更新
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[80px]">上报状态</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="border-border">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="rounded border-border"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{task.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {task.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell className="text-muted-foreground">{task.link}</TableCell>
                    <TableCell className="text-muted-foreground">{task.ruleType}</TableCell>
                    <TableCell className="text-muted-foreground">{task.sampling}</TableCell>
                    <TableCell className="text-muted-foreground">{task.outputTarget}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[task.status]?.variant || "default"}>
                        {statusConfig[task.status]?.label || task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{task.hitTraffic}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{task.updateTime}</TableCell>
                    <TableCell>
                      <span className={`text-sm ${reportStatusConfig[task.reportStatus]?.color}`}>
                        {reportStatusConfig[task.reportStatus]?.label}
                      </span>
                    </TableCell>
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            查看命中流量
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {task.status === "running" ? (
                            <DropdownMenuItem>
                              <Pause className="h-4 w-4 mr-2" />
                              暂停任务
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              启用任务
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            复制任务
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除任务
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
              显示 {filteredTasks.length} 条，共 {tasksData.length} 条
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
    </div>
  )
}
