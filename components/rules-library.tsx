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
  Download,
  Upload,
  Eye,
  Package,
  Link2
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
import { Switch } from "@/components/ui/switch"
import {
  RuleType,
  TransportProtocols,
  ApplicationProtocols,
  UdValueMatchMode,
  CrossPkgMatch,
  TunnelMatchType,
  type RuleInfo,
} from "@/lib/command-types"
import { cn } from "@/lib/utils"

// 规则类型配置（用于显示）
const ruleTypeConfig = [
  { value: 0, label: "无规则", icon: Package, color: "bg-muted text-muted-foreground border-muted" },
  { value: 1, label: "灵活五元组", icon: Layers, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: 2, label: "掩码五元组", icon: Layers, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: 3, label: "固定位置特征码", icon: FileCode, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: 4, label: "全包浮动特征码", icon: FileCode, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: 5, label: "掩码五元组+特征码", icon: FileCode, color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  { value: 6, label: "窗口范围浮动特征码", icon: FileCode, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: 7, label: "CS规则", icon: Globe, color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  { value: 8, label: "Host规则", icon: Globe, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: 9, label: "SNI规则", icon: Shield, color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  { value: 10, label: "URL规则", icon: Globe, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { value: 11, label: "应用协议规则", icon: Layers, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
]

// 模拟规则策略数据
const mockRulePolicies = [
  {
    id: "RP-2024-001",
    name: "HTTP流量监测策略",
    description: "针对HTTP明文流量的综合监测策略",
    source: "国家指令",
    status: "active",
    priority: 1,
    rules: [
      { ruleType: 1, srcIp: "", dstIp: "", srcPort: "", dstPort: "80,8080", protocolType: 6 },
      { ruleType: 8, host: "*.example.com" },
      { ruleType: 10, url: "/api/*" },
    ],
    taskCount: 8,
    createdAt: "2024-03-15",
    updatedAt: "2024-03-20",
  },
  {
    id: "RP-2024-002",
    name: "HTTPS加密流量策略",
    description: "基于SNI的加密流量识别策略",
    source: "省级指令",
    status: "active",
    priority: 2,
    rules: [
      { ruleType: 1, srcIp: "", dstIp: "", srcPort: "", dstPort: "443", protocolType: 6 },
      { ruleType: 9, sni: "*.target.cn" },
    ],
    taskCount: 5,
    createdAt: "2024-03-14",
    updatedAt: "2024-03-19",
  },
  {
    id: "RP-2024-003",
    name: "特定应用协议监测",
    description: "DNS和FTP协议的流量监测",
    source: "本地配置",
    status: "active",
    priority: 3,
    rules: [
      { ruleType: 11, applicationProtocol: 3 },
      { ruleType: 11, applicationProtocol: 4 },
    ],
    taskCount: 3,
    createdAt: "2024-03-13",
    updatedAt: "2024-03-18",
  },
  {
    id: "RP-2024-004",
    name: "恶意特征码检测策略",
    description: "针对已知恶意特征的流量检测",
    source: "国家指令",
    status: "active",
    priority: 4,
    rules: [
      { ruleType: 3, udValue: "4d5a9000", offset: 0 },
      { ruleType: 4, udValue: "PE\\x00\\x00" },
    ],
    taskCount: 2,
    createdAt: "2024-03-12",
    updatedAt: "2024-03-17",
  },
  {
    id: "RP-2024-005",
    name: "CS连接方向筛选策略",
    description: "基于客户端/服务端方向的流量筛选",
    source: "本地配置",
    status: "draft",
    priority: 5,
    rules: [
      { ruleType: 7, clientIp: "192.168.0.0/16", serverIp: "10.0.0.0/8", serverPort: "80,443" },
    ],
    taskCount: 0,
    createdAt: "2024-03-11",
    updatedAt: "2024-03-16",
  },
]

// 统计数据
const stats = [
  { label: "策略总数", value: "5", icon: Package, trend: "+2" },
  { label: "活跃策略", value: "4", icon: CheckCircle2, trend: "+1" },
  { label: "关联任务", value: "18", icon: Link2, trend: "+5" },
  { label: "规则条目", value: "12", icon: Layers, trend: "+3" },
]

// 规则策略表单初始状态
const initialPolicyForm = {
  name: "",
  description: "",
  source: "local",
  priority: 1,
  rules: [] as RuleInfo[],
}

export function RulesLibrary() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedPolicies, setSelectedPolicies] = React.useState<string[]>([])
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [selectedPolicy, setSelectedPolicy] = React.useState<typeof mockRulePolicies[0] | null>(null)
  
  // 新建策略表单
  const [policyForm, setPolicyForm] = React.useState(initialPolicyForm)
  const [currentEditingRule, setCurrentEditingRule] = React.useState<RuleInfo | null>(null)
  const [addRuleDialogOpen, setAddRuleDialogOpen] = React.useState(false)

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

  const getRuleTypeBadge = (ruleType: number) => {
    const config = ruleTypeConfig.find(t => t.value === ruleType)
    if (!config) return null
    return (
      <Badge className={config.color}>
        <config.icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const filteredPolicies = mockRulePolicies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || policy.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const toggleSelectAll = () => {
    if (selectedPolicies.length === filteredPolicies.length) {
      setSelectedPolicies([])
    } else {
      setSelectedPolicies(filteredPolicies.map(p => p.id))
    }
  }

  const toggleSelectPolicy = (id: string) => {
    setSelectedPolicies(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  // 添加规则到策略
  const addRuleToPolicy = () => {
    if (currentEditingRule) {
      setPolicyForm(prev => ({
        ...prev,
        rules: [...prev.rules, currentEditingRule]
      }))
      setCurrentEditingRule(null)
      setAddRuleDialogOpen(false)
    }
  }

  // 删除策略中的规则
  const removeRuleFromPolicy = (index: number) => {
    setPolicyForm(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }))
  }

  // 查看策略详情
  const handleViewDetail = (policy: typeof mockRulePolicies[0]) => {
    setSelectedPolicy(policy)
    setViewDialogOpen(true)
  }

  // 重置表单
  const resetForm = () => {
    setPolicyForm(initialPolicyForm)
    setCurrentEditingRule(null)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">规则策略库</h1>
          <p className="text-sm text-muted-foreground mt-1">管理预配置的规则策略，在任务创建时可直接调用</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入策略
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出策略
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建规则策略
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新建规则策略</DialogTitle>
                <DialogDescription>
                  创建可复用的规则策略，支持组合多种规则类型
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm border-b pb-2">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>策略名称 <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="输入策略名称"
                        value={policyForm.name}
                        onChange={(e) => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>策略来源</Label>
                      <Select 
                        value={policyForm.source}
                        onValueChange={(v) => setPolicyForm(prev => ({ ...prev, source: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national">国家指令</SelectItem>
                          <SelectItem value="province">省级指令</SelectItem>
                          <SelectItem value="local">本地配置</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>优先级</Label>
                      <Input 
                        type="number" 
                        placeholder="1-100" 
                        min={1} 
                        max={100}
                        value={policyForm.priority}
                        onChange={(e) => setPolicyForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>策略描述</Label>
                      <Input 
                        placeholder="输入策略描述（可选）"
                        value={policyForm.description}
                        onChange={(e) => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* 规则配置 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-medium text-sm">规则配置</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setCurrentEditingRule({ ruleType: 1 })
                        setAddRuleDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加规则
                    </Button>
                  </div>

                  {policyForm.rules.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">暂无规则，请点击上方按钮添加</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {policyForm.rules.map((rule, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            {getRuleTypeBadge(rule.ruleType)}
                            <span className="text-sm text-muted-foreground">
                              {getRuleDescription(rule)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeRuleFromPolicy(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCreateDialogOpen(false)
                  resetForm()
                }}>
                  取消
                </Button>
                <Button 
                  onClick={() => {
                    // 保存策略逻辑
                    console.log("保存策略:", policyForm)
                    setCreateDialogOpen(false)
                    resetForm()
                  }}
                  disabled={!policyForm.name || policyForm.rules.length === 0}
                >
                  创建策略
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 添加规则对话框 */}
      <Dialog open={addRuleDialogOpen} onOpenChange={setAddRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加规则</DialogTitle>
            <DialogDescription>
              选择规则类型并配置规则参数
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>规则类型 <span className="text-destructive">*</span></Label>
              <Select 
                value={String(currentEditingRule?.ruleType || 1)}
                onValueChange={(v) => setCurrentEditingRule({ ruleType: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RuleType).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 根据规则类型显示不同的配置字段 */}
            {currentEditingRule && (
              <RuleFieldsEditor 
                ruleInfo={currentEditingRule}
                onUpdate={(updates) => setCurrentEditingRule({ ...currentEditingRule, ...updates })}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRuleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={addRuleToPolicy}>
              添加规则
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* 规则策略列表 */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">规则策略列表</CardTitle>
              <CardDescription>共 {filteredPolicies.length} 条策略</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索策略..."
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
                    checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>策略编号</TableHead>
                <TableHead>策略名称</TableHead>
                <TableHead>包含规则</TableHead>
                <TableHead>来源</TableHead>
                <TableHead className="text-right">关联任务</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPolicies.includes(policy.id)}
                      onCheckedChange={() => toggleSelectPolicy(policy.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {policy.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{policy.name}</div>
                      <div className="text-xs text-muted-foreground">{policy.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {policy.rules.slice(0, 2).map((rule, idx) => (
                        <span key={idx}>
                          {getRuleTypeBadge(rule.ruleType)}
                        </span>
                      ))}
                      {policy.rules.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{policy.rules.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{policy.source}</TableCell>
                  <TableCell className="text-right">{policy.taskCount}</TableCell>
                  <TableCell>{getStatusBadge(policy.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(policy)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑策略
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          复制策略
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除策略
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

      {/* 策略详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>策略详情</DialogTitle>
            <DialogDescription>
              {selectedPolicy?.id} - {selectedPolicy?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">策略来源</Label>
                  <p className="text-sm mt-1">{selectedPolicy.source}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <div className="mt-1">{getStatusBadge(selectedPolicy.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">策略描述</Label>
                <p className="text-sm mt-1">{selectedPolicy.description || "-"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">包含规则 ({selectedPolicy.rules.length})</Label>
                <div className="space-y-2 mt-2">
                  {selectedPolicy.rules.map((rule, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border"
                    >
                      <Badge variant="outline">{index + 1}</Badge>
                      {getRuleTypeBadge(rule.ruleType)}
                      <span className="text-sm text-muted-foreground">
                        {getRuleDescription(rule)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              关闭
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              编辑策略
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量操作栏 */}
      {selectedPolicies.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="bg-card border shadow-lg">
            <CardContent className="flex items-center gap-4 p-3">
              <span className="text-sm text-muted-foreground">
                已选择 <span className="font-medium text-foreground">{selectedPolicies.length}</span> 条策略
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
              <Button variant="ghost" size="sm" onClick={() => setSelectedPolicies([])}>
                取消选择
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// 规则字段编辑器组件
function RuleFieldsEditor({ 
  ruleInfo, 
  onUpdate 
}: { 
  ruleInfo: RuleInfo
  onUpdate: (updates: Partial<RuleInfo>) => void 
}) {
  const ruleType = ruleInfo.ruleType

  // 五元组规则 (1, 2)
  if (ruleType === 1 || ruleType === 2) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>源IP地址</Label>
            <Input 
              placeholder="如: 192.168.1.0/24"
              value={ruleInfo.srcIp || ""}
              onChange={(e) => onUpdate({ srcIp: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>目的IP地址</Label>
            <Input 
              placeholder="如: 10.0.0.0/8"
              value={ruleInfo.dstIp || ""}
              onChange={(e) => onUpdate({ dstIp: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>源端口</Label>
            <Input 
              placeholder="如: 80,443 或 1024-65535"
              value={ruleInfo.srcPort || ""}
              onChange={(e) => onUpdate({ srcPort: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>目的端口</Label>
            <Input 
              placeholder="如: 80,443 或 1024-65535"
              value={ruleInfo.dstPort || ""}
              onChange={(e) => onUpdate({ dstPort: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>传输层协议</Label>
          <Select 
            value={String(ruleInfo.protocolType || "")}
            onValueChange={(v) => onUpdate({ protocolType: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择协议" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TransportProtocols).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {ruleType === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>源IP掩码</Label>
              <Input 
                placeholder="如: 255.255.255.0"
                value={ruleInfo.srcIpMask || ""}
                onChange={(e) => onUpdate({ srcIpMask: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>目的IP掩码</Label>
              <Input 
                placeholder="如: 255.255.255.0"
                value={ruleInfo.dstIpMask || ""}
                onChange={(e) => onUpdate({ dstIpMask: e.target.value })}
              />
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          五元组规则：源IP、目的IP、源端口、目的端口、协议类型中至少填写一项
        </p>
      </div>
    )
  }

  // 特征码规则 (3, 4, 6)
  if (ruleType === 3 || ruleType === 4 || ruleType === 6) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>特征码 <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="输入十六进制特征码，如: 4d5a9000"
            value={ruleInfo.udValue || ""}
            onChange={(e) => onUpdate({ udValue: e.target.value })}
          />
        </div>
        {ruleType === 3 && (
          <div className="space-y-2">
            <Label>偏移量 <span className="text-destructive">*</span></Label>
            <Input 
              type="number"
              placeholder="特征码在数据包中的偏移位置"
              value={ruleInfo.offset || ""}
              onChange={(e) => onUpdate({ offset: Number(e.target.value) })}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>匹配模式</Label>
            <Select 
              value={String(ruleInfo.udValueMatchMode || 0)}
              onValueChange={(v) => onUpdate({ udValueMatchMode: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(UdValueMatchMode).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>跨包匹配</Label>
            <Select 
              value={String(ruleInfo.crossPkgMatch || 0)}
              onValueChange={(v) => onUpdate({ crossPkgMatch: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CrossPkgMatch).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  // CS规则 (7)
  if (ruleType === 7) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>客户端IP <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="如: 192.168.0.0/16"
            value={ruleInfo.clientIp || ""}
            onChange={(e) => onUpdate({ clientIp: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>服务端IP <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="如: 10.0.0.0/8"
            value={ruleInfo.serverIp || ""}
            onChange={(e) => onUpdate({ serverIp: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>服务端口 <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="如: 80,443"
            value={ruleInfo.serverPort || ""}
            onChange={(e) => onUpdate({ serverPort: e.target.value })}
          />
        </div>
      </div>
    )
  }

  // Host规则 (8)
  if (ruleType === 8) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Host <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="如: *.example.com"
            value={ruleInfo.host || ""}
            onChange={(e) => onUpdate({ host: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">支持通配符 * 匹配</p>
        </div>
      </div>
    )
  }

  // SNI规则 (9)
  if (ruleType === 9) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>SNI <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="如: *.target.cn"
            value={ruleInfo.sni || ""}
            onChange={(e) => onUpdate({ sni: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">TLS握手中的Server Name Indication</p>
        </div>
      </div>
    )
  }

  // URL规则 (10)
  if (ruleType === 10) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>URL <span className="text-destructive">*</span></Label>
          <Input 
            placeholder="如: /api/v1/*"
            value={ruleInfo.url || ""}
            onChange={(e) => onUpdate({ url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">支持通配符 * 匹配</p>
        </div>
      </div>
    )
  }

  // 应用协议规则 (11)
  if (ruleType === 11) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>应用协议 <span className="text-destructive">*</span></Label>
          <Select 
            value={String(ruleInfo.applicationProtocol || "")}
            onValueChange={(v) => onUpdate({ applicationProtocol: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择应用协议" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ApplicationProtocols).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  return (
    <p className="text-sm text-muted-foreground">无规则：不配置任何筛选条件</p>
  )
}

// 获取规则描述文字
function getRuleDescription(rule: RuleInfo): string {
  switch (rule.ruleType) {
    case 1:
    case 2:
      const parts = []
      if (rule.srcIp) parts.push(`源IP:${rule.srcIp}`)
      if (rule.dstIp) parts.push(`目的IP:${rule.dstIp}`)
      if (rule.dstPort) parts.push(`端口:${rule.dstPort}`)
      if (rule.protocolType) parts.push(`协议:${TransportProtocols[rule.protocolType as keyof typeof TransportProtocols]}`)
      return parts.join(", ") || "未配置"
    case 3:
      return `特征码:${rule.udValue}, 偏移:${rule.offset}`
    case 4:
    case 6:
      return `特征码:${rule.udValue}`
    case 7:
      return `${rule.clientIp} -> ${rule.serverIp}:${rule.serverPort}`
    case 8:
      return `Host: ${rule.host}`
    case 9:
      return `SNI: ${rule.sni}`
    case 10:
      return `URL: ${rule.url}`
    case 11:
      return `协议: ${ApplicationProtocols[rule.applicationProtocol as keyof typeof ApplicationProtocols] || rule.applicationProtocol}`
    default:
      return "无规则"
  }
}
