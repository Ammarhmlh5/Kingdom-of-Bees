import React, { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AlertsList from '@/components/alerts/AlertsList'
import { AlertSettingsTab } from '@/components/alerts/AlertSettingsTab'
import { AlertTypeConfigTab } from '@/components/alerts/AlertTypeConfigTab'
import { CustomAlertsTab } from '@/components/alerts/CustomAlertsTab'
import { getAlerts } from '@/services/alerts'
import type { Alert, AlertPriority, AlertType } from '@/types/alerts'
import { ALERT_TYPE_LABELS, PRIORITY_LABELS } from '@/types/alerts'
import {
  Bell,
  Settings2,
  SlidersHorizontal,
  Puzzle,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react'

const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all-alerts')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await getAlerts()
      // Map backend response to frontend Alert type
      const mappedAlerts = (data || []).map((a: any) => ({
        id: a.id,
        type: a.alertType || a.type || 'OTHER',
        priority: a.priority || 'MEDIUM',
        title: a.title,
        message: a.message,
        hiveId: a.hiveId,
        hiveName: a.hiveName,
        apiaryName: a.apiaryName,
        apiaryId: a.apiaryId,
        createdAt: a.createdAt,
        status: a.status,
        actionUrl: a.actionUrl,
        actionLabel: a.actionLabel
      }))
      setAlerts(mappedAlerts)
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (dismissedIds.has(alert.id)) return false
      if (filterPriority !== 'all' && alert.priority !== filterPriority) return false
      if (filterType !== 'all' && alert.type !== filterType) return false
      return true
    })
  }, [alerts, filterPriority, filterType, dismissedIds])

  const stats = useMemo(() => ({
    total: filteredAlerts.length,
    high: filteredAlerts.filter(a => a.priority === 'HIGH').length,
    medium: filteredAlerts.filter(a => a.priority === 'MEDIUM').length,
    low: filteredAlerts.filter(a => a.priority === 'LOW').length
  }), [filteredAlerts])

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set(prev).add(alertId))
  }

  const handleAction = (alert: Alert) => {
    if (alert.actionUrl) {
      window.location.href = alert.actionUrl
    }
  }

  const handleDismissAll = () => {
    setDismissedIds(new Set(filteredAlerts.map(a => a.id)))
  }

  const tabs = [
    { id: 'all-alerts', label: 'جميع التنبيهات', icon: Bell },
    { id: 'settings', label: 'الإعدادات العامة', icon: Settings2 },
    { id: 'type-config', label: 'إعدادات الأنواع', icon: SlidersHorizontal },
    { id: 'custom-rules', label: 'قواعد مخصصة', icon: Puzzle },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔔 إدارة التنبيهات</h1>
        <p className="text-gray-600">مراقبة وإدارة وتخصيص جميع تنبيهات المناحل والخلايا</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'all-alerts' && filteredAlerts.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {filteredAlerts.length}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all-alerts" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`border-l-4 border-l-gray-400 ${stats.total === 0 ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-gray-600">إجمالي التنبيهات</div>
                  </div>
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className={`border-l-4 border-l-red-500 ${stats.high === 0 ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-700">{stats.high}</div>
                    <div className="text-xs text-red-600">تنبيهات عاجلة</div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className={`border-l-4 border-l-yellow-500 ${stats.medium === 0 ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.medium}</div>
                    <div className="text-xs text-yellow-600">تنبيهات متوسطة</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card className={`border-l-4 border-l-blue-500 ${stats.low === 0 ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{stats.low}</div>
                    <div className="text-xs text-blue-600">تنبيهات منخفضة</div>
                  </div>
                  <Info className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الأولوية</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">الكل</option>
                    <option value="HIGH">عاجل</option>
                    <option value="MEDIUM">متوسط</option>
                    <option value="LOW">منخفض</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">النوع</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">الكل</option>
                    {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1" />

                <button
                  onClick={handleDismissAll}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-medium flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  تجاهل الكل
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <AlertsList
                alerts={filteredAlerts}
                onDismiss={handleDismiss}
                onAction={handleAction}
                showHiveInfo={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AlertSettingsTab />
        </TabsContent>

        <TabsContent value="type-config" className="mt-6">
          <AlertTypeConfigTab />
        </TabsContent>

        <TabsContent value="custom-rules" className="mt-6">
          <CustomAlertsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AlertsPage
