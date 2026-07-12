export type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type AlertType = 'SWARM_RISK' | 'NO_EGGS' | 'LOW_HONEY' | 'IRREGULAR_BROOD' | 'FEEDING_NEEDED' | 'INSPECTION_DUE' | 'QUEEN_ISSUE' | 'DISEASE' | 'WEATHER' | 'OTHER'
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'DISMISSED' | 'RESOLVED' | 'EXPIRED'
export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms'

export interface Alert {
  id: string
  type: AlertType
  priority: AlertPriority
  title: string
  message: string
  hiveId?: string
  hiveName?: string
  apiaryName?: string
  apiaryId?: string
  createdAt: string
  dismissed?: boolean
  actionUrl?: string
  actionLabel?: string
  status?: AlertStatus
  acknowledgedAt?: string
  expiresAt?: string
}

export interface AlertTypeConfig {
  type: AlertType
  enabled: boolean
  defaultPriority: AlertPriority
  channels: NotificationChannel[]
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  customMessage?: string
  autoResolveHours?: number
}

export interface AlertSettings {
  defaultChannels: NotificationChannel[]
  globalQuietHoursEnabled: boolean
  globalQuietHoursStart: string
  globalQuietHoursEnd: string
  autoExpireDays: number
  soundEnabled: boolean
  priorityThreshold: AlertPriority | 'ALL'
  dailyDigest: boolean
  emailDigest: 'none' | 'daily' | 'weekly'
}

export interface CustomAlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions: AlertCondition[]
  action: AlertRuleAction
  createdAt: string
}

export interface AlertCondition {
  field: 'hiveStrength' | 'honeyLevel' | 'queenAge' | 'daysSinceInspection' | 'temperature' | 'frameCount' | 'diseaseDetected'
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains'
  value: string | number | boolean
}

export interface AlertRuleAction {
  type: 'NOTIFY' | 'CREATE_ALERT' | 'ASSIGN_TASK'
  priority: AlertPriority
  message: string
  channels: NotificationChannel[]
}

export interface AlertStats {
  total: number
  byPriority: Record<AlertPriority, number>
  byType: Record<AlertType, number>
  active: number
  resolved: number
  acknowledged: number
  dismissed: number
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  SWARM_RISK: 'خطر تطريد',
  NO_EGGS: 'غياب البيض',
  LOW_HONEY: 'نقص العسل',
  IRREGULAR_BROOD: 'حضنة غير منتظمة',
  FEEDING_NEEDED: 'تغذية مطلوبة',
  INSPECTION_DUE: 'فحص دوري',
  QUEEN_ISSUE: 'مشكلة في الملكة',
  DISEASE: 'مرض',
  WEATHER: 'تحذير جوي',
  OTHER: 'أخرى'
}

export const ALERT_TYPE_ICONS: Record<AlertType, string> = {
  SWARM_RISK: '🐝',
  NO_EGGS: '🥚',
  LOW_HONEY: '🍯',
  IRREGULAR_BROOD: '⚠️',
  FEEDING_NEEDED: '🍽️',
  INSPECTION_DUE: '📋',
  QUEEN_ISSUE: '👑',
  DISEASE: '🦠',
  WEATHER: '🌤️',
  OTHER: '📢'
}

export const PRIORITY_LABELS: Record<AlertPriority, string> = {
  HIGH: 'عاجل',
  MEDIUM: 'متوسط',
  LOW: 'منخفض'
}

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: 'داخل التطبيق',
  push: 'إشعار فوري',
  email: 'البريد الإلكتروني',
  sms: 'رسالة نصية'
}
