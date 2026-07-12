import React from 'react'
import type { Alert, AlertPriority, AlertType } from '@/types/alerts'
import { ALERT_TYPE_LABELS, ALERT_TYPE_ICONS, PRIORITY_LABELS } from '@/types/alerts'

export type { Alert, AlertPriority, AlertType }

interface AlertsListProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
  onAction?: (alert: Alert) => void
  showHiveInfo?: boolean
}

type PriorityStyles = { bg: string; border: string; icon: string; badge: string }

function getPriorityStyles(priority: AlertPriority): PriorityStyles {
  switch (priority) {
    case 'HIGH':
      return { bg: 'bg-red-50', border: 'border-red-300', icon: 'text-red-600', badge: 'bg-red-100 text-red-800' }
    case 'MEDIUM':
      return { bg: 'bg-yellow-50', border: 'border-yellow-300', icon: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' }
    case 'LOW':
      return { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' }
  }
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onDismiss,
  onAction,
  showHiveInfo = true
}) => {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`

    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-700 font-medium">لا توجد تنبيهات</p>
        <p className="text-green-600 text-sm mt-1">جميع الخلايا في حالة جيدة</p>
      </div>
    )
  }

  const groupedAlerts = {
    HIGH: alerts.filter(a => a.priority === 'HIGH' && !a.dismissed),
    MEDIUM: alerts.filter(a => a.priority === 'MEDIUM' && !a.dismissed),
    LOW: alerts.filter(a => a.priority === 'LOW' && !a.dismissed)
  }

  return (
    <div className="space-y-4">
      {(Object.keys(groupedAlerts) as AlertPriority[]).map(priority => {
        const group = groupedAlerts[priority]
        if (group.length === 0) return null

        const sectionStyles = {
          HIGH: { heading: 'text-red-700', dot: 'bg-red-500', label: 'تنبيهات عاجلة' },
          MEDIUM: { heading: 'text-yellow-700', dot: 'bg-yellow-500', label: 'تنبيهات متوسطة' },
          LOW: { heading: 'text-blue-700', dot: 'bg-blue-500', label: 'تنبيهات منخفضة' }
        }

        const s = sectionStyles[priority]

        return (
          <div key={priority} className="space-y-2">
            <h3 className={`text-sm font-semibold ${s.heading} flex items-center gap-2`}>
              <span className={`w-2 h-2 ${s.dot} rounded-full ${priority === 'HIGH' ? 'animate-pulse' : ''}`} />
              {s.label} ({group.length})
            </h3>
            {group.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                styles={getPriorityStyles(alert.priority)}
                formatDate={formatDate}
                onDismiss={onDismiss}
                onAction={onAction}
                showHiveInfo={showHiveInfo}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

interface AlertCardProps {
  alert: Alert
  styles: PriorityStyles
  formatDate: (date: string) => string
  onDismiss?: (alertId: string) => void
  onAction?: (alert: Alert) => void
  showHiveInfo: boolean
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  styles,
  formatDate,
  onDismiss,
  onAction,
  showHiveInfo
}) => {
  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${styles.icon} flex-shrink-0`}>
          {ALERT_TYPE_ICONS[alert.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{ALERT_TYPE_LABELS[alert.type]}</span>
                {showHiveInfo && (alert.hiveName || alert.apiaryName) && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {alert.apiaryName}{alert.apiaryName && alert.hiveName ? ' • ' : ''}{alert.hiveName}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className={`${styles.badge} text-xs px-2 py-1 rounded font-medium flex-shrink-0`}>
              {PRIORITY_LABELS[alert.priority]}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{alert.message}</p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-500">{formatDate(alert.createdAt)}</span>

            <div className="flex items-center gap-2">
              {alert.actionUrl && alert.actionLabel && onAction && (
                <button
                  onClick={() => onAction(alert)}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    alert.priority === 'HIGH'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : alert.priority === 'MEDIUM'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {alert.actionLabel}
                </button>
              )}

              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  تجاهل
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertsList
