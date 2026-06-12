"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Plus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Package,
  Network,
  Zap,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CommandSource,
  CommandLevel,
  SystemType,
  HandleType,
  ReportType,
  ReportCycle,
  CommandScene,
  CountReportCycle,
  DataOutputMethod,
  PollingCycle,
  PackageNValues,
  TrafficReportType,
  SaveTime,
  OutputType,
  TrafficSamplingRatio,
  NetflowSamplingRatio,
  RuleType,
  TransportProtocols,
  ApplicationProtocols,
  OperatorCodes,
  ProvinceCodes,
  getDataOutputMethodByScene,
  type DynamicTrafficCommand,
  type RuleInfo,
} from "@/lib/command-types"
import { useUser } from "@/lib/user-context"

interface TaskCreateWizardProps {
  onBack: () => void
}

// 模拟端口组数据（关联输入输出管理模块预设方式）
const mockPortGroups = [
  { id: "PG-001", name: "省网出口-输入方式A", type: "input", comCode: "0013", effectProvince: ["110000", "120000"], device: "DPI-CORE-01", ports: ["GE0/0/1", "GE0/0/2"], bandwidth: 10000 },
  { id: "PG-002", name: "城域网出口-输入方式B", type: "input", comCode: "0013", effectProvince: ["310000", "320000"], device: "DPI-EDGE-01", ports: ["XGE0/0/1", "XGE0/0/2"], bandwidth: 40000 },
  { id: "PG-005", name: "IDC出口-输入方式", type: "input", comCode: "0013", effectProvince: ["330000"], device: "DPI-IDC-01", ports: ["100GE0/0/1"], bandwidth: 200000 },
  { id: "PG-003", name: "国家侧-输出方式", type: "output", comCode: "0013", effectProvince: ["110000"], device: "FORWARD-01", ports: ["100GE0/0/1"], bandwidth: 100000 },
  { id: "PG-004", name: "企业侧-输出方式", type: "output", comCode: "0013", effectProvince: ["440000"], device: "FORWARD-02", ports: ["40GE0/0/1"], bandwidth: 80000 },
]

// 模拟规则策略数据
const mockRulePolicies = [
  { id: "RP-001", name: "HTTP流量监测策略", rules: [{ ruleType: 1, dstPort: "80,8080", protocolType: 6 }, { ruleType: 8, host: "*.example.com" }] },
  { id: "RP-002", name: "HTTPS加密流量策略", rules: [{ ruleType: 1, dstPort: "443", protocolType: 6 }, { ruleType: 9, sni: "*.target.cn" }] },
  { id: "RP-003", name: "特定应用协议监测", rules: [{ ruleType: 11, applicationProtocol: 3 }] },
  { id: "RP-004", name: "恶意特征码检测策略", rules: [{ ruleType: 3, udValue: "4d5a9000", offset: 0 }] },
]

// 不需要规则配置步骤、且显示输出端口组的输出方式：轮巡(4)、前N包(5)
const METHODS_SKIP_RULES = [4, 5]

function createInitialFormData(owner: string) {
  return {
    // commandInfo - 指令基本信息
    commandSource: 1,
    sourceSystem: "2",
    version: "4.0",
    commandId: Math.floor(Math.random() * 100000000),
    operationType: 0,
    level: 2,
    owner, // 自动填入当前用户，不可修改
    createTime: new Date().toISOString().slice(0, 19).replace("T", " "),

    // 输入端口组选择
    inputPortGroup: "",

    // commandResult - 指令执行结果
    handleType: 1,
    reportType: 0,
    reportCycle: 1,

    // commandRule - 指令内容
    commandType: "1.6.1.35",
    commandScene: 1,
    onlyCount: 0,
    countReportCycle: 0,
    dataOutputMethod: 0,
    pollingInterval: 24,
    pollingCycle: 0,
    packageNValue: 8,
    byteNValue: 64,

    // 输出端口组选择
    outputPortGroup: "",

    // rules - 规则数组
    rules: [] as Array<{
      id: string
      ruleId: number
      ruleAlias: string
      userType?: number
      firstNBuffer: string
      nBuffer: number
      trafficReportType: string[]
      storageAmount?: number
      saveTime: number
      outputType: string[]
      ruleInfo: RuleInfo[]
      trafficSamplingRatio: number
      pollingSamplingRatio?: number
      packageNSamplingRatio?: number
      netflowSamplingRatio: number
      startTime: string
      endTime: string
      fromPolicy?: string
    }>,
  }
}

type FormDataType = ReturnType<typeof createInitialFormData>

export function TaskCreateWizard({ onBack }: TaskCreateWizardProps) {
  const { currentUser } = useUser()
  const [formData, setFormData] = React.useState<FormDataType>(() => createInitialFormData(currentUser.username))
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])
  const [policyDialogOpen, setPolicyDialogOpen] = React.useState(false)

  // 动态步骤：根据数据输出方式决定是否跳过"规则配置"
  const skipRules = METHODS_SKIP_RULES.includes(formData.dataOutputMethod)
  const steps = React.useMemo(() => {
    const base = [
      { key: "info", title: "指令基本信息", description: "配置指令元数据" },
      { key: "input", title: "输入配置", description: "输入端口组、执行结果与指令场景" },
      { key: "output", title: "数据输出", description: "配置输出方式与端口组" },
      { key: "rules", title: "规则配置", description: "添加规则或调用策略" },
      { key: "review", title: "校验发布", description: "确认并发布" },
    ]
    return skipRules ? base.filter((s) => s.key !== "rules") : base
  }, [skipRules])

  const [currentStepKey, setCurrentStepKey] = React.useState("info")
  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === currentStepKey))
  const currentStep = steps[currentIndex] || steps[0]

  // 当步骤集合变化时，确保当前步骤仍然有效
  React.useEffect(() => {
    if (!steps.find((s) => s.key === currentStepKey)) {
      setCurrentStepKey("output")
    }
  }, [steps, currentStepKey])

  const updateFormData = (updates: Partial<FormDataType>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...updates }
      // 自动关联：指令场景变化时更新数据输出方式
      if (updates.commandScene !== undefined) {
        const outputMethodConstraint = getDataOutputMethodByScene(updates.commandScene)
        if (outputMethodConstraint?.fixed) {
          newData.dataOutputMethod = outputMethodConstraint.value
        }
      }
      return newData
    })
    setValidationErrors([])
  }

  const validateStep = (key: string): boolean => {
    const errors: string[] = []
    switch (key) {
      case "info":
        if (!formData.owner) errors.push("指令属主不能为空")
        break
      case "input":
        if (!formData.inputPortGroup) errors.push("请选择输入端口组")
        if (formData.handleType === 1 && formData.reportType === 1 && !formData.reportCycle) {
          errors.push("定时报送需要设置上报频次")
        }
        break
      case "output":
        if (METHODS_SKIP_RULES.includes(formData.dataOutputMethod) && !formData.outputPortGroup) {
          errors.push("请选择输出端口组")
        }
        break
      case "rules":
        if (formData.rules.length === 0) {
          errors.push("请至少添加一条规则或调用规则策略")
        }
        formData.rules.forEach((rule, index) => {
          if (!rule.ruleAlias) errors.push(`规则${index + 1}：规则别名不能为空`)
          if (rule.trafficReportType.length === 0) errors.push(`规则${index + 1}：请选择流量发送方式`)
          if (!rule.startTime || !rule.endTime) errors.push(`规则${index + 1}：请设置有效时间段`)
        })
        break
    }
    setValidationErrors(errors)
    return errors.length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStepKey) && currentIndex < steps.length - 1) {
      setCurrentStepKey(steps[currentIndex + 1].key)
    }
  }

  const prevStep = () => {
    if (currentIndex > 0) {
      setCurrentStepKey(steps[currentIndex - 1].key)
    }
  }

  const handlePublish = () => {
    if (validateStep(currentStepKey)) {
      const selectedInputGroup = mockPortGroups.find((g) => g.id === formData.inputPortGroup)
      const commandData: DynamicTrafficCommand = {
        commandInfo: {
          commandSource: formData.commandSource,
          sourceSystem: formData.sourceSystem,
          version: formData.version,
          commandId: formData.commandId,
          operationType: formData.operationType,
          level: formData.level,
          owner: formData.owner,
          createTime: formData.createTime,
        },
        commandObject: {
          effectSystem: "2",
          comCode: selectedInputGroup?.comCode || "",
          effectVendor: "",
          effectProvince: selectedInputGroup?.effectProvince.join(",") || "",
          effectHouse: "",
        },
        commandResult: {
          handleType: formData.handleType,
          reportType: formData.handleType === 1 ? formData.reportType : undefined,
          reportCycle: formData.handleType === 1 && formData.reportType === 1 ? formData.reportCycle : undefined,
        },
        commandRule: {
          commandType: formData.commandType,
          commandScene: formData.commandScene,
          onlyCount: formData.onlyCount,
          countReportCycle: formData.countReportCycle,
          dataOutputMethod: formData.dataOutputMethod,
          pollingInterval: formData.dataOutputMethod === 4 ? formData.pollingInterval : undefined,
          pollingCycle: formData.dataOutputMethod === 4 ? formData.pollingCycle : undefined,
          packageNValue: formData.dataOutputMethod === 5 ? formData.packageNValue : undefined,
          byteNValue: formData.dataOutputMethod === 3 ? formData.byteNValue : undefined,
          rule: formData.rules.map((r) => ({
            ruleId: r.ruleId,
            ruleAlias: r.ruleAlias,
            userType: r.userType,
            firstNBuffer: r.firstNBuffer,
            nBuffer: r.firstNBuffer === "1" ? r.nBuffer : undefined,
            trafficReportType: r.trafficReportType.join(","),
            storageAmount: r.trafficReportType.some((t) => ["2", "4"].includes(t)) ? r.storageAmount : undefined,
            saveTime: r.trafficReportType.some((t) => ["2", "4"].includes(t)) ? r.saveTime : undefined,
            outputType: r.trafficReportType.some((t) => ["3", "5"].includes(t)) ? r.outputType.join(",") : undefined,
            ruleInfo: r.ruleInfo,
            trafficSamplingRatio: formData.dataOutputMethod !== 4 && formData.dataOutputMethod !== 5 ? r.trafficSamplingRatio : undefined,
            pollingSamplingRatio: formData.dataOutputMethod === 4 ? r.pollingSamplingRatio : undefined,
            packageNSamplingRatio: formData.dataOutputMethod === 5 ? r.packageNSamplingRatio : undefined,
            netflowSamplingRatio: r.trafficReportType.includes("5") ? r.netflowSamplingRatio : undefined,
            startTime: r.startTime,
            endTime: r.endTime,
          })),
        },
      }
      console.log("[v0] 生成的指令数据:", JSON.stringify(commandData, null, 2))
      console.log("[v0] 输入端口组:", formData.inputPortGroup, "输出端口组:", formData.outputPortGroup)
      alert("指令创建成功！")
      onBack()
    }
  }

  const importFromPolicy = (policyId: string) => {
    const policy = mockRulePolicies.find((p) => p.id === policyId)
    if (policy) {
      const newRule = {
        id: `rule-${Date.now()}`,
        ruleId: formData.rules.length + 1,
        ruleAlias: policy.name,
        firstNBuffer: "0",
        nBuffer: 8,
        trafficReportType: [] as string[],
        saveTime: 6,
        outputType: [] as string[],
        ruleInfo: policy.rules as RuleInfo[],
        trafficSamplingRatio: 0,
        netflowSamplingRatio: 1,
        startTime: "",
        endTime: "",
        fromPolicy: policyId,
      }
      updateFormData({ rules: [...formData.rules, newRule] })
      setPolicyDialogOpen(false)
    }
  }

  const isLastStep = currentIndex === steps.length - 1

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">新建动态流量获取指令</h1>
          <p className="text-sm text-muted-foreground mt-1">F.1.35 公共互联网动态流量获取指令下发</p>
        </div>
      </div>

      {/* 步骤指示器 */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentIndex > index
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentIndex === index
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    )}
                  >
                    {currentIndex > index ? <Check className="h-5 w-5" /> : <span className="text-sm font-medium">{index + 1}</span>}
                  </div>
                  <div className="mt-2 text-center hidden lg:block">
                    <div
                      className={cn(
                        "text-xs font-medium",
                        currentIndex >= index ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2", currentIndex > index ? "bg-primary" : "bg-muted")} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 验证错误提示 */}
      {validationErrors.length > 0 && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">请修正以下问题：</p>
                <ul className="list-disc list-inside text-sm text-destructive/80 mt-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤内容 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>{currentStep.title}</CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStepKey === "info" && <StepCommandInfo formData={formData} updateFormData={updateFormData} />}
          {currentStepKey === "input" && <StepInputConfig formData={formData} updateFormData={updateFormData} />}
          {currentStepKey === "output" && <StepDataOutput formData={formData} updateFormData={updateFormData} />}
          {currentStepKey === "rules" && (
            <StepRuleConfig formData={formData} updateFormData={updateFormData} onOpenPolicyDialog={() => setPolicyDialogOpen(true)} />
          )}
          {currentStepKey === "review" && <StepReview formData={formData} />}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentIndex === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          上一步
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            取消
          </Button>
          {isLastStep ? (
            <Button onClick={handlePublish}>
              <Check className="h-4 w-4 mr-2" />
              发布指令
            </Button>
          ) : (
            <Button onClick={nextStep}>
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* 规则策略选择对话框 */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>从规则策略库调用</DialogTitle>
            <DialogDescription>选择预配置的规则策略，快速导入规则内容</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {mockRulePolicies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => importFromPolicy(policy.id)}
              >
                <div>
                  <div className="font-medium">{policy.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">包含 {policy.rules.length} 条规则</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {policy.rules.slice(0, 2).map((rule, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {RuleType[rule.ruleType as keyof typeof RuleType]}
                    </Badge>
                  ))}
                  {policy.rules.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{policy.rules.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 字段提示组件
function FieldTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ==================== 步骤1: 指令基本信息 ====================
function StepCommandInfo({ formData, updateFormData }: { formData: FormDataType; updateFormData: (updates: Partial<FormDataType>) => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          管理指令ID
          <FieldTooltip content="指令的唯一编码，系统自动生成" />
        </Label>
        <Input value={formData.commandId} disabled className="font-mono" />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          协议版本号
          <FieldTooltip content="格式：主版本号.副版本号，当前版本4.0" />
        </Label>
        <Input value={formData.version} disabled />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          指令来源 <span className="text-destructive">*</span>
        </Label>
        <Select value={String(formData.commandSource)} onValueChange={(v) => updateFormData({ commandSource: Number(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CommandSource).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          下发系统 <span className="text-destructive">*</span>
        </Label>
        <Select value={formData.sourceSystem} onValueChange={(v) => updateFormData({ sourceSystem: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SystemType).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          操作类型 <span className="text-destructive">*</span>
        </Label>
        <Select value={String(formData.operationType)} onValueChange={(v) => updateFormData({ operationType: Number(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">新增指令</SelectItem>
            <SelectItem value="1">删除指令</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          指令优先级 <span className="text-destructive">*</span>
        </Label>
        <Select value={String(formData.level)} onValueChange={(v) => updateFormData({ level: Number(v) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CommandLevel).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          指令属主
          <FieldTooltip content="自动填入当前登录用户，不可修改" />
        </Label>
        <Input value={formData.owner} disabled />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">指令生成时间</Label>
        <Input value={formData.createTime} disabled />
      </div>
    </div>
  )
}

// ==================== 步骤2: 输入配置（输入端口组 + 执行结果 + 指令场景） ====================
function StepInputConfig({ formData, updateFormData }: { formData: FormDataType; updateFormData: (updates: Partial<FormDataType>) => void }) {
  const inputPortGroups = mockPortGroups.filter((g) => g.type === "input")
  const selectedGroup = mockPortGroups.find((g) => g.id === formData.inputPortGroup)
  const sceneConstraint = getDataOutputMethodByScene(formData.commandScene)

  return (
    <div className="space-y-8">
      {/* 区块一：输入端口组 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">输入端口组选择</h3>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary mt-0.5" />
          <p className="text-sm text-muted-foreground">
            输入端口组在「输入输出管理」中预配置，包含运营商、生效省份、采集设备等指令对象信息，选择后自动关联。
          </p>
        </div>
        <Label className="flex items-center gap-2">
          输入端口组 <span className="text-destructive">*</span>
        </Label>
        <div className="grid gap-3">
          {inputPortGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => updateFormData({ inputPortGroup: group.id })}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                formData.inputPortGroup === group.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Network className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {group.device} | {group.ports.join(", ")} | {(group.bandwidth / 1000).toFixed(0)}Gbps
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                {group.effectProvince.map((code) => (
                  <Badge key={code} variant="outline" className="text-xs">
                    {String(ProvinceCodes[code as keyof typeof ProvinceCodes] || code).replace(/省|市|自治区|壮族|回族|维吾尔/g, "")}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedGroup && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/50 text-sm">
            <div>
              <span className="text-muted-foreground">运营商：</span>
              <span className="font-medium">{OperatorCodes[selectedGroup.comCode as keyof typeof OperatorCodes]}</span>
            </div>
            <div>
              <span className="text-muted-foreground">采集设备：</span>
              <span className="font-medium">{selectedGroup.device}</span>
            </div>
            <div>
              <span className="text-muted-foreground">端口：</span>
              <span className="font-medium font-mono">{selectedGroup.ports.join(",")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">带宽：</span>
              <span className="font-medium">{(selectedGroup.bandwidth / 1000).toFixed(0)} Gbps</span>
            </div>
          </div>
        )}
      </section>

      {/* 区块二：执行结果 */}
      <section className="space-y-3 border-t border-border pt-6">
        <h3 className="text-sm font-semibold">指令执行结果处理</h3>
        <Label className="flex items-center gap-2">
          处理方式 <span className="text-destructive">*</span>
        </Label>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(HandleType).map(([key, label]) => (
            <div
              key={key}
              onClick={() => updateFormData({ handleType: Number(key) })}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-colors",
                formData.handleType === Number(key) ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">{key === "0" ? "数据存储在本地系统" : "数据上报至上级系统"}</div>
            </div>
          ))}
        </div>

        {formData.handleType === 1 && (
          <>
            <Label className="flex items-center gap-2 mt-2">
              数据上报方式
              <FieldTooltip content="选择数据上报的方式" />
            </Label>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(ReportType).map(([key, label]) => (
                <div
                  key={key}
                  onClick={() => updateFormData({ reportType: Number(key) })}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-colors",
                    formData.reportType === Number(key) ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  )}
                >
                  <div className="font-medium text-sm">{label}</div>
                </div>
              ))}
            </div>

            {formData.reportType === 1 && (
              <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                <Label className="flex items-center gap-2">
                  数据上报频次 <span className="text-destructive">*</span>
                  <FieldTooltip content="定时报送时必填，选择上报的时间间隔" />
                </Label>
                <Select value={String(formData.reportCycle)} onValueChange={(v) => updateFormData({ reportCycle: Number(v) })}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ReportCycle).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </section>

      {/* 区块三：指令场景 */}
      <section className="space-y-3 border-t border-border pt-6">
        <h3 className="text-sm font-semibold">指令场景</h3>
        <Label className="flex items-center gap-2">
          监测场景 <span className="text-destructive">*</span>
          <FieldTooltip content="选择监测流量的场景类型，不同场景会限制数据输出方式" />
        </Label>
        <div className="grid gap-4">
          {Object.entries(CommandScene).map(([key, label]) => {
            const constraint = getDataOutputMethodByScene(Number(key))
            return (
              <div
                key={key}
                onClick={() => updateFormData({ commandScene: Number(key) })}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  formData.commandScene === Number(key) ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{label}</div>
                  {constraint?.fixed && (
                    <Badge variant="secondary" className="text-xs">
                      输出方式固定为: {DataOutputMethod[constraint.value as keyof typeof DataOutputMethod]}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {sceneConstraint?.fixed && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
            <Info className="h-4 w-4 text-info mt-0.5" />
            <p className="text-sm text-muted-foreground">
              当前场景下，数据输出方式已自动设置为 "{DataOutputMethod[sceneConstraint.value as keyof typeof DataOutputMethod]}"
            </p>
          </div>
        )}

        <div className="space-y-4 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                开启动态流量获取统计功能
                <FieldTooltip content="开启后只输出动态流量获取统计日志，不执行实际转发动作" />
              </Label>
              <p className="text-xs text-muted-foreground mt-1">默认为不统计</p>
            </div>
            <Switch checked={formData.onlyCount === 1} onCheckedChange={(checked) => updateFormData({ onlyCount: checked ? 1 : 0 })} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              统计数据上报频次 <span className="text-destructive">*</span>
            </Label>
            <Select value={String(formData.countReportCycle)} onValueChange={(v) => updateFormData({ countReportCycle: Number(v) })}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CountReportCycle).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </div>
  )
}

// ==================== 步骤3: 数据输出配置 ====================
function StepDataOutput({ formData, updateFormData }: { formData: FormDataType; updateFormData: (updates: Partial<FormDataType>) => void }) {
  const sceneConstraint = getDataOutputMethodByScene(formData.commandScene)
  const isOutputMethodLocked = sceneConstraint?.fixed
  const outputPortGroups = mockPortGroups.filter((g) => g.type === "output")
  const selectedOutputGroup = mockPortGroups.find((g) => g.id === formData.outputPortGroup)
  // 仅在轮巡(4)/前N包(5)时显示输出端口组
  const showOutputPortGroup = METHODS_SKIP_RULES.includes(formData.dataOutputMethod)

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          数据输出方式
          {isOutputMethodLocked && (
            <Badge variant="secondary" className="text-xs">
              由场景约束
            </Badge>
          )}
        </Label>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(DataOutputMethod).map(([key, label]) => (
            <div
              key={key}
              onClick={() => !isOutputMethodLocked && updateFormData({ dataOutputMethod: Number(key) })}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                formData.dataOutputMethod === Number(key) ? "border-primary bg-primary/10" : "border-border",
                isOutputMethodLocked && formData.dataOutputMethod !== Number(key) ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{label}</div>
                {METHODS_SKIP_RULES.includes(Number(key)) && (
                  <Badge variant="outline" className="text-xs">
                    无需规则
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 轮巡输出参数 */}
      {formData.dataOutputMethod === 4 && (
        <Card className="bg-muted/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">轮巡输出参数</CardTitle>
            <CardDescription>当数据输出方式为"轮巡输出"时必填</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  轮巡间隔 <span className="text-destructive">*</span>
                  <FieldTooltip content="单位为小时，默认24小时" />
                </Label>
                <Input type="number" value={formData.pollingInterval} onChange={(e) => updateFormData({ pollingInterval: Number(e.target.value) })} min={1} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  轮巡周期 <span className="text-destructive">*</span>
                </Label>
                <Select value={String(formData.pollingCycle)} onValueChange={(v) => updateFormData({ pollingCycle: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PollingCycle).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 前N包输出参数 */}
      {formData.dataOutputMethod === 5 && (
        <Card className="bg-muted/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">前N包输出参数</CardTitle>
            <CardDescription>当数据输出方式为"前N包输出"时必填</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                前N包输出N值 <span className="text-destructive">*</span>
                <FieldTooltip content="可选值：4、8、16、32，默认为8" />
              </Label>
              <Select value={String(formData.packageNValue)} onValueChange={(v) => updateFormData({ packageNValue: Number(v) })}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PackageNValues.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 单包前N字节参数 */}
      {formData.dataOutputMethod === 3 && (
        <Card className="bg-muted/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">单包输出参数</CardTitle>
            <CardDescription>当数据输出方式为"单个数据包数据输出"时必填</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                单包前N个字节输出N值 <span className="text-destructive">*</span>
                <FieldTooltip content="n值范围为64-数据包长度字节，默认为数据包长度" />
              </Label>
              <Input type="number" value={formData.byteNValue} onChange={(e) => updateFormData({ byteNValue: Number(e.target.value) })} className="max-w-xs" min={64} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 输出端口组选择（仅轮巡/前N包时显示） */}
      {showOutputPortGroup && (
        <div className="space-y-3 border-t border-border pt-4">
          <Label className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            输出端口组 <span className="text-destructive">*</span>
            <FieldTooltip content="选择流量输出的目标端口组，关联「输入输出管理」中预设的输出方式" />
          </Label>
          <div className="grid gap-3">
            {outputPortGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => updateFormData({ outputPortGroup: formData.outputPortGroup === group.id ? "" : group.id })}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                  formData.outputPortGroup === group.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {group.device} | {group.ports.join(", ")} | {(group.bandwidth / 1000).toFixed(0)}Gbps
                    </div>
                  </div>
                </div>
                <Checkbox checked={formData.outputPortGroup === group.id} />
              </div>
            ))}
          </div>
          {selectedOutputGroup && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-info/5 border border-info/20 text-sm">
              <span className="text-muted-foreground">设备：</span>
              <span className="font-medium">{selectedOutputGroup.device}</span>
              <span className="text-muted-foreground">端口：</span>
              <span className="font-medium font-mono">{selectedOutputGroup.ports.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* 跳过规则配置提示 */}
      {showOutputPortGroup && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <Info className="h-4 w-4 text-warning mt-0.5" />
          <p className="text-sm text-muted-foreground">
            当前输出方式（{DataOutputMethod[formData.dataOutputMethod as keyof typeof DataOutputMethod]}）无需配置匹配规则，完成本步骤后将直接进入校验发布。
          </p>
        </div>
      )}
    </div>
  )
}

// ==================== 步骤4: 规则配置 ====================
function StepRuleConfig({
  formData,
  updateFormData,
  onOpenPolicyDialog,
}: {
  formData: FormDataType
  updateFormData: (updates: Partial<FormDataType>) => void
  onOpenPolicyDialog: () => void
}) {
  const [expandedRule, setExpandedRule] = React.useState<string | null>(null)

  const addRule = () => {
    const newRule = {
      id: `rule-${Date.now()}`,
      ruleId: formData.rules.length + 1,
      ruleAlias: "",
      firstNBuffer: "0",
      nBuffer: 8,
      trafficReportType: [] as string[],
      saveTime: 6,
      outputType: [] as string[],
      ruleInfo: [] as RuleInfo[],
      trafficSamplingRatio: 0,
      netflowSamplingRatio: 1,
      startTime: "",
      endTime: "",
    }
    updateFormData({ rules: [...formData.rules, newRule] })
    setExpandedRule(newRule.id)
  }

  const removeRule = (ruleId: string) => {
    updateFormData({ rules: formData.rules.filter((r) => r.id !== ruleId) })
    if (expandedRule === ruleId) setExpandedRule(null)
  }

  const updateRule = (ruleId: string, updates: Partial<FormDataType["rules"][0]>) => {
    updateFormData({
      rules: formData.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">已添加 {formData.rules.length} 条规则</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onOpenPolicyDialog}>
            <Link2 className="h-4 w-4 mr-2" />
            从策略库调用
          </Button>
          <Button onClick={addRule}>
            <Plus className="h-4 w-4 mr-2" />
            手动添加规则
          </Button>
        </div>
      </div>

      {formData.rules.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">暂无规则，请添加规则或从策略库调用</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={onOpenPolicyDialog}>
                <Link2 className="h-4 w-4 mr-2" />
                从策略库调用
              </Button>
              <Button onClick={addRule}>
                <Plus className="h-4 w-4 mr-2" />
                手动添加规则
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.rules.map((rule, index) => (
        <Card key={rule.id} className="bg-card border-border">
          <CardHeader className="cursor-pointer" onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{index + 1}</Badge>
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {rule.ruleAlias || "未命名规则"}
                    {rule.fromPolicy && (
                      <Badge variant="secondary" className="text-xs">
                        <Link2 className="h-3 w-3 mr-1" />
                        来自策略库
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {rule.ruleInfo.length > 0 ? `包含 ${rule.ruleInfo.length} 条规则内容` : "未配置规则内容"}
                    {rule.trafficReportType.length > 0 && (
                      <span> | {rule.trafficReportType.map((t) => TrafficReportType[Number(t) as keyof typeof TrafficReportType]).join("、")}</span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); removeRule(rule.id) }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {expandedRule === rule.id && (
            <CardContent className="border-t border-border pt-4">
              <RuleEditor rule={rule} formData={formData} onUpdate={(updates) => updateRule(rule.id, updates)} />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

// 规则编辑器组件
function RuleEditor({ rule, formData, onUpdate }: { rule: FormDataType["rules"][0]; formData: FormDataType; onUpdate: (updates: Partial<FormDataType["rules"][0]>) => void }) {
  const toggleTrafficReportType = (type: string) => {
    const types = rule.trafficReportType.includes(type) ? rule.trafficReportType.filter((t) => t !== type) : [...rule.trafficReportType, type]
    onUpdate({ trafficReportType: types })
  }

  const toggleOutputType = (type: string) => {
    const types = rule.outputType.includes(type) ? rule.outputType.filter((t) => t !== type) : [...rule.outputType, type]
    onUpdate({ outputType: types })
  }

  const needStorageAmount = rule.trafficReportType.some((t) => ["2", "4"].includes(t))
  const needOutputType = rule.trafficReportType.some((t) => ["3", "5"].includes(t))
  const needNetflowSampling = rule.trafficReportType.includes("5")
  const needTrafficSampling = formData.dataOutputMethod !== 4 && formData.dataOutputMethod !== 5

  const outputTypeOptions = rule.trafficReportType.includes("5") ? { 1: "协议元数据", 5: "流日志" } : OutputType

  const addRuleInfo = (ruleType: number) => {
    onUpdate({ ruleInfo: [...rule.ruleInfo, { ruleType }] })
  }
  const removeRuleInfo = (index: number) => {
    onUpdate({ ruleInfo: rule.ruleInfo.filter((_, i) => i !== index) })
  }
  const updateRuleInfo = (index: number, updates: Partial<RuleInfo>) => {
    onUpdate({ ruleInfo: rule.ruleInfo.map((info, i) => (i === index ? { ...info, ...updates } : info)) })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            规则别名 <span className="text-destructive">*</span>
          </Label>
          <Input placeholder="请输入规则别名" value={rule.ruleAlias} onChange={(e) => onUpdate({ ruleAlias: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>规则编号</Label>
          <Input value={rule.ruleId} disabled className="font-mono" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            起始时间 <span className="text-destructive">*</span>
          </Label>
          <Input type="datetime-local" value={rule.startTime.replace(" ", "T")} onChange={(e) => onUpdate({ startTime: e.target.value.replace("T", " ") })} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            终止时间 <span className="text-destructive">*</span>
          </Label>
          <Input type="datetime-local" value={rule.endTime.replace(" ", "T")} onChange={(e) => onUpdate({ endTime: e.target.value.replace("T", " ") })} />
        </div>
      </div>

      {/* 流量发送方式 */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          流量发送方式 <span className="text-destructive">*</span>
        </Label>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(TrafficReportType).map(([key, label]) => (
            <div
              key={key}
              onClick={() => toggleTrafficReportType(key)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                rule.trafficReportType.includes(key) ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
              )}
            >
              <Checkbox checked={rule.trafficReportType.includes(key)} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {needStorageAmount && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PCAP参数配置</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>流量总量(MB)</Label>
              <Input type="number" placeholder="留空表示持续采集" value={rule.storageAmount || ""} onChange={(e) => onUpdate({ storageAmount: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="space-y-2">
              <Label>
                PCAP文件存储时长 <span className="text-destructive">*</span>
              </Label>
              <Select value={String(rule.saveTime)} onValueChange={(v) => onUpdate({ saveTime: Number(v) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SaveTime).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {needOutputType && (
        <div className="space-y-3">
          <Label>
            筛选后流量用途 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(outputTypeOptions).map(([key, label]) => (
              <Badge key={key} variant={rule.outputType.includes(key) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleOutputType(key)}>
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">采样比配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {needTrafficSampling && (
            <div className="space-y-2">
              <Label>
                筛选流量采样比 <span className="text-destructive">*</span>
              </Label>
              <Select value={String(rule.trafficSamplingRatio)} onValueChange={(v) => onUpdate({ trafficSamplingRatio: Number(v) })}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TrafficSamplingRatio).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {needNetflowSampling && (
            <div className="space-y-2">
              <Label>
                流日志采样比 <span className="text-destructive">*</span>
              </Label>
              <Select value={String(rule.netflowSamplingRatio)} onValueChange={(v) => onUpdate({ netflowSamplingRatio: Number(v) })}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NetflowSamplingRatio).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 规则内容 */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">规则内容 (ruleInfo)</CardTitle>
              <CardDescription>配置具体的匹配规则</CardDescription>
            </div>
            <Select onValueChange={(v) => addRuleInfo(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="添加规则类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RuleType).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rule.ruleInfo.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">暂无规则内容，请从上方下拉框添加</div>
          ) : (
            rule.ruleInfo.map((info, index) => (
              <RuleInfoEditor key={index} index={index} ruleInfo={info} onUpdate={(updates) => updateRuleInfo(index, updates)} onRemove={() => removeRuleInfo(index)} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 规则内容编辑器
function RuleInfoEditor({ index, ruleInfo, onUpdate, onRemove }: { index: number; ruleInfo: RuleInfo; onUpdate: (updates: Partial<RuleInfo>) => void; onRemove: () => void }) {
  const ruleTypeName = RuleType[ruleInfo.ruleType as keyof typeof RuleType]
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{index + 1}</Badge>
            <span className="font-medium text-sm">{ruleTypeName}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(ruleInfo.ruleType === 1 || ruleInfo.ruleType === 2) && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>源IP</Label>
              <Input placeholder="例: 192.168.1.1" value={ruleInfo.srcIp || ""} onChange={(e) => onUpdate({ srcIp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>目的IP</Label>
              <Input placeholder="例: 10.0.0.1" value={ruleInfo.dstIp || ""} onChange={(e) => onUpdate({ dstIp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>源端口</Label>
              <Input placeholder="例: 80" value={ruleInfo.srcPort || ""} onChange={(e) => onUpdate({ srcPort: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>目的端口</Label>
              <Input placeholder="例: 443" value={ruleInfo.dstPort || ""} onChange={(e) => onUpdate({ dstPort: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>传输层协议</Label>
              <Select value={String(ruleInfo.protocolType || "")} onValueChange={(v) => onUpdate({ protocolType: v ? Number(v) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择协议" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TransportProtocols).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {(ruleInfo.ruleType === 3 || ruleInfo.ruleType === 4 || ruleInfo.ruleType === 6) && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                特征码 <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="十六进制特征码" value={ruleInfo.udValue || ""} onChange={(e) => onUpdate({ udValue: e.target.value })} />
            </div>
            {ruleInfo.ruleType === 3 && (
              <div className="space-y-2">
                <Label>
                  偏移量 <span className="text-destructive">*</span>
                </Label>
                <Input type="number" placeholder="偏移位置" value={ruleInfo.offset || ""} onChange={(e) => onUpdate({ offset: Number(e.target.value) })} />
              </div>
            )}
          </div>
        )}
        {ruleInfo.ruleType === 7 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                客户端IP <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="例: 192.168.0.0/16" value={ruleInfo.clientIp || ""} onChange={(e) => onUpdate({ clientIp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>
                服务端IP <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="例: 10.0.0.0/8" value={ruleInfo.serverIp || ""} onChange={(e) => onUpdate({ serverIp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>
                服务端口 <span className="text-destructive">*</span>
              </Label>
              <Input placeholder="例: 80,443" value={ruleInfo.serverPort || ""} onChange={(e) => onUpdate({ serverPort: e.target.value })} />
            </div>
          </div>
        )}
        {ruleInfo.ruleType === 8 && (
          <div className="space-y-2">
            <Label>
              Host <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="例: *.example.com" value={ruleInfo.host || ""} onChange={(e) => onUpdate({ host: e.target.value })} />
          </div>
        )}
        {ruleInfo.ruleType === 9 && (
          <div className="space-y-2">
            <Label>
              SNI <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="例: *.target.cn" value={ruleInfo.sni || ""} onChange={(e) => onUpdate({ sni: e.target.value })} />
          </div>
        )}
        {ruleInfo.ruleType === 10 && (
          <div className="space-y-2">
            <Label>
              URL <span className="text-destructive">*</span>
            </Label>
            <Input placeholder="例: /api/v1/*" value={ruleInfo.url || ""} onChange={(e) => onUpdate({ url: e.target.value })} />
          </div>
        )}
        {ruleInfo.ruleType === 11 && (
          <div className="space-y-2">
            <Label>
              应用协议 <span className="text-destructive">*</span>
            </Label>
            <Select value={String(ruleInfo.applicationProtocol || "")} onValueChange={(v) => onUpdate({ applicationProtocol: Number(v) })}>
              <SelectTrigger>
                <SelectValue placeholder="选择应用协议" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ApplicationProtocols).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== 步骤5: 校验发布 ====================
function StepReview({ formData }: { formData: FormDataType }) {
  const selectedInputGroup = mockPortGroups.find((g) => g.id === formData.inputPortGroup)
  const selectedOutputGroup = mockPortGroups.find((g) => g.id === formData.outputPortGroup)
  const showOutputPortGroup = METHODS_SKIP_RULES.includes(formData.dataOutputMethod)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
        <Check className="h-5 w-5 text-success mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-success">配置校验通过</p>
          <p className="text-muted-foreground">请确认以下配置信息，确认无误后点击"发布指令"</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">指令基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">指令ID</span>
              <span className="font-mono">{formData.commandId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">指令来源</span>
              <span>{CommandSource[formData.commandSource as keyof typeof CommandSource]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">优先级</span>
              <span>{CommandLevel[formData.level as keyof typeof CommandLevel]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">属主</span>
              <span>{formData.owner}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              输入端口组
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {selectedInputGroup ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">端口组</span>
                  <span>{selectedInputGroup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">设备</span>
                  <span>{selectedInputGroup.device}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">运营商</span>
                  <span>{OperatorCodes[selectedInputGroup.comCode as keyof typeof OperatorCodes]}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">未选择</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">指令场景与输出</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">指令场景</span>
              <span>{CommandScene[formData.commandScene as keyof typeof CommandScene]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">数据输出方式</span>
              <span>{DataOutputMethod[formData.dataOutputMethod as keyof typeof DataOutputMethod]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">结果处理</span>
              <span>{HandleType[formData.handleType as keyof typeof HandleType]}</span>
            </div>
          </CardContent>
        </Card>

        {showOutputPortGroup ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-info" />
                输出端口组
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedOutputGroup ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">端口组</span>
                    <span>{selectedOutputGroup.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">设备</span>
                    <span>{selectedOutputGroup.device}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">未选择</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">规则配置 ({formData.rules.length} 条)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formData.rules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">未配置规则</p>
                ) : (
                  formData.rules.map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm font-medium">{rule.ruleAlias || "未命名"}</span>
                      </div>
                      {rule.fromPolicy && (
                        <Badge variant="secondary" className="text-xs">
                          <Link2 className="h-3 w-3 mr-1" />
                          策略库
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
