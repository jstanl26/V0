// F.1.35 公共互联网动态流量获取指令 - 类型定义

// ==================== 枚举定义 ====================

// 指令来源
export const CommandSource = {
  1: "部级电信主管部门",
  2: "省级电信主管部门",
  3: "运营商集团",
  9: "其他",
} as const

// 下发/生效系统
export const SystemType = {
  1: "移动互联网",
  2: "公共互联网",
  3: "态势感知",
  4: "物联网",
  5: "IDC",
  9: "其他",
} as const

// 操作类型
export const OperationType = {
  0: "新增指令",
  1: "删除指令",
} as const

// 指令优先级
export const CommandLevel = {
  1: "高",
  2: "中",
  3: "低",
} as const

// 指令执行结果处理方式
export const HandleType = {
  0: "本地存放",
  1: "数据上报",
} as const

// 数据上报方式
export const ReportType = {
  0: "实时报送",
  1: "定时报送",
  2: "一次性报送",
} as const

// 数据上报频次
export const ReportCycle = {
  1: "5分钟",
  2: "30分钟",
  3: "1小时",
  4: "日",
  5: "周",
  6: "月",
} as const

// 指令场景
export const CommandScene = {
  0: "获取网安规则监测流量",
  1: "获取精细化监测流量",
  2: "获取前N包监测流量",
} as const

// 统计功能
export const OnlyCount = {
  0: "不统计",
  1: "统计",
} as const

// 统计数据上报频次
export const CountReportCycle = {
  0: "5分钟",
  1: "10分钟",
  2: "30分钟",
  3: "1小时",
} as const

// 数据输出方式
export const DataOutputMethod = {
  0: "双向数据流输出",
  1: "客户端发送请求方向的数据包输出",
  2: "服务端返回方向的数据包输出",
  3: "匹配规则的单个数据包数据输出",
  4: "轮巡输出",
  5: "前N包输出",
} as const

// 轮巡周期
export const PollingCycle = {
  0: "7天",
  1: "10天",
  2: "14天",
} as const

// 前N包N值选项
export const PackageNValues = [4, 8, 16, 32] as const

// 用户类型
export const UserType = {
  1: "国家侧用户",
  2: "集团用户",
  3: "自定义应用-**分析",
  4: "自定义应用-**分析",
} as const

// 流量发送方式
export const TrafficReportType = {
  1: "原始流量发送至国家侧",
  2: "PCAP文件发送至国家侧",
  3: "流量发送至企业侧监测设备",
  4: "PCAP文件留存至本地",
  5: "生成网络行为日志",
} as const

// PCAP文件存储时长
export const SaveTime = {
  1: "1天",
  2: "7天",
  3: "15天",
  4: "30天",
  5: "90天",
  6: "180天",
} as const

// 筛选后流量用途
export const OutputType = {
  1: "协议元数据",
  2: "加密流量监测",
  3: "特定应用监测",
  4: "全流量监测",
  5: "流日志",
  6: "前N包监测",
  7: "网安规则监测",
  99: "其他",
} as const

// 筛选流量采样比
export const TrafficSamplingRatio = {
  0: "全量",
  1: "2:1",
  2: "10:1",
  3: "100:1",
  4: "500:1",
  5: "1000:1",
  6: "2000:1",
  7: "3000:1",
  8: "5000:1",
  9: "10000:1",
} as const

// 轮巡/前N包流量采样比（不含全量）
export const PollingSamplingRatio = {
  1: "2:1",
  2: "10:1",
  3: "100:1",
  4: "500:1",
  5: "1000:1",
  6: "2000:1",
  7: "3000:1",
  8: "5000:1",
  9: "10000:1",
} as const

// 流日志采样比
export const NetflowSamplingRatio = {
  1: "1:1",
  2: "10:1",
  3: "100:1",
  4: "1000:1",
  5: "5000:1",
  6: "10000:1",
} as const

// 规则类型
export const RuleType = {
  0: "无规则",
  1: "灵活五元组规则",
  2: "掩码五元组规则",
  3: "固定位置特征码规则",
  4: "全包浮动位置特征码规则",
  5: "掩码五元组+固定位置特征码规则",
  6: "窗口范围浮动特征码规则",
  7: "灵活CS(Client/Server)规则",
  8: "Host规则",
  9: "SNI规则",
  10: "URL规则",
  11: "应用协议规则",
} as const

// 隧道协议匹配方式
export const TunnelMatchType = {
  0: "内层匹配",
  1: "外层匹配",
} as const

// 特征码匹配模式
export const UdValueMatchMode = {
  0: "不区分字母大小写",
  1: "区分字母大小写",
} as const

// 跨包匹配标识
export const CrossPkgMatch = {
  0: "单包匹配",
  1: "跨包匹配",
} as const

// 前N包缓存
export const FirstNBuffer = {
  0: "关闭前N包缓存",
  1: "开启前N包缓存",
} as const

// ==================== 接口定义 ====================

// 规则内容 (ruleInfo)
export interface RuleInfo {
  ruleType: number // 规则类型 0-11
  srcIp?: string // 源IP
  srcIpMask?: string // 源IP掩码
  dstIp?: string // 目的IP
  dstIpMask?: string // 目的IP掩码
  srcPort?: string // 源端口
  srcPortMask?: string // 源端口掩码
  dstPort?: string // 目的端口
  dstPortMask?: string // 目的端口掩码
  clientIp?: string // 客户端IP
  serverIp?: string // 服务端IP
  serverPort?: string // 服务端口
  tunnelMatchType?: number // 隧道协议匹配方式
  url?: string // URL
  protocolType?: number // 传输层协议类型
  udValue?: string // 特征码
  offset?: number // 特征码偏移量
  udValueMatchMode?: number // 特征码匹配模式
  crossPkgMatch?: number // 跨包匹配标识
  applicationProtocol?: number // 应用层协议类型
  host?: string // Host
  sni?: string // SNI
  tcpFlags?: string // TCP标记位
  tcpPayloadLen?: string // 传输层载荷长度范围
  qosFlags?: string // Qos标记特征
  mplsFlags?: string // MPLS标签特征
  vlanFlags?: string // VLAN标签特征
  vxlanFlags?: string // VXLAN标签特征
}

// 指令规则 (rule)
export interface CommandRule {
  ruleId: number // 规则编号
  ruleAlias: string // 规则别名
  userType?: number // 用户类型
  firstNBuffer?: string // 前N包缓存
  nBuffer?: number // 缓存前N包N值
  trafficReportType: string // 流量发送方式，多选用逗号分隔
  storageAmount?: number // 流量总量(MB)
  saveTime?: number // PCAP文件存储时长
  outputType?: string // 筛选后流量用途，多选用逗号分隔
  ruleInfo: RuleInfo[] // 规则内容数组
  trafficSamplingRatio?: number // 筛选流量采样比
  pollingSamplingRatio?: number // 轮巡流量采样比
  packageNSamplingRatio?: number // 前N包输出采样比
  netflowSamplingRatio?: number // 流日志采样比
  startTime: string // 起始时间 yyyy-MM-dd HH:mm:ss
  endTime: string // 终止时间 yyyy-MM-dd HH:mm:ss
}

// 指令内容 (commandRule)
export interface CommandRuleConfig {
  commandType: string // 指令类型
  commandScene: number // 指令场景 0/1/2
  onlyCount: number // 开启动态流量获取统计功能 0/1
  countReportCycle: number // 统计数据上报频次
  dataOutputMethod?: number // 数据输出方式
  pollingInterval?: number // 轮巡间隔（小时）
  pollingCycle?: number // 轮巡周期
  packageNValue?: number // 前N包输出N值
  byteNValue?: number // 单包前N个字节输出N值
  rule: CommandRule[] // 指令规则数组
}

// 指令执行结果 (commandResult)
export interface CommandResult {
  handleType: number // 指令执行结果处理方式 0/1
  reportType?: number // 数据上报方式
  reportCycle?: number // 数据上报频次
}

// 指令对象 (commandObject)
export interface CommandObject {
  effectSystem: string // 生效系统，多选用逗号分隔
  comCode: string // 运营商代码
  effectVendor?: string // 生效厂商
  effectProvince: string // 生效省份，多选用逗号分隔
  effectHouse?: string // 生效机房
}

// 指令基本信息 (commandInfo)
export interface CommandInfo {
  commandSource: number // 指令来源
  sourceSystem: string // 下发系统
  version: string // 版本号
  commandId: number // 管理指令ID
  operationType: number // 操作类型
  level: number // 指令优先级
  owner: string // 指令属主
  createTime: string // 指令生成时间
}

// 完整指令数据结构
export interface DynamicTrafficCommand {
  commandInfo: CommandInfo
  commandObject: CommandObject
  commandResult: CommandResult
  commandRule: CommandRuleConfig
}

// ==================== 字段关联关系验证 ====================

// 根据指令场景获取数据输出方式的限制
export function getDataOutputMethodByScene(commandScene: number): { value: number; fixed: boolean } | null {
  switch (commandScene) {
    case 0: // 网安规则监测流量
      return { value: 4, fixed: true } // 必须为轮巡输出
    case 2: // 前N包监测流量
      return { value: 5, fixed: true } // 必须为前N包输出
    default:
      return null // 可自由选择
  }
}

// 获取必填字段列表
export function getRequiredFieldsByContext(context: {
  handleType?: number
  reportType?: number
  dataOutputMethod?: number
  trafficReportType?: string
  ruleType?: number
  firstNBuffer?: string
}): string[] {
  const required: string[] = []

  // 数据上报时，定时报送需要上报频次
  if (context.handleType === 1 && context.reportType === 1) {
    required.push("reportCycle")
  }

  // 数据输出方式关联字段
  if (context.dataOutputMethod === 4) {
    required.push("pollingInterval", "pollingCycle")
  } else if (context.dataOutputMethod === 5) {
    required.push("packageNValue")
  } else if (context.dataOutputMethod === 3) {
    required.push("byteNValue")
  }

  // 流量发送方式关联字段
  const trafficTypes = context.trafficReportType?.split(",").map(Number) || []
  if (trafficTypes.includes(2) || trafficTypes.includes(4)) {
    required.push("storageAmount", "saveTime")
  }
  if (trafficTypes.includes(3) || trafficTypes.includes(5)) {
    required.push("outputType")
  }

  // 前N包缓存关联
  if (context.firstNBuffer === "1") {
    required.push("nBuffer")
  }

  // 采样比关联
  if (context.dataOutputMethod !== 4 && context.dataOutputMethod !== 5) {
    required.push("trafficSamplingRatio")
  }
  if (trafficTypes.includes(5)) {
    required.push("netflowSamplingRatio")
  }

  return required
}

// 获取规则类型的必填字段
export function getRuleRequiredFields(ruleType: number): string[] {
  switch (ruleType) {
    case 1: // 灵活五元组
    case 2: // 掩码五元组
      return [] // 至少一项：srcIp/srcPort/dstIp/dstPort/protocolType
    case 3: // 固定位置特征码
      return ["udValue", "offset"]
    case 4: // 全包浮动位置特征码
    case 6: // 窗口范围浮动特征码
      return ["udValue"]
    case 7: // 灵活CS规则
      return ["clientIp", "serverIp", "serverPort"]
    case 8: // Host规则
      return ["host"]
    case 9: // SNI规则
      return ["sni"]
    case 10: // URL规则
      return ["url"]
    case 11: // 应用协议规则
      return ["applicationProtocol"]
    default:
      return []
  }
}

// 验证五元组规则至少有一个字段
export function validateTupleRule(ruleInfo: RuleInfo): boolean {
  if (ruleInfo.ruleType !== 1 && ruleInfo.ruleType !== 2) return true
  return !!(
    ruleInfo.srcIp ||
    ruleInfo.srcPort ||
    ruleInfo.dstIp ||
    ruleInfo.dstPort ||
    ruleInfo.protocolType
  )
}

// 获取筛选后流量用途的限制选项
export function getOutputTypeOptions(trafficReportType: string): number[] {
  const types = trafficReportType.split(",").map(Number)
  // 当流量发送方式为5（生成网络行为日志）时，流量用途只能为1或5
  if (types.includes(5)) {
    return [1, 5]
  }
  return [1, 2, 3, 4, 5, 6, 7, 99]
}

// ==================== 运营商代码表 ====================
export const OperatorCodes = {
  "0010": "中国电信",
  "0011": "中国移动",
  "0013": "中国联通",
  "0015": "中国广电",
} as const

// ==================== 省份代码表 ====================
export const ProvinceCodes = {
  "110000": "北京市",
  "120000": "天津市",
  "130000": "河北省",
  "140000": "山西省",
  "150000": "内蒙古自治区",
  "210000": "辽宁省",
  "220000": "吉林省",
  "230000": "黑龙江省",
  "310000": "上海市",
  "320000": "江苏省",
  "330000": "浙江省",
  "340000": "安徽省",
  "350000": "福建省",
  "360000": "江西省",
  "370000": "山东省",
  "410000": "河南省",
  "420000": "湖北省",
  "430000": "湖南省",
  "440000": "广东省",
  "450000": "广西壮族自治区",
  "460000": "海南省",
  "500000": "重庆市",
  "510000": "四川省",
  "520000": "贵州省",
  "530000": "云南省",
  "540000": "西藏自治区",
  "610000": "陕西省",
  "620000": "甘肃省",
  "630000": "青海省",
  "640000": "宁夏回族自治区",
  "650000": "新疆维吾尔自治区",
} as const

// ==================== 传输层协议类型 ====================
export const TransportProtocols = {
  6: "TCP",
  17: "UDP",
  132: "SCTP",
  1: "ICMP",
  58: "ICMPv6",
} as const

// ==================== 应用层协议类型 ====================
export const ApplicationProtocols = {
  1: "HTTP",
  2: "HTTPS",
  3: "DNS",
  4: "FTP",
  5: "SMTP",
  6: "POP3",
  7: "IMAP",
  8: "SSH",
  9: "TELNET",
  10: "RTSP",
  11: "SIP",
  12: "MQTT",
  99: "其他",
} as const
