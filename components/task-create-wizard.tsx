"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Plus,
  Trash2,
  AlertTriangle,
  GripVertical,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "任务信息", description: "基本信息配置" },
  { id: 2, title: "流量源", description: "选择接入链路" },
  { id: 3, title: "识别范围", description: "协议与隧道识别" },
  { id: 4, title: "筛选规则", description: "配置匹配规则" },
  { id: 5, title: "处理策略", description: "流量处理方式" },
  { id: 6, title: "采样策略", description: "采样配置" },
  { id: 7, title: "输出策略", description: "输出目标设置" },
  { id: 8, title: "校验发布", description: "确认并发布" },
]

interface TaskCreateWizardProps {
  onBack: () => void
}

export function TaskCreateWizard({ onBack }: TaskCreateWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState({
    // 任务信息
    taskId: `T-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    taskName: "",
    source: "national",
    priority: "medium",
    validFrom: "",
    validTo: "",
    description: "",
    // 流量源
    networkType: "provincial",
    direction: "both",
    links: [] as string[],
    vlanRange: "",
    // 识别范围
    protocols: [] as string[],
    tunnelTypes: [] as string[],
    enableVlanMpls: false,
    enableAbnormalPacket: false,
    // 筛选规则
    rules: [] as Array<{
      id: string
      type: string
      conditions: Array<{ field: string; operator: string; value: string }>
      logic: "AND" | "OR"
    }>,
    // 处理策略
    markEnabled: false,
    markValue: "",
    rewriteEnabled: false,
    stripEnabled: false,
    truncateEnabled: false,
    truncateLength: "",
    flowLockEnabled: false,
    // 采样策略
    samplingType: "hash",
    hashRatio: "100",
    hashUpdatePeriod: "60",
    roundRobinPeriod: "10",
    // 输出策略
    outputTargets: [] as string[],
    pcapEnabled: false,
    logEnabled: false,
    metadataEnabled: false,
  })

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">新建采集任务</h1>
          <p className="text-sm text-muted-foreground mt-1">按步骤配置任务参数</p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <div className={cn(
                      "text-xs font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 步骤内容 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepTaskInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <StepTrafficSource formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepIdentification formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <StepFilterRules formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <StepProcessing formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 6 && (
            <StepSampling formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 7 && (
            <StepOutput formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 8 && (
            <StepReview formData={formData} />
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          {currentStep === steps.length ? (
            <Button onClick={() => alert("任务创建成功！")}>
              <Check className="h-4 w-4 mr-2" />
              发布任务
            </Button>
          ) : (
            <Button onClick={nextStep}>
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// 步骤1: 任务信息
function StepTaskInfo({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="taskId">任务编号</Label>
        <Input
          id="taskId"
          value={formData.taskId}
          onChange={(e) => updateFormData({ taskId: e.target.value })}
          className="bg-secondary border-0"
        />
        <p className="text-xs text-muted-foreground">系统自动生成，可手动修改</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">指令来源</Label>
        <Select value={formData.source} onValueChange={(v) => updateFormData({ source: v })}>
          <SelectTrigger className="bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="national">国家侧</SelectItem>
            <SelectItem value="provincial">省级</SelectItem>
            <SelectItem value="local">本地</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="taskName">任务名称</Label>
        <Input
          id="taskName"
          placeholder="请输入任务名称"
          value={formData.taskName}
          onChange={(e) => updateFormData({ taskName: e.target.value })}
          className="bg-secondary border-0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">优先级</Label>
        <Select value={formData.priority} onValueChange={(v) => updateFormData({ priority: v })}>
          <SelectTrigger className="bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>有效期</Label>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={formData.validFrom}
            onChange={(e) => updateFormData({ validFrom: e.target.value })}
            className="bg-secondary border-0"
          />
          <span className="text-muted-foreground">至</span>
          <Input
            type="date"
            value={formData.validTo}
            onChange={(e) => updateFormData({ validTo: e.target.value })}
            className="bg-secondary border-0"
          />
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">任务描述</Label>
        <Textarea
          id="description"
          placeholder="请输入任务描述（可选）"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          className="bg-secondary border-0 min-h-[100px]"
        />
      </div>
    </div>
  )
}

// 步骤2: 流量源
function StepTrafficSource({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  const availableLinks = [
    { id: "LK-PROV-01", name: "省网出口链路1", bandwidth: "10Gbps", status: "online" },
    { id: "LK-PROV-02", name: "省网出口链路2", bandwidth: "10Gbps", status: "online" },
    { id: "LK-PROV-03", name: "省网出口链路3", bandwidth: "10Gbps", status: "offline" },
    { id: "LK-CITY-01", name: "城域网出口链路1", bandwidth: "1Gbps", status: "online" },
    { id: "LK-CITY-02", name: "城域网出口链路2", bandwidth: "1Gbps", status: "online" },
    { id: "LK-CITY-03", name: "城域网出口链路3", bandwidth: "1Gbps", status: "online" },
  ]

  const toggleLink = (linkId: string) => {
    const links = formData.links.includes(linkId)
      ? formData.links.filter((l: string) => l !== linkId)
      : [...formData.links, linkId]
    updateFormData({ links })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>网络类型</Label>
          <Select value={formData.networkType} onValueChange={(v) => updateFormData({ networkType: v })}>
            <SelectTrigger className="bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="provincial">省网出口</SelectItem>
              <SelectItem value="metropolitan">城域网出口</SelectItem>
              <SelectItem value="both">全部</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>流量方向</Label>
          <Select value={formData.direction} onValueChange={(v) => updateFormData({ direction: v })}>
            <SelectTrigger className="bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">入向</SelectItem>
              <SelectItem value="outbound">出向</SelectItem>
              <SelectItem value="both">双向</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>VLAN 范围（可选）</Label>
          <Input
            placeholder="例如: 100-200, 300, 400-500"
            value={formData.vlanRange}
            onChange={(e) => updateFormData({ vlanRange: e.target.value })}
            className="bg-secondary border-0"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>选择接入链路</Label>
        <div className="grid gap-3 md:grid-cols-2">
          {availableLinks.map((link) => (
            <div
              key={link.id}
              onClick={() => link.status === "online" && toggleLink(link.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer",
                formData.links.includes(link.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/50 hover:bg-secondary",
                link.status === "offline" && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  link.status === "online" ? "bg-green-500" : "bg-red-500"
                )} />
                <div>
                  <div className="font-medium text-sm">{link.name}</div>
                  <div className="text-xs text-muted-foreground">{link.id}</div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {link.bandwidth}
                </Badge>
                {link.status === "offline" && (
                  <div className="text-xs text-red-500 mt-1">离线</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {formData.links.length > 0 && (
          <p className="text-sm text-muted-foreground">
            已选择 {formData.links.length} 条链路
          </p>
        )}
      </div>
    </div>
  )
}

// 步骤3: 识别范围
function StepIdentification({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  const protocols = [
    { id: "tcp", label: "TCP" },
    { id: "udp", label: "UDP" },
    { id: "icmp", label: "ICMP" },
    { id: "http", label: "HTTP" },
    { id: "https", label: "HTTPS" },
    { id: "dns", label: "DNS" },
    { id: "ftp", label: "FTP" },
    { id: "ssh", label: "SSH" },
    { id: "smtp", label: "SMTP" },
    { id: "pop3", label: "POP3" },
  ]

  const tunnelTypes = [
    { id: "gre", label: "GRE" },
    { id: "ipip", label: "IPIP" },
    { id: "ipsec", label: "IPSec" },
    { id: "l2tp", label: "L2TP" },
    { id: "pptp", label: "PPTP" },
    { id: "vxlan", label: "VXLAN" },
  ]

  const toggleProtocol = (protocolId: string) => {
    const protocols = formData.protocols.includes(protocolId)
      ? formData.protocols.filter((p: string) => p !== protocolId)
      : [...formData.protocols, protocolId]
    updateFormData({ protocols })
  }

  const toggleTunnel = (tunnelId: string) => {
    const tunnelTypes = formData.tunnelTypes.includes(tunnelId)
      ? formData.tunnelTypes.filter((t: string) => t !== tunnelId)
      : [...formData.tunnelTypes, tunnelId]
    updateFormData({ tunnelTypes })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>协议类型</Label>
        <div className="flex flex-wrap gap-2">
          {protocols.map((protocol) => (
            <Badge
              key={protocol.id}
              variant={formData.protocols.includes(protocol.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleProtocol(protocol.id)}
            >
              {protocol.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>隧道类型</Label>
        <div className="flex flex-wrap gap-2">
          {tunnelTypes.map((tunnel) => (
            <Badge
              key={tunnel.id}
              variant={formData.tunnelTypes.includes(tunnel.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTunnel(tunnel.id)}
            >
              {tunnel.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">VLAN/MPLS 识别</div>
            <div className="text-xs text-muted-foreground">启用 VLAN 和 MPLS 标签识别</div>
          </div>
          <Switch
            checked={formData.enableVlanMpls}
            onCheckedChange={(checked) => updateFormData({ enableVlanMpls: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">异常包识别</div>
            <div className="text-xs text-muted-foreground">识别畸形包、碎片包、超长包等异常报文</div>
          </div>
          <Switch
            checked={formData.enableAbnormalPacket}
            onCheckedChange={(checked) => updateFormData({ enableAbnormalPacket: checked })}
          />
        </div>
      </div>
    </div>
  )
}

// 步骤4: 筛选规则（规则构建器）
function StepFilterRules({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  const [activeTab, setActiveTab] = React.useState("tuple")

  const addRule = (type: string) => {
    const newRule = {
      id: `rule-${Date.now()}`,
      type,
      conditions: [{ field: "", operator: "equals", value: "" }],
      logic: "AND" as const,
    }
    updateFormData({ rules: [...formData.rules, newRule] })
  }

  const removeRule = (ruleId: string) => {
    updateFormData({ rules: formData.rules.filter((r: any) => r.id !== ruleId) })
  }

  const updateRule = (ruleId: string, updates: any) => {
    updateFormData({
      rules: formData.rules.map((r: any) =>
        r.id === ruleId ? { ...r, ...updates } : r
      ),
    })
  }

  const addCondition = (ruleId: string) => {
    updateFormData({
      rules: formData.rules.map((r: any) =>
        r.id === ruleId
          ? { ...r, conditions: [...r.conditions, { field: "", operator: "equals", value: "" }] }
          : r
      ),
    })
  }

  const removeCondition = (ruleId: string, conditionIndex: number) => {
    updateFormData({
      rules: formData.rules.map((r: any) =>
        r.id === ruleId
          ? { ...r, conditions: r.conditions.filter((_: any, i: number) => i !== conditionIndex) }
          : r
      ),
    })
  }

  const rulesOfType = (type: string) => formData.rules.filter((r: any) => r.type === type)

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="tuple">五元组</TabsTrigger>
          <TabsTrigger value="cs">CS</TabsTrigger>
          <TabsTrigger value="host">Host</TabsTrigger>
          <TabsTrigger value="sni">SNI</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="signature">特征码</TabsTrigger>
          <TabsTrigger value="header">协议头</TabsTrigger>
          <TabsTrigger value="abnormal">异常包</TabsTrigger>
        </TabsList>

        <TabsContent value="tuple" className="space-y-4">
          <RuleBuilder
            type="tuple"
            rules={rulesOfType("tuple")}
            onAddRule={() => addRule("tuple")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            fields={[
              { id: "srcIp", label: "源IP" },
              { id: "dstIp", label: "目的IP" },
              { id: "srcPort", label: "源端口" },
              { id: "dstPort", label: "目的端口" },
              { id: "protocol", label: "协议" },
            ]}
          />
        </TabsContent>

        <TabsContent value="cs" className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-500">CS 规则提示</p>
              <p className="text-muted-foreground">CS 规则仅对 TCP 协议生效，且需要完成三次握手后才能执行匹配</p>
            </div>
          </div>
          <RuleBuilder
            type="cs"
            rules={rulesOfType("cs")}
            onAddRule={() => addRule("cs")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            fields={[
              { id: "clientIp", label: "客户端IP" },
              { id: "serverIp", label: "服务端IP" },
              { id: "clientPort", label: "客户端端口" },
              { id: "serverPort", label: "服务端端口" },
            ]}
          />
        </TabsContent>

        <TabsContent value="host" className="space-y-4">
          <RuleBuilder
            type="host"
            rules={rulesOfType("host")}
            onAddRule={() => addRule("host")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            fields={[{ id: "host", label: "Host" }]}
            operators={["equals", "contains", "startsWith", "endsWith", "regex"]}
          />
        </TabsContent>

        <TabsContent value="sni" className="space-y-4">
          <RuleBuilder
            type="sni"
            rules={rulesOfType("sni")}
            onAddRule={() => addRule("sni")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            fields={[{ id: "sni", label: "SNI" }]}
            operators={["equals", "contains", "startsWith", "endsWith", "regex"]}
          />
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <RuleBuilder
            type="url"
            rules={rulesOfType("url")}
            onAddRule={() => addRule("url")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            fields={[
              { id: "url", label: "URL" },
              { id: "path", label: "路径" },
              { id: "query", label: "查询参数" },
            ]}
            operators={["equals", "contains", "startsWith", "endsWith", "regex"]}
          />
        </TabsContent>

        <TabsContent value="signature" className="space-y-4">
          <SignatureRuleBuilder
            rules={rulesOfType("signature")}
            onAddRule={() => addRule("signature")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
          />
        </TabsContent>

        <TabsContent value="header" className="space-y-4">
          <RuleBuilder
            type="header"
            rules={rulesOfType("header")}
            onAddRule={() => addRule("header")}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onAddCondition={addCondition}
            onRemoveCondition={removeCondition}
            fields={[
              { id: "httpMethod", label: "HTTP Method" },
              { id: "httpVersion", label: "HTTP Version" },
              { id: "contentType", label: "Content-Type" },
              { id: "userAgent", label: "User-Agent" },
              { id: "referer", label: "Referer" },
            ]}
          />
        </TabsContent>

        <TabsContent value="abnormal" className="space-y-4">
          <AbnormalPacketConfig />
        </TabsContent>
      </Tabs>

      {/* 规则汇总 */}
      {formData.rules.length > 0 && (
        <Card className="bg-secondary/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">规则汇总</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.rules.map((rule: any, index: number) => (
                <div key={rule.id} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm">
                    {rule.type === "tuple" && "五元组"}
                    {rule.type === "cs" && "CS"}
                    {rule.type === "host" && "Host"}
                    {rule.type === "sni" && "SNI"}
                    {rule.type === "url" && "URL"}
                    {rule.type === "signature" && "特征码"}
                    {rule.type === "header" && "协议头"}
                    规则 - {rule.conditions.length} 个条件
                  </span>
                  <Badge variant="secondary" className="text-xs">{rule.logic}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 规则构建器组件
function RuleBuilder({
  type,
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
  onAddCondition,
  onRemoveCondition,
  fields,
  operators = ["equals", "notEquals", "contains", "greaterThan", "lessThan"],
}: {
  type: string
  rules: any[]
  onAddRule: () => void
  onRemoveRule: (id: string) => void
  onUpdateRule: (id: string, updates: any) => void
  onAddCondition: (id: string) => void
  onRemoveCondition: (id: string, index: number) => void
  fields: { id: string; label: string }[]
  operators?: string[]
}) {
  const operatorLabels: Record<string, string> = {
    equals: "等于",
    notEquals: "不等于",
    contains: "包含",
    startsWith: "开头为",
    endsWith: "结尾为",
    regex: "正则匹配",
    greaterThan: "大于",
    lessThan: "小于",
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id} className="bg-secondary/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">条件组合逻辑</span>
                <Select
                  value={rule.logic}
                  onValueChange={(v) => onUpdateRule(rule.id, { logic: v })}
                >
                  <SelectTrigger className="w-24 h-8 bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onRemoveRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {rule.conditions.map((condition: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={condition.field}
                    onValueChange={(v) => {
                      const newConditions = [...rule.conditions]
                      newConditions[index] = { ...condition, field: v }
                      onUpdateRule(rule.id, { conditions: newConditions })
                    }}
                  >
                    <SelectTrigger className="w-32 bg-secondary border-0">
                      <SelectValue placeholder="选择字段" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(v) => {
                      const newConditions = [...rule.conditions]
                      newConditions[index] = { ...condition, operator: v }
                      onUpdateRule(rule.id, { conditions: newConditions })
                    }}
                  >
                    <SelectTrigger className="w-28 bg-secondary border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op} value={op}>
                          {operatorLabels[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={condition.value}
                    onChange={(e) => {
                      const newConditions = [...rule.conditions]
                      newConditions[index] = { ...condition, value: e.target.value }
                      onUpdateRule(rule.id, { conditions: newConditions })
                    }}
                    placeholder="输入值"
                    className="flex-1 bg-secondary border-0"
                  />

                  {rule.conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemoveCondition(rule.id, index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => onAddCondition(rule.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              添加条件
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={onAddRule}>
        <Plus className="h-4 w-4 mr-2" />
        添加规则组
      </Button>
    </div>
  )
}

// 特征码规则构建器
function SignatureRuleBuilder({
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
}: {
  rules: any[]
  onAddRule: () => void
  onRemoveRule: (id: string) => void
  onUpdateRule: (id: string, updates: any) => void
}) {
  const [inputMode, setInputMode] = React.useState<"text" | "hex">("text")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm">输入模式</span>
        <div className="flex items-center gap-2">
          <Button
            variant={inputMode === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setInputMode("text")}
          >
            可见字符
          </Button>
          <Button
            variant={inputMode === "hex" ? "default" : "outline"}
            size="sm"
            onClick={() => setInputMode("hex")}
          >
            十六进制
          </Button>
        </div>
      </div>

      {rules.map((rule) => (
        <Card key={rule.id} className="bg-secondary/30 border-border">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">特征码</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onRemoveRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>偏移位置</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-secondary border-0"
                />
              </div>
              <div className="space-y-2">
                <Label>特征值 ({inputMode === "text" ? "可见字符" : "十六进制"})</Label>
                <Textarea
                  placeholder={inputMode === "text" ? "输入特征字符串" : "输入十六进制值，如: 48 54 54 50"}
                  className="bg-secondary border-0 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" onClick={onAddRule}>
        <Plus className="h-4 w-4 mr-2" />
        添加特征码
      </Button>
    </div>
  )
}

// 异常包配置
function AbnormalPacketConfig() {
  const abnormalTypes = [
    { id: "malformed", label: "畸形包", description: "协议格式错误的报文" },
    { id: "fragment", label: "碎片包", description: "IP 分片报文" },
    { id: "oversized", label: "超长包", description: "超过 MTU 的报文" },
    { id: "tiny", label: "微小包", description: "小于最小长度的报文" },
    { id: "duplicate", label: "重复包", description: "重复序列号的报文" },
    { id: "outOfOrder", label: "乱序包", description: "序列号乱序的报文" },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">选择需要识别的异常包类型</p>
      <div className="grid gap-3 md:grid-cols-2">
        {abnormalTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-start justify-between p-4 rounded-lg bg-secondary/50 border border-border"
          >
            <div>
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-muted-foreground">{type.description}</div>
            </div>
            <Switch />
          </div>
        ))}
      </div>
    </div>
  )
}

// 步骤5: 处理策略
function StepProcessing({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">流量标记</div>
            <div className="text-xs text-muted-foreground">为匹配的流量添加自定义标记值</div>
          </div>
          <Switch
            checked={formData.markEnabled}
            onCheckedChange={(checked) => updateFormData({ markEnabled: checked })}
          />
        </div>
        {formData.markEnabled && (
          <div className="pl-4">
            <Label>标记值</Label>
            <Input
              placeholder="输入标记值"
              value={formData.markValue}
              onChange={(e) => updateFormData({ markValue: e.target.value })}
              className="mt-2 bg-secondary border-0 max-w-xs"
            />
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">字段改写</div>
            <div className="text-xs text-muted-foreground">改写报文中的特定字段</div>
          </div>
          <Switch
            checked={formData.rewriteEnabled}
            onCheckedChange={(checked) => updateFormData({ rewriteEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">封装剥离</div>
            <div className="text-xs text-muted-foreground">剥离隧道封装或 VLAN/MPLS 标签</div>
          </div>
          <Switch
            checked={formData.stripEnabled}
            onCheckedChange={(checked) => updateFormData({ stripEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">报文截断</div>
            <div className="text-xs text-muted-foreground">截断报文至指定长度</div>
          </div>
          <Switch
            checked={formData.truncateEnabled}
            onCheckedChange={(checked) => updateFormData({ truncateEnabled: checked })}
          />
        </div>
        {formData.truncateEnabled && (
          <div className="pl-4">
            <Label>截断长度 (字节)</Label>
            <Input
              type="number"
              placeholder="1500"
              value={formData.truncateLength}
              onChange={(e) => updateFormData({ truncateLength: e.target.value })}
              className="mt-2 bg-secondary border-0 max-w-xs"
            />
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">流锁定</div>
            <div className="text-xs text-muted-foreground">锁定匹配的会话流，持续采集后续报文</div>
          </div>
          <Switch
            checked={formData.flowLockEnabled}
            onCheckedChange={(checked) => updateFormData({ flowLockEnabled: checked })}
          />
        </div>
      </div>
    </div>
  )
}

// 步骤6: 采样策略
function StepSampling({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>采样方式</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            onClick={() => updateFormData({ samplingType: "none" })}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors",
              formData.samplingType === "none"
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/50 hover:bg-secondary"
            )}
          >
            <div className="font-medium text-sm">不采样</div>
            <div className="text-xs text-muted-foreground mt-1">采集全部匹配流量</div>
          </div>

          <div
            onClick={() => updateFormData({ samplingType: "hash" })}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors",
              formData.samplingType === "hash"
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/50 hover:bg-secondary"
            )}
          >
            <div className="font-medium text-sm">Hash 采样</div>
            <div className="text-xs text-muted-foreground mt-1">基于五元组 Hash 的概率采样</div>
          </div>

          <div
            onClick={() => updateFormData({ samplingType: "roundRobin" })}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-colors",
              formData.samplingType === "roundRobin"
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/50 hover:bg-secondary"
            )}
          >
            <div className="font-medium text-sm">轮巡采样</div>
            <div className="text-xs text-muted-foreground mt-1">按时间周期轮巡采集</div>
          </div>
        </div>
      </div>

      {formData.samplingType === "hash" && (
        <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
          <div className="space-y-2">
            <Label>采样比例 (1:N)</Label>
            <Select
              value={formData.hashRatio}
              onValueChange={(v) => updateFormData({ hashRatio: v })}
            >
              <SelectTrigger className="bg-secondary border-0 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">1:10</SelectItem>
                <SelectItem value="50">1:50</SelectItem>
                <SelectItem value="100">1:100</SelectItem>
                <SelectItem value="200">1:200</SelectItem>
                <SelectItem value="500">1:500</SelectItem>
                <SelectItem value="1000">1:1000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hash 种子更新周期 (秒)</Label>
            <Input
              type="number"
              value={formData.hashUpdatePeriod}
              onChange={(e) => updateFormData({ hashUpdatePeriod: e.target.value })}
              className="bg-secondary border-0 max-w-xs"
            />
          </div>
        </div>
      )}

      {formData.samplingType === "roundRobin" && (
        <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
          <div className="space-y-2">
            <Label>轮巡周期 (毫秒)</Label>
            <Input
              type="number"
              value={formData.roundRobinPeriod}
              onChange={(e) => updateFormData({ roundRobinPeriod: e.target.value })}
              className="bg-secondary border-0 max-w-xs"
            />
            <p className="text-xs text-muted-foreground">每个周期内采集一次</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 步骤7: 输出策略
function StepOutput({ formData, updateFormData }: { formData: any; updateFormData: (updates: any) => void }) {
  const outputTargets = [
    { id: "fullTraffic", label: "全流量检测", description: "输出完整流量数据" },
    { id: "firstN", label: "前 N 包检测", description: "仅输出会话前 N 个报文" },
    { id: "encrypted", label: "加密流量检测", description: "输出加密流量进行分析" },
    { id: "specificApp", label: "特定应用检测", description: "输出特定应用的流量" },
  ]

  const toggleOutputTarget = (targetId: string) => {
    const targets = formData.outputTargets.includes(targetId)
      ? formData.outputTargets.filter((t: string) => t !== targetId)
      : [...formData.outputTargets, targetId]
    updateFormData({ outputTargets: targets })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>输出目标</Label>
        <div className="grid gap-3 md:grid-cols-2">
          {outputTargets.map((target) => (
            <div
              key={target.id}
              onClick={() => toggleOutputTarget(target.id)}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-colors",
                formData.outputTargets.includes(target.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/50 hover:bg-secondary"
              )}
            >
              <div className="font-medium text-sm">{target.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{target.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>附加输出</Label>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">PCAP 文件提取</div>
            <div className="text-xs text-muted-foreground">将匹配流量保存为 PCAP 文件</div>
          </div>
          <Switch
            checked={formData.pcapEnabled}
            onCheckedChange={(checked) => updateFormData({ pcapEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">流日志提取</div>
            <div className="text-xs text-muted-foreground">输出流级别的日志信息</div>
          </div>
          <Switch
            checked={formData.logEnabled}
            onCheckedChange={(checked) => updateFormData({ logEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <div className="font-medium text-sm">协议元数据提取</div>
            <div className="text-xs text-muted-foreground">提取 HTTP、TLS、DNS 等协议元数据</div>
          </div>
          <Switch
            checked={formData.metadataEnabled}
            onCheckedChange={(checked) => updateFormData({ metadataEnabled: checked })}
          />
        </div>
      </div>
    </div>
  )
}

// 步骤8: 校验发布
function StepReview({ formData }: { formData: any }) {
  const sourceLabels: Record<string, string> = {
    national: "国家侧",
    provincial: "省级",
    local: "本地",
  }

  const priorityLabels: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  }

  return (
    <div className="space-y-6">
      {/* 冲突检测 */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <Check className="h-5 w-5 text-green-500 mt-0.5" />
        <div>
          <p className="font-medium text-green-500">规则校验通过</p>
          <p className="text-sm text-muted-foreground">未检测到规则冲突或覆盖问题</p>
        </div>
      </div>

      {/* 任务摘要 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">任务信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">任务编号</span>
              <span className="font-mono">{formData.taskId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">任务名称</span>
              <span>{formData.taskName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">指令来源</span>
              <span>{sourceLabels[formData.source]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">优先级</span>
              <span>{priorityLabels[formData.priority]}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">流量源</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">接入链路</span>
              <span>{formData.links.length} 条</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">流量方向</span>
              <span>
                {formData.direction === "both" ? "双向" : formData.direction === "inbound" ? "入向" : "出向"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">协议类型</span>
              <span>{formData.protocols.length || "全部"} 种</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">筛选规则</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">规则组数</span>
              <span>{formData.rules.length} 组</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">条件总数</span>
              <span>
                {formData.rules.reduce((acc: number, r: any) => acc + r.conditions.length, 0)} 个
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">输出策略</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">采样方式</span>
              <span>
                {formData.samplingType === "none" && "不采样"}
                {formData.samplingType === "hash" && `Hash 1:${formData.hashRatio}`}
                {formData.samplingType === "roundRobin" && `轮巡 ${formData.roundRobinPeriod}ms`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">输出目标</span>
              <span>{formData.outputTargets.length} 个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PCAP 提取</span>
              <span>{formData.pcapEnabled ? "启用" : "禁用"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">流日志</span>
              <span>{formData.logEnabled ? "启用" : "禁用"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 影响范围 */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">预估影响范围</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">~2.5 Gbps</div>
              <div className="text-xs text-muted-foreground mt-1">预估命中流量</div>
            </div>
            <div>
              <div className="text-2xl font-bold">~50K/s</div>
              <div className="text-xs text-muted-foreground mt-1">预估命中包速</div>
            </div>
            <div>
              <div className="text-2xl font-bold">~12K</div>
              <div className="text-xs text-muted-foreground mt-1">预估并发连接</div>
            </div>
            <div>
              <div className="text-2xl font-bold">~500 GB/天</div>
              <div className="text-xs text-muted-foreground mt-1">预估存储占用</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
