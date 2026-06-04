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
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Plus,
  Trash2,
  AlertTriangle,
  GripVertical,
  X,
  HelpCircle,
  Copy
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
  OnlyCount,
  CountReportCycle,
  DataOutputMethod,
  PollingCycle,
  PackageNValues,
  TrafficReportType,
  SaveTime,
  OutputType,
  TrafficSamplingRatio,
  PollingSamplingRatio,
  NetflowSamplingRatio,
  RuleType,
  TunnelMatchType,
  UdValueMatchMode,
  CrossPkgMatch,
  FirstNBuffer,
  OperatorCodes,
  ProvinceCodes,
  TransportProtocols,
  ApplicationProtocols,
  getDataOutputMethodByScene,
  getRequiredFieldsByContext,
  getRuleRequiredFields,
  validateTupleRule,
  getOutputTypeOptions,
  type DynamicTrafficCommand,
  type CommandRule,
  type RuleInfo,
} from "@/lib/command-types"

// 步骤定义
const steps = [
  { id: 1, title: "指令基本信息", description: "配置指令元数据" },
  { id: 2, title: "指令对象", description: "设置生效范围" },
  { id: 3, title: "执行结果", description: "配置结果处理方式" },
  { id: 4, title: "指令场景", description: "选择监测场景" },
  { id: 5, title: "数据输出", description: "配置输出方式" },
  { id: 6, title: "规则配置", description: "添加筛选规则" },
  { id: 7, title: "校验发布", description: "确认并发布" },
]

interface TaskCreateWizardProps {
  onBack: () => void
}

// 初始表单数据
const initialFormData = {
  // commandInfo - 指令基本信息
  commandSource: 1,
  sourceSystem: "2",
  version: "4.0",
  commandId: Math.floor(Math.random() * 100000000),
  operationType: 0,
  level: 2,
  owner: "",
  createTime: new Date().toISOString().slice(0, 19).replace("T", " "),

  // commandObject - 指令对象
  effectSystem: ["2"],
  comCode: "",
  effectVendor: "",
  effectProvince: [] as string[],
  effectHouse: "",

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
  }>,
}

export function TaskCreateWizard({ onBack }: TaskCreateWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [formData, setFormData] = React.useState(initialFormData)
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => {
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

  // 验证当前步骤
  const validateStep = (step: number): boolean => {
    const errors: string[] = []
    
    switch (step) {
      case 1:
        if (!formData.owner) errors.push("指令属主不能为空")
        break
      case 2:
        if (!formData.comCode) errors.push("请选择运营商")
        if (formData.effectProvince.length === 0) errors.push("请选择生效省份")
        break
      case 3:
        if (formData.handleType === 1 && formData.reportType === 1 && !formData.reportCycle) {
          errors.push("定时报送需要设置上报频次")
        }
        break
      case 6:
        if (formData.rules.length === 0) {
          errors.push("请至少添加一条规则")
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
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = () => {
    if (validateStep(currentStep)) {
      // 构建完整指令数据
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
          effectSystem: formData.effectSystem.join(","),
          comCode: formData.comCode,
          effectVendor: formData.effectVendor,
          effectProvince: formData.effectProvince.join(","),
          effectHouse: formData.effectHouse,
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
          rule: formData.rules.map(r => ({
            ruleId: r.ruleId,
            ruleAlias: r.ruleAlias,
            userType: r.userType,
            firstNBuffer: r.firstNBuffer,
            nBuffer: r.firstNBuffer === "1" ? r.nBuffer : undefined,
            trafficReportType: r.trafficReportType.join(","),
            storageAmount: r.trafficReportType.some(t => ["2", "4"].includes(t)) ? r.storageAmount : undefined,
            saveTime: r.trafficReportType.some(t => ["2", "4"].includes(t)) ? r.saveTime : undefined,
            outputType: r.trafficReportType.some(t => ["3", "5"].includes(t)) ? r.outputType.join(",") : undefined,
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
      
      console.log("生成的指令数据:", JSON.stringify(commandData, null, 2))
      alert("指令创建成功！")
      onBack()
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
          <h1 className="text-2xl font-semibold text-foreground">新建动态流量获取指令</h1>
          <p className="text-sm text-muted-foreground mt-1">F.1.35 公共互联网动态流量获取指令下发</p>
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
                  <div className="mt-2 text-center hidden lg:block">
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
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepCommandInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <StepCommandObject formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepCommandResult formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <StepCommandScene formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <StepDataOutput formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 6 && (
            <StepRuleConfig formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 7 && (
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
    </div>
  )
}

// ==================== 步骤1: 指令基本信息 ====================
function StepCommandInfo({ formData, updateFormData }: { formData: typeof initialFormData; updateFormData: (updates: Partial<typeof initialFormData>) => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          管理指令ID
          <FieldTooltip content="指令的唯一编码，系统自动生成" />
        </Label>
        <Input
          value={formData.commandId}
          disabled
          className="bg-secondary border-0 font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          协议版本号
          <FieldTooltip content="格式：主版本号.副版本号，当前版本4.0" />
        </Label>
        <Input
          value={formData.version}
          disabled
          className="bg-secondary border-0"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          指令来源 <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={String(formData.commandSource)} 
          onValueChange={(v) => updateFormData({ commandSource: Number(v) })}
        >
          <SelectTrigger className="bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CommandSource).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          下发系统 <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={formData.sourceSystem} 
          onValueChange={(v) => updateFormData({ sourceSystem: v })}
        >
          <SelectTrigger className="bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SystemType).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          操作类型 <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={String(formData.operationType)} 
          onValueChange={(v) => updateFormData({ operationType: Number(v) })}
        >
          <SelectTrigger className="bg-secondary border-0">
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
        <Select 
          value={String(formData.level)} 
          onValueChange={(v) => updateFormData({ level: Number(v) })}
        >
          <SelectTrigger className="bg-secondary border-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CommandLevel).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          指令属主 <span className="text-destructive">*</span>
          <FieldTooltip content="指令下发的用户名" />
        </Label>
        <Input
          placeholder="请输入指令属主"
          value={formData.owner}
          onChange={(e) => updateFormData({ owner: e.target.value })}
          className="bg-secondary border-0"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          指令生成时间
        </Label>
        <Input
          value={formData.createTime}
          disabled
          className="bg-secondary border-0"
        />
      </div>
    </div>
  )
}

// ==================== 步骤2: 指令对象 ====================
function StepCommandObject({ formData, updateFormData }: { formData: typeof initialFormData; updateFormData: (updates: Partial<typeof initialFormData>) => void }) {
  const toggleProvince = (code: string) => {
    const provinces = formData.effectProvince.includes(code)
      ? formData.effectProvince.filter(p => p !== code)
      : [...formData.effectProvince, code]
    updateFormData({ effectProvince: provinces })
  }

  const toggleSystem = (code: string) => {
    const systems = formData.effectSystem.includes(code)
      ? formData.effectSystem.filter(s => s !== code)
      : [...formData.effectSystem, code]
    updateFormData({ effectSystem: systems })
  }

  const selectAllProvinces = () => {
    updateFormData({ effectProvince: Object.keys(ProvinceCodes) })
  }

  const clearProvinces = () => {
    updateFormData({ effectProvince: [] })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            运营商代码 <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={formData.comCode} 
            onValueChange={(v) => updateFormData({ comCode: v })}
          >
            <SelectTrigger className="bg-secondary border-0">
              <SelectValue placeholder="请选择运营商" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OperatorCodes).map(([code, name]) => (
                <SelectItem key={code} value={code}>{name} ({code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            生效厂商
            <FieldTooltip content="可选，指定生效的厂商名称" />
          </Label>
          <Input
            placeholder="请输入生效厂商（可选）"
            value={formData.effectVendor}
            onChange={(e) => updateFormData({ effectVendor: e.target.value })}
            className="bg-secondary border-0"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            生效机房
            <FieldTooltip content="可选，指定生效的机房" />
          </Label>
          <Input
            placeholder="请输入生效机房（可选）"
            value={formData.effectHouse}
            onChange={(e) => updateFormData({ effectHouse: e.target.value })}
            className="bg-secondary border-0"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          生效系统 <span className="text-destructive">*</span>
          <FieldTooltip content="可多选，多个系统时用逗号分隔" />
        </Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SystemType).map(([key, label]) => (
            <Badge
              key={key}
              variant={formData.effectSystem.includes(key) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSystem(key)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            生效省份 <span className="text-destructive">*</span>
            <FieldTooltip content="可多选，多个省份时用逗号分隔" />
          </Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAllProvinces}>
              全选
            </Button>
            <Button variant="outline" size="sm" onClick={clearProvinces}>
              清空
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 p-4 rounded-lg bg-secondary/30 max-h-[300px] overflow-y-auto">
          {Object.entries(ProvinceCodes).map(([code, name]) => (
            <div
              key={code}
              onClick={() => toggleProvince(code)}
              className={cn(
                "px-3 py-2 rounded text-sm cursor-pointer transition-colors text-center",
                formData.effectProvince.includes(code)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {name.replace(/省|市|自治区|壮族|回族|维吾尔/g, "")}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          已选择 {formData.effectProvince.length} 个省份
        </p>
      </div>
    </div>
  )
}

// ==================== 步骤3: 执行结果配置 ====================
function StepCommandResult({ formData, updateFormData }: { formData: typeof initialFormData; updateFormData: (updates: Partial<typeof initialFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          指令执行结果处理方式 <span className="text-destructive">*</span>
        </Label>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(HandleType).map(([key, label]) => (
            <div
              key={key}
              onClick={() => updateFormData({ handleType: Number(key) })}
              className={cn(
                "p-4 rounded-lg border cursor-pointer transition-colors",
                formData.handleType === Number(key)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/50 hover:bg-secondary"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {key === "0" ? "数据存储在本地系统" : "数据上报至上级系统"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {formData.handleType === 1 && (
        <>
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
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
                    formData.reportType === Number(key)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/50 hover:bg-secondary"
                  )}
                >
                  <div className="font-medium text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {formData.reportType === 1 && (
            <div className="space-y-2 p-4 rounded-lg bg-secondary/30">
              <Label className="flex items-center gap-2">
                数据上报频次 <span className="text-destructive">*</span>
                <FieldTooltip content="定时报送时必填，选择上报的时间间隔" />
              </Label>
              <Select 
                value={String(formData.reportCycle)} 
                onValueChange={(v) => updateFormData({ reportCycle: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-0 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ReportCycle).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ==================== 步骤4: 指令场景配置 ====================
function StepCommandScene({ formData, updateFormData }: { formData: typeof initialFormData; updateFormData: (updates: Partial<typeof initialFormData>) => void }) {
  const sceneConstraint = getDataOutputMethodByScene(formData.commandScene)
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          指令场景 <span className="text-destructive">*</span>
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
                  formData.commandScene === Number(key)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/50 hover:bg-secondary"
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
      </div>

      {sceneConstraint?.fixed && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-500">场景约束提示</p>
            <p className="text-muted-foreground">
              当前场景下，数据输出方式已自动设置为 "{DataOutputMethod[sceneConstraint.value as keyof typeof DataOutputMethod]}"
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <Label className="flex items-center gap-2">
              开启动态流量获取统计功能
              <FieldTooltip content="开启后只输出动态流量获取统计日志，不执行实际转发动作" />
            </Label>
            <p className="text-xs text-muted-foreground mt-1">默认为不统计</p>
          </div>
          <Switch
            checked={formData.onlyCount === 1}
            onCheckedChange={(checked) => updateFormData({ onlyCount: checked ? 1 : 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            统计数据上报频次 <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={String(formData.countReportCycle)} 
            onValueChange={(v) => updateFormData({ countReportCycle: Number(v) })}
          >
            <SelectTrigger className="bg-secondary border-0 max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CountReportCycle).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ==================== 步骤5: 数据输出配置 ====================
function StepDataOutput({ formData, updateFormData }: { formData: typeof initialFormData; updateFormData: (updates: Partial<typeof initialFormData>) => void }) {
  const sceneConstraint = getDataOutputMethodByScene(formData.commandScene)
  const isOutputMethodLocked = sceneConstraint?.fixed

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          数据输出方式
          {isOutputMethodLocked && <Badge variant="secondary" className="text-xs">由场景约束</Badge>}
        </Label>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(DataOutputMethod).map(([key, label]) => (
            <div
              key={key}
              onClick={() => !isOutputMethodLocked && updateFormData({ dataOutputMethod: Number(key) })}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                formData.dataOutputMethod === Number(key)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/50",
                isOutputMethodLocked && formData.dataOutputMethod !== Number(key)
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-secondary"
              )}
            >
              <div className="font-medium text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 轮巡输出参数 */}
      {formData.dataOutputMethod === 4 && (
        <Card className="bg-secondary/30 border-border">
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
                <Input
                  type="number"
                  value={formData.pollingInterval}
                  onChange={(e) => updateFormData({ pollingInterval: Number(e.target.value) })}
                  className="bg-secondary border-0"
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  轮巡周期 <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={String(formData.pollingCycle)} 
                  onValueChange={(v) => updateFormData({ pollingCycle: Number(v) })}
                >
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PollingCycle).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
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
        <Card className="bg-secondary/30 border-border">
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
              <Select 
                value={String(formData.packageNValue)} 
                onValueChange={(v) => updateFormData({ packageNValue: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-0 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PackageNValues.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 单包前N字节参数 */}
      {formData.dataOutputMethod === 3 && (
        <Card className="bg-secondary/30 border-border">
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
              <Input
                type="number"
                value={formData.byteNValue}
                onChange={(e) => updateFormData({ byteNValue: Number(e.target.value) })}
                className="bg-secondary border-0 max-w-xs"
                min={64}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==================== 步骤6: 规则配置 ====================
function StepRuleConfig({ formData, updateFormData }: { formData: typeof initialFormData; updateFormData: (updates: Partial<typeof initialFormData>) => void }) {
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
    updateFormData({ rules: formData.rules.filter(r => r.id !== ruleId) })
    if (expandedRule === ruleId) setExpandedRule(null)
  }

  const updateRule = (ruleId: string, updates: Partial<typeof formData.rules[0]>) => {
    updateFormData({
      rules: formData.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            已添加 {formData.rules.length} 条规则，点击规则卡片展开编辑
          </p>
        </div>
        <Button onClick={addRule}>
          <Plus className="h-4 w-4 mr-2" />
          添加规则
        </Button>
      </div>

      {formData.rules.length === 0 && (
        <Card className="bg-secondary/30 border-dashed border-2">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">暂无规则，请添加至少一条筛选规则</p>
            <Button variant="outline" onClick={addRule}>
              <Plus className="h-4 w-4 mr-2" />
              添加第一条规则
            </Button>
          </CardContent>
        </Card>
      )}

      {formData.rules.map((rule, index) => (
        <Card key={rule.id} className="bg-card border-border">
          <CardHeader 
            className="cursor-pointer" 
            onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{index + 1}</Badge>
                <div>
                  <CardTitle className="text-sm">{rule.ruleAlias || "未命名规则"}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {rule.trafficReportType.length > 0 
                      ? rule.trafficReportType.map(t => TrafficReportType[Number(t) as keyof typeof TrafficReportType]).join("、")
                      : "未配置流量发送方式"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={(e) => { e.stopPropagation(); removeRule(rule.id) }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {expandedRule === rule.id && (
            <CardContent className="border-t border-border pt-4">
              <RuleEditor 
                rule={rule} 
                formData={formData}
                onUpdate={(updates) => updateRule(rule.id, updates)} 
              />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

// 规则编辑器组件
function RuleEditor({ 
  rule, 
  formData,
  onUpdate 
}: { 
  rule: typeof initialFormData.rules[0]
  formData: typeof initialFormData
  onUpdate: (updates: Partial<typeof rule>) => void 
}) {
  const toggleTrafficReportType = (type: string) => {
    const types = rule.trafficReportType.includes(type)
      ? rule.trafficReportType.filter(t => t !== type)
      : [...rule.trafficReportType, type]
    onUpdate({ trafficReportType: types })
  }

  const toggleOutputType = (type: string) => {
    const types = rule.outputType.includes(type)
      ? rule.outputType.filter(t => t !== type)
      : [...rule.outputType, type]
    onUpdate({ outputType: types })
  }

  // 判断是否需要显示特定字段
  const needStorageAmount = rule.trafficReportType.some(t => ["2", "4"].includes(t))
  const needOutputType = rule.trafficReportType.some(t => ["3", "5"].includes(t))
  const needNetflowSampling = rule.trafficReportType.includes("5")
  const needTrafficSampling = formData.dataOutputMethod !== 4 && formData.dataOutputMethod !== 5
  const needPollingSampling = formData.dataOutputMethod === 4
  const needPackageNSampling = formData.dataOutputMethod === 5
  
  // 流量用途选项限制
  const outputTypeOptions = rule.trafficReportType.includes("5") 
    ? { 1: "协议元数据", 5: "流日志" }
    : OutputType

  // 添加规则内容
  const addRuleInfo = (ruleType: number) => {
    const newRuleInfo: RuleInfo = { ruleType }
    onUpdate({ ruleInfo: [...rule.ruleInfo, newRuleInfo] })
  }

  const removeRuleInfo = (index: number) => {
    onUpdate({ ruleInfo: rule.ruleInfo.filter((_, i) => i !== index) })
  }

  const updateRuleInfo = (index: number, updates: Partial<RuleInfo>) => {
    onUpdate({
      ruleInfo: rule.ruleInfo.map((info, i) => i === index ? { ...info, ...updates } : info)
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            规则别名 <span className="text-destructive">*</span>
            <FieldTooltip content="规则的描述性名称，如针对***专项" />
          </Label>
          <Input
            placeholder="请输入规则别名"
            value={rule.ruleAlias}
            onChange={(e) => onUpdate({ ruleAlias: e.target.value })}
            className="bg-secondary border-0"
          />
        </div>
        <div className="space-y-2">
          <Label>规则编号</Label>
          <Input
            value={rule.ruleId}
            disabled
            className="bg-secondary border-0 font-mono"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            起始时间 <span className="text-destructive">*</span>
          </Label>
          <Input
            type="datetime-local"
            value={rule.startTime.replace(" ", "T")}
            onChange={(e) => onUpdate({ startTime: e.target.value.replace("T", " ") })}
            className="bg-secondary border-0"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            终止时间 <span className="text-destructive">*</span>
          </Label>
          <Input
            type="datetime-local"
            value={rule.endTime.replace(" ", "T")}
            onChange={(e) => onUpdate({ endTime: e.target.value.replace("T", " ") })}
            className="bg-secondary border-0"
          />
        </div>
      </div>

      {/* 流量发送方式 */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          流量发送方式 <span className="text-destructive">*</span>
          <FieldTooltip content="可多选，多种方式用逗号分隔" />
        </Label>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(TrafficReportType).map(([key, label]) => (
            <div
              key={key}
              onClick={() => toggleTrafficReportType(key)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                rule.trafficReportType.includes(key)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-secondary/50 hover:bg-secondary"
              )}
            >
              <Checkbox checked={rule.trafficReportType.includes(key)} />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PCAP相关参数 */}
      {needStorageAmount && (
        <Card className="bg-secondary/20 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PCAP参数配置</CardTitle>
            <CardDescription>当流量发送方式包含PCAP文件时必填</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  流量总量(MB) <span className="text-destructive">*</span>
                  <FieldTooltip content="系统筛选流量的总大小，为空则持续采集" />
                </Label>
                <Input
                  type="number"
                  placeholder="留空表示持续采集"
                  value={rule.storageAmount || ""}
                  onChange={(e) => onUpdate({ storageAmount: e.target.value ? Number(e.target.value) : undefined })}
                  className="bg-secondary border-0"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  PCAP文件存储时长 <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={String(rule.saveTime)} 
                  onValueChange={(v) => onUpdate({ saveTime: Number(v) })}
                >
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SaveTime).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 筛选后流量用途 */}
      {needOutputType && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            筛选后流量用途 <span className="text-destructive">*</span>
            <FieldTooltip content={rule.trafficReportType.includes("5") ? "生成网络行为日志时只能选择协议元数据或流日志" : "可多选"} />
          </Label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(outputTypeOptions).map(([key, label]) => (
              <Badge
                key={key}
                variant={rule.outputType.includes(key) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleOutputType(key)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 前N包缓存 */}
      <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
        <div className="flex items-center justify-between">
          <div>
            <Label className="flex items-center gap-2">
              前N包缓存
              <FieldTooltip content="开启后需要配置缓存N值，默认为8" />
            </Label>
            <p className="text-xs text-muted-foreground mt-1">缺省为关闭</p>
          </div>
          <Switch
            checked={rule.firstNBuffer === "1"}
            onCheckedChange={(checked) => onUpdate({ firstNBuffer: checked ? "1" : "0" })}
          />
        </div>
        
        {rule.firstNBuffer === "1" && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              缓存前N包N值 <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={rule.nBuffer}
              onChange={(e) => onUpdate({ nBuffer: Number(e.target.value) })}
              className="bg-secondary border-0 max-w-xs"
              min={1}
            />
          </div>
        )}
      </div>

      {/* 采样比配置 */}
      <Card className="bg-secondary/20 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">采样比配置</CardTitle>
          <CardDescription>根据数据输出方式自动显示对应采样比选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {needTrafficSampling && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                筛选流量采样比 <span className="text-destructive">*</span>
                <FieldTooltip content="当数据输出方式非轮巡、非前N包时必填" />
              </Label>
              <Select 
                value={String(rule.trafficSamplingRatio)} 
                onValueChange={(v) => onUpdate({ trafficSamplingRatio: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-0 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TrafficSamplingRatio).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needPollingSampling && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                轮巡流量采样比
                <FieldTooltip content="仅当数据输出方式为轮巡时可选" />
              </Label>
              <Select 
                value={String(rule.pollingSamplingRatio || "")} 
                onValueChange={(v) => onUpdate({ pollingSamplingRatio: v ? Number(v) : undefined })}
              >
                <SelectTrigger className="bg-secondary border-0 max-w-xs">
                  <SelectValue placeholder="选择采样比（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不设置</SelectItem>
                  {Object.entries(PollingSamplingRatio).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needPackageNSampling && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                前N包输出采样比
                <FieldTooltip content="仅当数据输出方式为前N包输出时可选" />
              </Label>
              <Select 
                value={String(rule.packageNSamplingRatio || "")} 
                onValueChange={(v) => onUpdate({ packageNSamplingRatio: v ? Number(v) : undefined })}
              >
                <SelectTrigger className="bg-secondary border-0 max-w-xs">
                  <SelectValue placeholder="选择采样比（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">不设置</SelectItem>
                  {Object.entries(PollingSamplingRatio).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {needNetflowSampling && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                流日志采样比 <span className="text-destructive">*</span>
                <FieldTooltip content="当流量发送方式包含生成网络行为日志时必填" />
              </Label>
              <Select 
                value={String(rule.netflowSamplingRatio)} 
                onValueChange={(v) => onUpdate({ netflowSamplingRatio: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-0 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NetflowSamplingRatio).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 规则内容配置 */}
      <Card className="bg-secondary/20 border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">规则内容 (ruleInfo)</CardTitle>
              <CardDescription>配置具体的匹配规则，支持组合规则</CardDescription>
            </div>
            <Select onValueChange={(v) => addRuleInfo(Number(v))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="添加规则类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RuleType).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rule.ruleInfo.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无规则内容，请从上方下拉框添加规则类型
            </div>
          ) : (
            rule.ruleInfo.map((info, index) => (
              <RuleInfoEditor 
                key={index}
                index={index}
                ruleInfo={info}
                onUpdate={(updates) => updateRuleInfo(index, updates)}
                onRemove={() => removeRuleInfo(index)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 规则内容编辑器
function RuleInfoEditor({
  index,
  ruleInfo,
  onUpdate,
  onRemove
}: {
  index: number
  ruleInfo: RuleInfo
  onUpdate: (updates: Partial<RuleInfo>) => void
  onRemove: () => void
}) {
  const requiredFields = getRuleRequiredFields(ruleInfo.ruleType)
  const ruleTypeName = RuleType[ruleInfo.ruleType as keyof typeof RuleType]

  return (
    <Card className="bg-card border-border">
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
        {/* 五元组规则 */}
        {(ruleInfo.ruleType === 1 || ruleInfo.ruleType === 2) && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>源IP</Label>
              <Input
                placeholder="例: 192.168.1.1"
                value={ruleInfo.srcIp || ""}
                onChange={(e) => onUpdate({ srcIp: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
            {ruleInfo.ruleType === 2 && (
              <div className="space-y-2">
                <Label>源IP掩码</Label>
                <Input
                  placeholder="例: 255.255.255.0 或 /24"
                  value={ruleInfo.srcIpMask || ""}
                  onChange={(e) => onUpdate({ srcIpMask: e.target.value })}
                  className="bg-secondary border-0"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>目的IP</Label>
              <Input
                placeholder="例: 10.0.0.1"
                value={ruleInfo.dstIp || ""}
                onChange={(e) => onUpdate({ dstIp: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
            {ruleInfo.ruleType === 2 && (
              <div className="space-y-2">
                <Label>目的IP掩码</Label>
                <Input
                  placeholder="例: 255.255.255.0 或 /24"
                  value={ruleInfo.dstIpMask || ""}
                  onChange={(e) => onUpdate({ dstIpMask: e.target.value })}
                  className="bg-secondary border-0"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>源端口</Label>
              <Input
                placeholder="例: 80"
                value={ruleInfo.srcPort || ""}
                onChange={(e) => onUpdate({ srcPort: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label>目的端口</Label>
              <Input
                placeholder="例: 443"
                value={ruleInfo.dstPort || ""}
                onChange={(e) => onUpdate({ dstPort: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label>传输层协议</Label>
              <Select 
                value={String(ruleInfo.protocolType || "")} 
                onValueChange={(v) => onUpdate({ protocolType: v ? Number(v) : undefined })}
              >
                <SelectTrigger className="bg-secondary border-0">
                  <SelectValue placeholder="选择协议" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TransportProtocols).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* CS规则 */}
        {ruleInfo.ruleType === 7 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                客户端IP <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="客户端IP地址"
                value={ruleInfo.clientIp || ""}
                onChange={(e) => onUpdate({ clientIp: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                服务端IP <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="服务端IP地址"
                value={ruleInfo.serverIp || ""}
                onChange={(e) => onUpdate({ serverIp: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                服务端口 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="服务端口"
                value={ruleInfo.serverPort || ""}
                onChange={(e) => onUpdate({ serverPort: e.target.value })}
                className="bg-secondary border-0"
              />
            </div>
          </div>
        )}

        {/* Host规则 */}
        {ruleInfo.ruleType === 8 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Host <span className="text-destructive">*</span>
              <FieldTooltip content="支持通配符，如 *.baidu.com" />
            </Label>
            <Input
              placeholder="例: *.baidu.com"
              value={ruleInfo.host || ""}
              onChange={(e) => onUpdate({ host: e.target.value })}
              className="bg-secondary border-0"
            />
          </div>
        )}

        {/* SNI规则 */}
        {ruleInfo.ruleType === 9 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              SNI <span className="text-destructive">*</span>
              <FieldTooltip content="HTTPS报文中的SNI，支持通配符" />
            </Label>
            <Input
              placeholder="例: *.example.com"
              value={ruleInfo.sni || ""}
              onChange={(e) => onUpdate({ sni: e.target.value })}
              className="bg-secondary border-0"
            />
          </div>
        )}

        {/* URL规则 */}
        {ruleInfo.ruleType === 10 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              URL <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="输入URL"
              value={ruleInfo.url || ""}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="bg-secondary border-0"
            />
          </div>
        )}

        {/* 应用协议规则 */}
        {ruleInfo.ruleType === 11 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              应用层协议类型 <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={String(ruleInfo.applicationProtocol || "")} 
              onValueChange={(v) => onUpdate({ applicationProtocol: Number(v) })}
            >
              <SelectTrigger className="bg-secondary border-0 max-w-xs">
                <SelectValue placeholder="选择应用协议" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ApplicationProtocols).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 特征码规则 */}
        {(ruleInfo.ruleType === 3 || ruleInfo.ruleType === 4 || ruleInfo.ruleType === 6) && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  特征码 <span className="text-destructive">*</span>
                  <FieldTooltip content="十六进制值组成的字符串，长度3-32字节" />
                </Label>
                <Textarea
                  placeholder="例: 48 54 54 50"
                  value={ruleInfo.udValue || ""}
                  onChange={(e) => onUpdate({ udValue: e.target.value })}
                  className="bg-secondary border-0 font-mono"
                />
              </div>
              {ruleInfo.ruleType === 3 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    偏移量 <span className="text-destructive">*</span>
                    <FieldTooltip content="取值范围[0, 包长-1]" />
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={ruleInfo.offset || ""}
                    onChange={(e) => onUpdate({ offset: Number(e.target.value) })}
                    className="bg-secondary border-0"
                    min={0}
                  />
                </div>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>特征码匹配模式</Label>
                <Select 
                  value={String(ruleInfo.udValueMatchMode || 0)} 
                  onValueChange={(v) => onUpdate({ udValueMatchMode: Number(v) })}
                >
                  <SelectTrigger className="bg-secondary border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UdValueMatchMode).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {ruleInfo.ruleType === 3 && (
                <div className="space-y-2">
                  <Label>跨包匹配标识</Label>
                  <Select 
                    value={String(ruleInfo.crossPkgMatch || 0)} 
                    onValueChange={(v) => onUpdate({ crossPkgMatch: Number(v) })}
                  >
                    <SelectTrigger className="bg-secondary border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CrossPkgMatch).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 无规则 */}
        {ruleInfo.ruleType === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            无规则：匹配全部流量
          </div>
        )}

        {/* 通用可选字段：隧道匹配方式 */}
        {(ruleInfo.ruleType === 1 || ruleInfo.ruleType === 2) && (
          <div className="space-y-2">
            <Label>隧道协议匹配方式</Label>
            <Select 
              value={String(ruleInfo.tunnelMatchType || 0)} 
              onValueChange={(v) => onUpdate({ tunnelMatchType: Number(v) })}
            >
              <SelectTrigger className="bg-secondary border-0 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TunnelMatchType).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== 步骤7: 校验发布 ====================
function StepReview({ formData }: { formData: typeof initialFormData }) {
  return (
    <div className="space-y-6">
      {/* 校验结果 */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <Check className="h-5 w-5 text-green-500 mt-0.5" />
        <div>
          <p className="font-medium text-green-500">指令校验通过</p>
          <p className="text-sm text-muted-foreground">所有必填字段已完成，指令配置有效</p>
        </div>
      </div>

      {/* 指令摘要 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-secondary/30 border-border">
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

        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">指令对象</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">运营商</span>
              <span>{OperatorCodes[formData.comCode as keyof typeof OperatorCodes] || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">生效系统</span>
              <span>{formData.effectSystem.map(s => SystemType[Number(s) as keyof typeof SystemType]).join("、")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">生效省份</span>
              <span>{formData.effectProvince.length} 个</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">指令场景配置</CardTitle>
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
              <span className="text-muted-foreground">统计功能</span>
              <span>{formData.onlyCount === 1 ? "开启" : "关闭"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">规则配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">规则数量</span>
              <span>{formData.rules.length} 条</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">规则内容总数</span>
              <span>{formData.rules.reduce((acc, r) => acc + r.ruleInfo.length, 0)} 个</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 规则列表 */}
      {formData.rules.length > 0 && (
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">规则列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rule.ruleAlias}</div>
                    <div className="text-xs text-muted-foreground">
                      {rule.trafficReportType.map(t => TrafficReportType[Number(t) as keyof typeof TrafficReportType]).join("、")}
                      {" | "}
                      {rule.ruleInfo.length} 个规则内容
                      {" | "}
                      {rule.startTime} ~ {rule.endTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 关联反馈数据项 */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">关联指令反馈数据项</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            <div className="p-2 rounded bg-secondary/50">A.13.3 公共互联网前N包结果数据上报</div>
            <div className="p-2 rounded bg-secondary/50">A.13.4 公共互联网DNS安全监测结果数据上报</div>
            <div className="p-2 rounded bg-secondary/50">B.2.4 公共互联网流日志上报</div>
            <div className="p-2 rounded bg-secondary/50">B.11.1 公共互联网网络应用和协议元数据监测上报</div>
            <div className="p-2 rounded bg-secondary/50">C.1.13 公共互联网动态筛选流量PCAP记录上报</div>
            <div className="p-2 rounded bg-secondary/50">F.1.51 公共互联网动态流量获取统计信息反馈</div>
          </div>
        </CardContent>
      </Card>
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
