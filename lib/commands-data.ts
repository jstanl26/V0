// 共享指令数据 - 用于指令管理列表与流量统计模块
// owner 字段用于按当前登录用户做数据隔离
// listType: "platform" 指令平台下发, "local" 本平台配置

export interface CommandRecord {
  commandId: number
  listType: "platform" | "local"
  commandSource: number
  level: number
  owner: string // 关联用户 username
  createTime: string
  operationType: number
  comCode: string
  effectProvince: string[]
  commandScene: number
  dataOutputMethod: number
  rulesCount: number
  ruleTypes: number[]
  status: "running" | "paused" | "error" | "completed"
  // 流量统计指标
  reportStatus: "success" | "pending" | "failed"
  reportFreq: number // 上报频次（次/天）
  peakTraffic: number // 峰值流量 Gbps
  totalTraffic: number // 总流量 TB
  totalPackets: number // 总包数 亿
  hitTraffic: number // 命中流量 Gbps
}

export const commandsData: CommandRecord[] = [
  {
    commandId: 10001,
    listType: "platform",
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
    ruleTypes: [1, 8],
    status: "running",
    reportStatus: "success",
    reportFreq: 288,
    peakTraffic: 12.5,
    totalTraffic: 45.2,
    totalPackets: 320,
    hitTraffic: 12.5,
  },
  {
    commandId: 10002,
    listType: "platform",
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
    ruleTypes: [9, 3],
    status: "running",
    reportStatus: "success",
    reportFreq: 48,
    peakTraffic: 8.2,
    totalTraffic: 28.7,
    totalPackets: 198,
    hitTraffic: 8.2,
  },
  {
    commandId: 10003,
    listType: "platform",
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
    ruleTypes: [11],
    status: "running",
    reportStatus: "success",
    reportFreq: 24,
    peakTraffic: 5.6,
    totalTraffic: 18.3,
    totalPackets: 142,
    hitTraffic: 5.6,
  },
  {
    commandId: 10004,
    listType: "local",
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
    ruleTypes: [10, 3],
    status: "paused",
    reportStatus: "pending",
    reportFreq: 0,
    peakTraffic: 0,
    totalTraffic: 12.1,
    totalPackets: 88,
    hitTraffic: 0,
  },
  {
    commandId: 10005,
    listType: "local",
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
    ruleTypes: [0],
    status: "running",
    reportStatus: "success",
    reportFreq: 24,
    peakTraffic: 3.2,
    totalTraffic: 9.8,
    totalPackets: 64,
    hitTraffic: 3.2,
  },
  {
    commandId: 10006,
    listType: "local",
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
    ruleTypes: [7, 9],
    status: "error",
    reportStatus: "failed",
    reportFreq: 0,
    peakTraffic: 0,
    totalTraffic: 5.4,
    totalPackets: 41,
    hitTraffic: 0,
  },
  {
    commandId: 10007,
    listType: "platform",
    commandSource: 2,
    level: 2,
    owner: "operator1",
    createTime: "2024-01-14 10:30:45",
    operationType: 0,
    comCode: "0013",
    effectProvince: ["420000", "430000"],
    commandScene: 0,
    dataOutputMethod: 4,
    rulesCount: 1,
    ruleTypes: [1],
    status: "running",
    reportStatus: "success",
    reportFreq: 288,
    peakTraffic: 1.8,
    totalTraffic: 6.2,
    totalPackets: 52,
    hitTraffic: 1.8,
  },
  {
    commandId: 10008,
    listType: "local",
    commandSource: 1,
    level: 2,
    owner: "analyst",
    createTime: "2024-01-13 22:00:00",
    operationType: 0,
    comCode: "0010",
    effectProvince: ["310000", "320000", "330000", "340000"],
    commandScene: 1,
    dataOutputMethod: 3,
    rulesCount: 5,
    ruleTypes: [2, 3],
    status: "completed",
    reportStatus: "success",
    reportFreq: 12,
    peakTraffic: 4.1,
    totalTraffic: 22.5,
    totalPackets: 175,
    hitTraffic: 4.1,
  },
]

// 根据当前用户与角色过滤数据：管理员可见全部，其它用户只见自己的
export function filterCommandsByUser(
  data: CommandRecord[],
  username: string,
  role: string
): CommandRecord[] {
  if (role === "admin") return data
  return data.filter((c) => c.owner === username)
}
