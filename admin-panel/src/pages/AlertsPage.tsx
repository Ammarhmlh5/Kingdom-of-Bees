import { useState, useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell, Settings2, SlidersHorizontal, Puzzle, AlertTriangle, AlertCircle, Info,
  CheckCircle, X, Plus, Trash2, Save, GripVertical, Clock, BellOff, Volume2, FileText, type LucideIcon
} from 'lucide-react'

type AlertPriority = 'HIGH' | 'MEDIUM' | 'LOW'
type AlertType = 'SWARM_RISK' | 'NO_EGGS' | 'LOW_HONEY' | 'IRREGULAR_BROOD' | 'FEEDING_NEEDED' | 'INSPECTION_DUE' | 'QUEEN_ISSUE' | 'DISEASE' | 'WEATHER' | 'OTHER'
type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms'

interface AlertItem {
  id: string; type: AlertType; priority: AlertPriority; title: string; message: string
  hiveName?: string; apiaryName?: string; createdAt: string; actionUrl?: string; actionLabel?: string; dismissed?: boolean
}

interface AlertTypeConfig {
  type: AlertType; enabled: boolean; defaultPriority: AlertPriority; channels: NotificationChannel[]; quietHoursBypass: boolean
}

interface CustomRule {
  id: string; name: string; enabled: boolean; conditions: string; priority: AlertPriority; channels: NotificationChannel[]
}

interface GlassCardProps {
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  count?: number;
}

const ALERT_LABELS: Record<AlertType, string> = {
  SWARM_RISK: 'خطر تطريد', NO_EGGS: 'غياب البيض', LOW_HONEY: 'نقص العسل', IRREGULAR_BROOD: 'حضنة غير منتظمة',
  FEEDING_NEEDED: 'تغذية مطلوبة', INSPECTION_DUE: 'فحص دوري', QUEEN_ISSUE: 'مشكلة ملكة', DISEASE: 'مرض', WEATHER: 'تحذير جوي', OTHER: 'أخرى'
}
const ALERT_ICONS: Record<AlertType, string> = {
  SWARM_RISK: '🐝', NO_EGGS: '🥚', LOW_HONEY: '🍯', IRREGULAR_BROOD: '⚠️', FEEDING_NEEDED: '🍽️',
  INSPECTION_DUE: '📋', QUEEN_ISSUE: '👑', DISEASE: '🦠', WEATHER: '🌤️', OTHER: '📢'
}
const PRIORITY_LABELS: Record<AlertPriority, string> = { HIGH: 'عاجل', MEDIUM: 'متوسط', LOW: 'منخفض' }
const CHANNEL_LABELS: Record<NotificationChannel, string> = { in_app: 'داخل التطبيق', push: 'إشعار', email: 'بريد', sms: 'رسالة' }
const ALL_CHANNELS: NotificationChannel[] = ['in_app', 'push', 'email', 'sms']
const ALL_PRIORITIES: AlertPriority[] = ['HIGH', 'MEDIUM', 'LOW']

const PRIORITY_COLORS: Record<AlertPriority, string> = {
  HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
}

const TAB_ICONS = [Bell, Settings2, SlidersHorizontal, Puzzle]

const MOCK_ALERTS: AlertItem[] = [
  { id: '1', type: 'SWARM_RISK', priority: 'HIGH', title: 'خطر تطريد عالي في خلية #5', message: 'الخلية معرضة لخطر تطريد عالي. يُنصح بإضافة طابق علوي.', apiaryName: 'منحل الربيع', createdAt: new Date().toISOString(), actionLabel: 'عرض الخلية', actionUrl: '/hives/1' },
  { id: '2', type: 'FEEDING_NEEDED', priority: 'HIGH', title: 'تغذية طارئة مطلوبة', message: 'الخلية #3 تحتاج تغذية سكرية فورية.', apiaryName: 'منحل الربيع', createdAt: new Date(Date.now() - 3600000).toISOString(), actionLabel: 'تغذية الآن', actionUrl: '/hives/2' },
  { id: '3', type: 'DISEASE', priority: 'HIGH', title: 'اشتباه بمرض في الخلية #2', message: 'تم رصد أعراض مرضية على الحضنة في الخلية #2.', apiaryName: 'منحل الربيع', createdAt: new Date(Date.now() - 300000).toISOString(), actionLabel: 'معاينة', actionUrl: '/hives/6' },
  { id: '4', type: 'LOW_HONEY', priority: 'MEDIUM', title: 'انخفاض مستوى العسل', message: 'متوسط العسل في الخلية #7 أقل من 20%.', apiaryName: 'منحل الصيف', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '5', type: 'QUEEN_ISSUE', priority: 'HIGH', title: 'مشكلة في الملكة - خلية #8', message: 'الملكة في الخلية #8 لم تعد تنتج بيضاً.', apiaryName: 'منحل الربيع', createdAt: new Date(Date.now() - 1800000).toISOString(), actionLabel: 'تفقد الملكة', actionUrl: '/hives/5' },
  { id: '6', type: 'WEATHER', priority: 'MEDIUM', title: 'تحذير من عاصفة وشيكة', message: 'من المتوقع حدوث عاصفة خلال 24 ساعة.', createdAt: new Date(Date.now() - 5400000).toISOString() },
  { id: '7', type: 'INSPECTION_DUE', priority: 'LOW', title: 'فحص دوري مطلوب', message: 'الخلية #12 لم يتم فحصها منذ 14 يوم.', apiaryName: 'منحل الخريف', createdAt: new Date(Date.now() - 86400000).toISOString(), actionLabel: 'فحص الآن', actionUrl: '/hives/4' },
  { id: '8', type: 'IRREGULAR_BROOD', priority: 'MEDIUM', title: 'حضنة غير منتظمة في خلية #15', message: 'نمط الحضنة غير منتظم. قد يكون هناك مشكلة.', apiaryName: 'منحل الصيف', createdAt: new Date(Date.now() - 14400000).toISOString() },
]

const DEFAULT_TYPE_CONFIGS: AlertTypeConfig[] = [
  { type: 'SWARM_RISK', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push', 'email'], quietHoursBypass: true },
  { type: 'NO_EGGS', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push'], quietHoursBypass: true },
  { type: 'LOW_HONEY', enabled: true, defaultPriority: 'MEDIUM', channels: ['in_app'], quietHoursBypass: false },
  { type: 'IRREGULAR_BROOD', enabled: true, defaultPriority: 'MEDIUM', channels: ['in_app'], quietHoursBypass: false },
  { type: 'FEEDING_NEEDED', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push'], quietHoursBypass: true },
  { type: 'INSPECTION_DUE', enabled: true, defaultPriority: 'LOW', channels: ['in_app'], quietHoursBypass: false },
  { type: 'QUEEN_ISSUE', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push', 'email'], quietHoursBypass: true },
  { type: 'DISEASE', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push', 'email', 'sms'], quietHoursBypass: true },
  { type: 'WEATHER', enabled: true, defaultPriority: 'MEDIUM', channels: ['in_app', 'push'], quietHoursBypass: false },
  { type: 'OTHER', enabled: true, defaultPriority: 'LOW', channels: ['in_app'], quietHoursBypass: false },
]

function GlassCard({ className, children, ...props }: GlassCardProps) {
  return <div className={cn('glass-panel rounded-xl p-6', className)} {...props}>{children}</div>
}

function TabButton({ active, onClick, icon: Icon, label, count }: TabButtonProps) {
  return (
    <button onClick={onClick} className={cn(
      'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
      active ? 'bg-primary/20 text-primary shadow-lg shadow-primary/5 border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
    )}>
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full font-bold">{count}</span>
      )}
    </button>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-all duration-200 border',
        enabled ? 'bg-primary/40 border-primary/50' : 'bg-white/10 border-white/10'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow-md',
        enabled ? 'bg-primary right-0.5' : 'bg-gray-400 right-[22px]'
      )} />
    </button>
  )
}

function PriorityBadge({ priority }: { priority: AlertPriority }) {
  return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_COLORS[priority])}>{PRIORITY_LABELS[priority]}</span>
}

function ChannelBadge({ channel, active }: { channel: NotificationChannel; active: boolean }) {
  return (
    <span className={cn(
      'px-2 py-0.5 rounded-full text-xs font-medium border transition-all',
      active ? 'bg-primary/15 text-primary border-primary/30' : 'bg-white/5 text-muted-foreground border-white/10'
    )}>
      {CHANNEL_LABELS[channel]}
    </span>
  )
}

function ChannelToggle({ channel, active, onClick }: { channel: NotificationChannel; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
      active ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
    )}>
      {CHANNEL_LABELS[channel]}
    </button>
  )
}

function PrioritySelector({ value, onChange }: { value: AlertPriority; onChange: (p: AlertPriority) => void }) {
  return (
    <div className="flex gap-1.5">
      {ALL_PRIORITIES.map(p => (
        <button key={p} onClick={() => onChange(p)} className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
          value === p ? PRIORITY_COLORS[p] : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10'
        )}>
          {PRIORITY_LABELS[p]}
        </button>
      ))}
    </div>
  )
}

function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} د`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `منذ ${hours} س`
  const days = Math.floor(hours / 24)
  return `منذ ${days} ي`
}

export function AlertsPage() {
  const [tab, setTab] = useState(0)
  const tabs = ['جميع التنبيهات', 'الإعدادات العامة', 'إعدادات الأنواع', 'قواعد مخصصة']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            إدارة التنبيهات
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">مراقبة وإدارة وتخصيص جميع تنبيهات المناحل والخلايا</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((label, i) => (
          <TabButton
            key={label}
            active={tab === i}
            icon={TAB_ICONS[i]}
            label={label}
            onClick={() => setTab(i)}
          />
        ))}
      </div>

      {tab === 0 && <AllAlertsTab />}
      {tab === 1 && <GeneralSettingsTab />}
      {tab === 2 && <TypeConfigTab />}
      {tab === 3 && <CustomRulesTab />}
    </div>
  )
}

function AllAlertsTab() {
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const filtered = useMemo(() =>
    MOCK_ALERTS.filter(a => {
      if (dismissed.has(a.id)) return false
      if (filterPriority !== 'all' && a.priority !== filterPriority) return false
      if (filterType !== 'all' && a.type !== filterType) return false
      return true
    }), [filterPriority, filterType, dismissed])

  const stats = useMemo(() => ({
    total: filtered.length,
    high: filtered.filter(a => a.priority === 'HIGH').length,
    medium: filtered.filter(a => a.priority === 'MEDIUM').length,
    low: filtered.filter(a => a.priority === 'LOW').length
  }), [filtered])

  const sortedByPriority = useMemo(() =>
    [...filtered].sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return order[a.priority] - order[b.priority]
    }), [filtered])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="flex items-center justify-between">
          <div><div className="text-2xl font-bold">{stats.total}</div><div className="text-xs text-muted-foreground">إجمالي التنبيهات</div></div>
          <Bell className="w-8 h-8 text-muted-foreground/30" />
        </GlassCard>
        <GlassCard className={cn('flex items-center justify-between border-l-4', stats.high > 0 ? 'border-l-red-500' : 'opacity-50')}>
          <div><div className="text-2xl font-bold text-red-400">{stats.high}</div><div className="text-xs text-red-400/70">تنبيهات عاجلة</div></div>
          <AlertTriangle className="w-8 h-8 text-red-500/30" />
        </GlassCard>
        <GlassCard className={cn('flex items-center justify-between border-l-4', stats.medium > 0 ? 'border-l-amber-500' : 'opacity-50')}>
          <div><div className="text-2xl font-bold text-amber-400">{stats.medium}</div><div className="text-xs text-amber-400/70">تنبيهات متوسطة</div></div>
          <AlertCircle className="w-8 h-8 text-amber-500/30" />
        </GlassCard>
        <GlassCard className={cn('flex items-center justify-between border-l-4', stats.low > 0 ? 'border-l-blue-500' : 'opacity-50')}>
          <div><div className="text-2xl font-bold text-blue-400">{stats.low}</div><div className="text-xs text-blue-400/70">تنبيهات منخفضة</div></div>
          <Info className="w-8 h-8 text-blue-500/30" />
        </GlassCard>
      </div>

      <GlassCard>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">الأولوية</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary/30 outline-none">
              <option value="all">الكل</option>
              <option value="HIGH">عاجل</option>
              <option value="MEDIUM">متوسط</option>
              <option value="LOW">منخفض</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">النوع</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary/30 outline-none">
              <option value="all">الكل</option>
              {Object.entries(ALERT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex-1" />
          <button onClick={() => setDismissed(new Set(filtered.map(a => a.id)))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2">
            <X className="w-4 h-4" />تجاهل الكل
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        {sortedByPriority.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
            <p className="text-foreground font-medium">لا توجد تنبيهات</p>
            <p className="text-muted-foreground text-sm mt-1">جميع الخلايا في حالة جيدة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedByPriority.map(alert => {
              const colors = PRIORITY_COLORS[alert.priority]
              return (
                <div key={alert.id} className={cn(
                  'p-4 rounded-xl border transition-all hover:bg-white/5',
                  alert.priority === 'HIGH' ? 'bg-red-500/5 border-red-500/20' :
                    alert.priority === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/20' :
                      'bg-blue-500/5 border-blue-500/20'
                )}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{ALERT_ICONS[alert.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{alert.title}</h4>
                        <PriorityBadge priority={alert.priority} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>{ALERT_LABELS[alert.type]}</span>
                        {alert.apiaryName && <><span>•</span><span>{alert.apiaryName}</span></>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground/60">{formatTimeAgo(alert.createdAt)}</span>
                        <div className="flex items-center gap-2">
                          {alert.actionLabel && (
                            <span className={cn('text-xs px-3 py-1 rounded', colors)}>{alert.actionLabel}</span>
                          )}
                          <button onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}
                            className="text-xs text-muted-foreground hover:text-foreground underline">
                            تجاهل
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}

function GeneralSettingsTab() {
  const [channels, setChannels] = useState<NotificationChannel[]>(['in_app', 'push'])
  const [quietHours, setQuietHours] = useState(false)
  const [sound, setSound] = useState(true)
  const [digest, setDigest] = useState(false)
  const [expireDays, setExpireDays] = useState(30)
  const [saved, setSaved] = useState(false)

  const toggleChannel = (ch: NotificationChannel) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10"><Bell className="w-5 h-5 text-primary" /></div>
          <div><h3 className="font-bold text-lg">قنوات الإشعارات الافتراضية</h3><p className="text-xs text-muted-foreground">اختر القنوات التي ترسل من خلالها التنبيهات</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ALL_CHANNELS.map(ch => (
            <button key={ch} onClick={() => toggleChannel(ch)} className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right',
              channels.includes(ch) ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20'
            )}>
              <Toggle enabled={channels.includes(ch)} onChange={() => toggleChannel(ch)} />
              <div>
                <p className="font-medium text-sm">{CHANNEL_LABELS[ch]}</p>
                <p className="text-xs text-muted-foreground">
                  {ch === 'in_app' ? 'استلام التنبيهات داخل التطبيق' : ch === 'push' ? 'إرسال إشعار فوري' : ch === 'email' ? 'عبر البريد الإلكتروني' : 'رسالة نصية قصيرة'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10"><Clock className="w-5 h-5 text-primary" /></div>
          <div><h3 className="font-bold text-lg">الساعات الهادئة</h3><p className="text-xs text-muted-foreground">إيقاف الإشعارات خلال الفترة المحددة</p></div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            {quietHours ? <BellOff className="w-5 h-5 text-muted-foreground" /> : <Bell className="w-5 h-5 text-muted-foreground" />}
            <div><p className="font-medium text-sm">تفعيل الساعات الهادئة</p><p className="text-xs text-muted-foreground">منع الإشعارات الصوتية والفحصية</p></div>
          </div>
          <Toggle enabled={quietHours} onChange={setQuietHours} />
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10"><Volume2 className="w-5 h-5 text-primary" /></div>
          <div><h3 className="font-bold text-lg">الإعدادات العامة</h3></div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
              <div><p className="font-medium text-sm">الصوت</p><p className="text-xs text-muted-foreground">تشغيل صوت عند استلام تنبيه جديد</p></div>
            </div>
            <Toggle enabled={sound} onChange={setSound} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div><p className="font-medium text-sm">الملخص اليومي</p><p className="text-xs text-muted-foreground">استلام ملخص يومي لجميع التنبيهات</p></div>
            </div>
            <Toggle enabled={digest} onChange={setDigest} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">انتهاء صلاحية التنبيهات تلقائياً بعد (أيام)</label>
            <input type="number" min={1} max={365} value={expireDays} onChange={e => setExpireDays(parseInt(e.target.value) || 30)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary/30 outline-none" />
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all flex items-center gap-2">
          <Save className="w-4 h-4" />{saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  )
}

function TypeConfigTab() {
  const [configs, setConfigs] = useState<AlertTypeConfig[]>(DEFAULT_TYPE_CONFIGS)
  const [saved, setSaved] = useState(false)

  const updateConfig = (type: AlertType, updates: Partial<AlertTypeConfig>) => {
    setConfigs(prev => prev.map(c => c.type === type ? { ...c, ...updates } : c))
  }

  const toggleChannel = (type: AlertType, ch: NotificationChannel) => {
    setConfigs(prev => prev.map(c => {
      if (c.type !== type) return c
      const channels = c.channels.includes(ch) ? c.channels.filter(x => x !== ch) : [...c.channels, ch]
      return { ...c, channels }
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {configs.map(config => (
        <GlassCard key={config.type} className={cn('transition-all', !config.enabled && 'opacity-50')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ALERT_ICONS[config.type]}</span>
              <div><h3 className="font-bold">{ALERT_LABELS[config.type]}</h3><p className="text-xs text-muted-foreground">تخصيص إعدادات هذا النوع</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">مفعل</span>
              <Toggle enabled={config.enabled} onChange={v => updateConfig(config.type, { enabled: v })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">الأولوية الافتراضية</label>
              <PrioritySelector value={config.defaultPriority} onChange={p => updateConfig(config.type, { defaultPriority: p })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">قنوات الإرسال</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CHANNELS.map(ch => (
                  <ChannelToggle key={ch} channel={ch} active={config.channels.includes(ch)} onClick={() => toggleChannel(config.type, ch)} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">الساعات الهادئة</label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <Toggle enabled={!config.quietHoursBypass} onChange={v => updateConfig(config.type, { quietHoursBypass: !v })} />
                <span className="text-xs text-muted-foreground">{config.quietHoursBypass ? 'تجاوز الساعات الهادئة' : 'احترام الساعات الهادئة'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
            <PriorityBadge priority={config.defaultPriority} />
            {config.channels.map(ch => <ChannelBadge key={ch} channel={ch} active />)}
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', config.quietHoursBypass ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-white/5 text-muted-foreground border-white/10')}>
              {config.quietHoursBypass ? 'تجاوز الهادئة' : 'الهادئة مفعلة'}
            </span>
          </div>
        </GlassCard>
      ))}

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all flex items-center gap-2">
          <Save className="w-4 h-4" />{saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  )
}

function CustomRulesTab() {
  const [rules, setRules] = useState<CustomRule[]>(() => {
    try { return JSON.parse(localStorage.getItem('adminAlertRules') || '[]') } catch { return [] }
  })
  const [saved, setSaved] = useState(false)

  const saveRules = (newRules: CustomRule[]) => {
    setRules(newRules)
    localStorage.setItem('adminAlertRules', JSON.stringify(newRules))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addRule = () => {
    const newRule: CustomRule = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      name: '', enabled: true, conditions: 'قوة الخلية < 3', priority: 'MEDIUM', channels: ['in_app']
    }
    saveRules([...rules, newRule])
  }

  const deleteRule = (id: string) => saveRules(rules.filter(r => r.id !== id))
  const toggleRule = (id: string) => saveRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))

  const updateRule = (id: string, updates: Partial<CustomRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">أنشئ قواعد مخصصة للتنبيهات بناءً على شروط محددة</p>
        <button onClick={addRule}
          className="px-4 py-2 rounded-xl text-sm font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />قاعدة جديدة
        </button>
      </div>

      {rules.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <Puzzle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground font-medium">لا توجد قواعد مخصصة</p>
            <p className="text-muted-foreground text-sm mt-1">أنشئ قاعدة جديدة لتلقي تنبيهات مخصصة</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rules.map(rule => (
            <GlassCard key={rule.id} className={cn('transition-all', !rule.enabled && 'opacity-50')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-5 h-5 text-muted-foreground/30 cursor-move" />
                  <div className="flex-1">
                    <input type="text" value={rule.name} onChange={e => updateRule(rule.id, { name: e.target.value })}
                      placeholder="اسم القاعدة"
                      className="text-lg font-bold bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none px-1 w-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Toggle enabled={rule.enabled} onChange={() => toggleRule(rule.id)} />
                  <button onClick={() => deleteRule(rule.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">الشروط</label>
                  <input type="text" value={rule.conditions} onChange={e => updateRule(rule.id, { conditions: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">الأولوية</label>
                  <PrioritySelector value={rule.priority} onChange={p => updateRule(rule.id, { priority: p })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">قنوات الإرسال</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CHANNELS.map(ch => (
                      <ChannelToggle key={ch} channel={ch}
                        active={rule.channels.includes(ch)}
                        onClick={() => {
                          const channels = rule.channels.includes(ch)
                            ? rule.channels.filter(c => c !== ch) : [...rule.channels, ch]
                          updateRule(rule.id, { channels })
                        }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">{rule.conditions}</span>
                <span className="text-xs text-muted-foreground">←</span>
                <PriorityBadge priority={rule.priority} />
                {rule.channels.map(ch => <ChannelBadge key={ch} channel={ch} active />)}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {rules.length > 0 && (
        <div className="flex justify-end">
          <button onClick={() => saveRules(rules)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" />{saved ? 'تم الحفظ ✓' : 'حفظ جميع القواعد'}
          </button>
        </div>
      )}
    </div>
  )
}
