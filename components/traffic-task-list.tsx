"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  FileJson,
  AlertCircle,
  CheckCircle,
  Clock,
  Cloud,
  Server,
} from "lucide-react"
import {
  CommandSource,
  CommandLevel,
  CommandScene,
  DataOutputMethod,
  RuleType,
  OperatorCodes,
} from "@/lib/command-types"
import { commandsData, filterCommandsByUser, type CommandRecord } from "@/lib/commands-data"
import { useUser } from "@/lib/user-context"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  running: { label: "运行中", variant: "default", icon: <Play className="h-3 w-3" /> },
  paused: { label: "已暂停", variant: "secondary", icon: <Pause className="h-3 w-3" /> },
  error: { label: "异常", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  completed: { label: "已完成", variant: "outline", icon: <CheckCircle className="h-3 w-3" /> },
}

const reportStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  success: { label: "成功", color: "text-success", icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: "待上报", color: "text-warning", icon: <Clock className="h-3 w-3" /> },
  failed: { label: "失败", color: "text-destructive", icon: <AlertCircle className="h-3 w-3" /> },
}

interface TrafficTaskListProps {
  onCreateTask?: () => void
}

export function TrafficTaskList({ onCreateTask }: TrafficTaskListProps) {
  const { currentUser } = useUser()
  const [activeList, setActiveList] = React.useState<"platform" | "local">("platform")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [sceneFilter, setSceneFilter] = React.useState("all")
  const [selectedCommands, setSelectedCommands] = React.useState<number[]>([])
  const [detailCommand, setDetailCommand] = React.useState<CommandRecord | null>(null)

  // 按当前用户隔离数据
  const userCommands = React.useMemo(
    () => filterCommandsByUser(commandsData, currentUser.username, currentUser.role),
    [currentUser]
  )

  const platformCount = userCommands.filter((c) => c.listType === "platform").length
  const localCount = userCommands.filter((c) => c.listType === "local").length

  const filteredCommands = userCommands.filter((cmd) => {
    if (cmd.listType !== activeList) return false
    const matchesSearch =
      String(cmd.commandId).includes(searchTerm) ||
      cmd.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cmd.status === statusFilter
    const matchesSource = sourceFilter === "all" || String(cmd.commandSource) === sourceFilter
    const matchesScene = sceneFilter === "all" || String(cmd.commandScene) === sceneFilter
    return matchesSearch && matchesStatus && matchesSource && matchesScene
  })

  const toggleCommandSelection = (commandId: number) => {
    setSelectedCommands((prev) =>
      prev.includes(commandId) ? prev.filter((id) => id !== commandId) : [...prev, commandId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedCommands.length === filteredCommands.length) {
      setSelectedCommands([])
    } else {
      setSelectedCommands(filteredCommands.map((c) => c.commandId))
    }
  }

  const getRuleTypesDisplay = (ruleTypes: number[]) => {
    return ruleTypes
      .map((t) => {
        const name = RuleType[t as keyof typeof RuleType]
        return name?.replace("规则", "").replace("灵活", "").replace("固定位置", "固定").replace("全包浮动位置", "浮动") || t
      })
      .join("+")
  }

  const listConfig = {
    platform: { label: "指令平台下发", icon: Cloud, desc: "由上级指令平台统一下发的指令" },
    local: { label: "本平台配置", icon: Server, desc: "在本平台手动新建配置的指令" },
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">指令管理</h1>
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

      {/* 列表切换按钮 */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(listConfig) as Array<"platform" | "local">).map((key) => {
          const cfg = listConfig[key]
          const count = key === "platform" ? platformCount : localCount
          const isActive = activeList === key
          return (
            <button
              key={key}
              onClick={() => {
                setActiveList(key)
                setSelectedCommands([])
              }}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <cfg.icon className="h-5 w-5" />
              </div>
              <div>
                <div className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                  {cfg.label}
                </div>
                <div className="text-xs text-muted-foreground">{cfg.desc}</div>
              </div>
              <Badge variant={isActive ? "default" : "secondary"} className="ml-2">
                {count}
              </Badge>
            </button>
          )
        })}
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
                  <span className="text-sm text-muted-foreground">已选择 {selectedCommands.length} 项</span>
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
                {filteredCommands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="h-32 text-center text-muted-foreground">
                      暂无{listConfig[activeList].label}指令数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommands.map((cmd) => (
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
                      <TableCell className="font-mono text-sm">
                        {cmd.hitTraffic > 0 ? `${cmd.hitTraffic} Gbps` : "-"}
                      </TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 指令详情对话框 */}
      {detailCommand && (
        <CommandDetailDialog command={detailCommand} onClose={() => setDetailCommand(null)} />
      )}
    </div>
  )
}

// 指令详情对话框
function CommandDetailDialog({ command, onClose }: { command: CommandRecord; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>指令详情 - {command.commandId}</DialogTitle>
          <DialogDescription>
            {command.listType === "platform" ? "指令平台下发" : "本平台配置"} · F.1.35 动态流量获取指令
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4 text-sm">
          <DetailItem label="指令来源" value={CommandSource[command.commandSource as keyof typeof CommandSource]} />
          <DetailItem label="优先级" value={CommandLevel[command.level as keyof typeof CommandLevel]} />
          <DetailItem label="指令属主" value={command.owner} />
          <DetailItem label="运营商" value={OperatorCodes[command.comCode as keyof typeof OperatorCodes]} />
          <DetailItem label="指令场景" value={CommandScene[command.commandScene as keyof typeof CommandScene]} />
          <DetailItem label="数据输出方式" value={DataOutputMethod[command.dataOutputMethod as keyof typeof DataOutputMethod]} />
          <DetailItem label="规则数量" value={String(command.rulesCount)} />
          <DetailItem label="上报频次" value={`${command.reportFreq} 次/天`} />
          <DetailItem label="峰值流量" value={`${command.peakTraffic} Gbps`} />
          <DetailItem label="总流量" value={`${command.totalTraffic} TB`} />
          <DetailItem label="总包数" value={`${command.totalPackets} 亿`} />
          <DetailItem label="命中流量" value={`${command.hitTraffic} Gbps`} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
