import React, { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AlertsList from '@/components/alerts/AlertsList'
import { AlertSettingsTab } from '@/components/alerts/AlertSettingsTab'
import { AlertTypeConfigTab } from '@/components/alerts/AlertTypeConfigTab'
import { CustomAlertsTab } from '@/components/alerts/CustomAlertsTab'
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

const mockAlerts: Alert[] = [
  {
    id: '1', type: 'SWARM_RISK', priority: 'HIGH',
    title: 'خطر تطريد عالي في خلية #5',
    message: 'الخلية معرضة لخطر تطريد عالي. يُنصح بإضافة طابق علوي أو تقسيم الخلية فوراً.',
    hiveId: '1', hiveName: 'خلية #5', apiaryName: 'منحل الربيع',
    createdAt: new Date().toISOString(),
    actionUrl: '/hives/1', actionLabel: 'عرض الخلية'
  },
  {
    id: '2', type: 'FEEDING_NEEDED', priority: 'HIGH',
    title: 'تغذية طارئة مطلوبة',
    message: 'الخلية #3 تحتاج تغذية سكرية فورية. الاحتياطيات منخفضة جداً.',
    hiveId: '2', hiveName: 'خلية #3', apiaryName: 'منحل الربيع',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    actionUrl: '/hives/2', actionLabel: 'تغذية الآن'
  },
  {
    id: '3', type: 'LOW_HONEY', priority: 'MEDIUM',
    title: 'انخفاض مستوى العسل',
    message: 'متوسط العسل في الخلية #7 أقل من 20%. قد تحتاج لتغذية خلال الأيام القادمة.',
    hiveId: '3', hiveName: 'خلية #7', apiaryName: 'منحل الصيف',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    actionUrl: '/hives/3', actionLabel: 'عرض الخلية'
  },
  {
    id: '4', type: 'INSPECTION_DUE', priority: 'LOW',
    title: 'فحص دوري مطلوب',
    message: 'الخلية #12 لم يتم فحصها منذ 14 يوم. يُنصح بإجراء فحص دوري.',
    hiveId: '4', hiveName: 'خلية #12', apiaryName: 'منحل الخريف',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    actionUrl: '/hives/4/inspect', actionLabel: 'فحص الآن'
  },
  {
    id: '5', type: 'QUEEN_ISSUE', priority: 'HIGH',
    title: 'مشكلة في الملكة - خلية #8',
    message: 'الملكة في الخلية #8 لم تعد تنتج بيضاً بشكل منتظم. يُنصح باستبدالها قريباً.',
    hiveId: '5', hiveName: 'خلية #8', apiaryName: 'منحل الربيع',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    actionUrl: '/hives/5', actionLabel: 'تفقد الملكة'
  },
  {
    id: '6', type: 'DISEASE', priority: 'HIGH',
    title: 'اشتباه بمرض في الخلية #2',
    message: 'تم رصد أعراض مرضية على الحضنة في الخلية #2. يجب عزل الخلية وفحصها فوراً.',
    hiveId: '6', hiveName: 'خلية #2', apiaryName: 'منحل الربيع',
    createdAt: new Date(Date.now() - 300000).toISOString(),
    actionUrl: '/hives/6', actionLabel: 'معاينة'
  },
  {
    id: '7', type: 'WEATHER', priority: 'MEDIUM',
    title: 'تحذير من عاصفة وشيكة',
    message: 'من المتوقع حدوث عاصفة خلال 24 ساعة. يُنصح بتأمين الخلايا وتثبيت الأغطية.',
    createdAt: new Date(Date.now() - 5400000).toISOString()
  },
  {
    id: '8', type: 'IRREGULAR_BROOD', priority: 'MEDIUM',
    title: 'حضنة غير منتظمة في خلية #15',
    message: 'نمط الحضنة في الخلية #15 غير منتظم. قد يكون هناك مشكلة في الملكة أو مرض.',
    hiveId: '7', hiveName: 'خلية #15', apiaryName: 'منحل الصيف',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    actionUrl: '/hives/7', actionLabel: 'فحص الخلية'
  },
  {
    id: '9', type: 'NO_EGGS', priority: 'HIGH',
    title: 'غياب البيض في خلية #20',
    message: 'لم يتم العثور على بيض في الخلية #20 خلال آخر فحص. قد تكون الملكة مفقودة.',
    hiveId: '8', hiveName: 'خلية #20', apiaryName: 'منحل الخريف',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    actionUrl: '/hives/8', actionLabel: 'تحقق من الملكة'
  },
  {
    id: '10', type: 'LOW_HONEY', priority: 'LOW',
    title: 'نقص مخزون العسل',
    message: 'مخزون العسل في الخلية #6 أقل من 15%. يُنصح بتأجيل الحصاد لهذه الخلية.',
    hiveId: '9', hiveName: 'خلية #6', apiaryName: 'منحل الربيع',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
]

const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all-alerts')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert => {
      if (dismissedIds.has(alert.id)) return false
      if (filterPriority !== 'all' && alert.priority !== filterPriority) return false
      if (filterType !== 'all' && alert.type !== filterType) return false
      return true
    })
  }, [filterPriority, filterType, dismissedIds])

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
