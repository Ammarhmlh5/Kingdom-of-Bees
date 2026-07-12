import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import type { AlertType, AlertPriority, NotificationChannel, AlertTypeConfig } from '@/types/alerts'
import { ALERT_TYPE_LABELS, ALERT_TYPE_ICONS, PRIORITY_LABELS, CHANNEL_LABELS } from '@/types/alerts'

const defaultTypeConfigs: AlertTypeConfig[] = [
  { type: 'SWARM_RISK', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push', 'email'], quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'NO_EGGS', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push'], quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'LOW_HONEY', enabled: true, defaultPriority: 'MEDIUM', channels: ['in_app'], quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'IRREGULAR_BROOD', enabled: true, defaultPriority: 'MEDIUM', channels: ['in_app'], quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'FEEDING_NEEDED', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push'], quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'INSPECTION_DUE', enabled: true, defaultPriority: 'LOW', channels: ['in_app'], quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'QUEEN_ISSUE', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push', 'email'], quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'DISEASE', enabled: true, defaultPriority: 'HIGH', channels: ['in_app', 'push', 'email', 'sms'], quietHoursEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'WEATHER', enabled: true, defaultPriority: 'MEDIUM', channels: ['in_app', 'push'], quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' },
  { type: 'OTHER', enabled: true, defaultPriority: 'LOW', channels: ['in_app'], quietHoursEnabled: true, quietHoursStart: '22:00', quietHoursEnd: '07:00' }
]

const allChannels: NotificationChannel[] = ['in_app', 'push', 'email', 'sms']
const allPriorities: AlertPriority[] = ['HIGH', 'MEDIUM', 'LOW']

export function AlertTypeConfigTab() {
  const [configs, setConfigs] = useState<AlertTypeConfig[]>(defaultTypeConfigs)
  const [saved, setSaved] = useState(false)

  const updateConfig = (type: AlertType, updates: Partial<AlertTypeConfig>) => {
    setConfigs(prev => prev.map(c => c.type === type ? { ...c, ...updates } : c))
  }

  const toggleChannelForType = (type: AlertType, channel: NotificationChannel) => {
    setConfigs(prev => prev.map(c => {
      if (c.type !== type) return c
      const channels = c.channels.includes(channel)
        ? c.channels.filter(ch => ch !== channel)
        : [...c.channels, channel]
      return { ...c, channels }
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {configs.map(config => (
          <Card key={config.type} className={`border-2 transition-all ${config.enabled ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ALERT_TYPE_ICONS[config.type]}</span>
                  <div>
                    <CardTitle className="text-lg">{ALERT_TYPE_LABELS[config.type]}</CardTitle>
                    <CardDescription>تخصيص إعدادات التنبيهات لهذا النوع</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">مفعل</span>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(v) => updateConfig(config.type, { enabled: v })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">الأولوية الافتراضية</Label>
                  <div className="flex gap-2">
                    {allPriorities.map(p => (
                      <button
                        key={p}
                        onClick={() => updateConfig(config.type, { defaultPriority: p })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          config.defaultPriority === p
                            ? p === 'HIGH' ? 'bg-red-100 text-red-800 ring-2 ring-red-300'
                              : p === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300'
                              : 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">قنوات الإرسال</Label>
                  <div className="flex flex-wrap gap-2">
                    {allChannels.map(ch => (
                      <button
                        key={ch}
                        onClick={() => toggleChannelForType(config.type, ch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          config.channels.includes(ch)
                            ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {CHANNEL_LABELS[ch]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">الساعات الهادئة</Label>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={!config.quietHoursEnabled}
                      onCheckedChange={(v) => updateConfig(config.type, { quietHoursEnabled: !v })}
                    />
                    <span className="text-xs text-muted-foreground">
                      {config.quietHoursEnabled ? 'تجاوز الساعات الهادئة' : 'احترام الساعات الهادئة'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {config.channels.map(ch => (
                  <Badge key={ch} variant="secondary" className="text-xs">
                    {CHANNEL_LABELS[ch]}
                  </Badge>
                ))}
                <Badge variant={config.enabled ? 'default' : 'outline'} className="text-xs">
                  {PRIORITY_LABELS[config.defaultPriority]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {config.quietHoursEnabled ? 'تجاوز الهادئة' : 'الهادئة مفعلة'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  )
}
