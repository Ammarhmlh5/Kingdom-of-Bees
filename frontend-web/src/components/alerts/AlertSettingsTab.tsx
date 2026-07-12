import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, Mail, Smartphone, BellOff, Clock, FileText, Volume2, Save } from 'lucide-react'
import type { AlertSettings, NotificationChannel } from '@/types/alerts'
import { CHANNEL_LABELS } from '@/types/alerts'

const defaultSettings: AlertSettings = {
  defaultChannels: ['in_app', 'push'],
  globalQuietHoursEnabled: false,
  globalQuietHoursStart: '22:00',
  globalQuietHoursEnd: '07:00',
  autoExpireDays: 30,
  soundEnabled: true,
  priorityThreshold: 'ALL',
  dailyDigest: false,
  emailDigest: 'none'
}

const channelIcons: Record<NotificationChannel, React.ReactNode> = {
  in_app: <Bell className="w-4 h-4" />,
  push: <Smartphone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  sms: <FileText className="w-4 h-4" />
}

export function AlertSettingsTab() {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  const toggleChannel = (channel: NotificationChannel) => {
    setSettings(prev => ({
      ...prev,
      defaultChannels: prev.defaultChannels.includes(channel)
        ? prev.defaultChannels.filter(c => c !== channel)
        : [...prev.defaultChannels, channel]
    }))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSetting = <K extends keyof AlertSettings>(key: K, value: AlertSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            قنوات الإشعارات الافتراضية
          </CardTitle>
          <CardDescription>اختر القنوات التي ترسل من خلالها التنبيهات بشكل افتراضي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(CHANNEL_LABELS) as NotificationChannel[]).map(channel => (
              <label
                key={channel}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.defaultChannels.includes(channel)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Switch
                  checked={settings.defaultChannels.includes(channel)}
                  onCheckedChange={() => toggleChannel(channel)}
                />
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    settings.defaultChannels.includes(channel) ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {channelIcons[channel]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{CHANNEL_LABELS[channel]}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel === 'in_app' && 'استلام التنبيهات داخل التطبيق'}
                      {channel === 'push' && 'إرسال إشعار فوري للجهاز'}
                      {channel === 'email' && 'إرسال تنبيه عبر البريد الإلكتروني'}
                      {channel === 'sms' && 'إرسال رسالة نصية قصيرة'}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            الساعات الهادئة
          </CardTitle>
          <CardDescription>حدد الفترة التي لا ترسل فيها الإشعارات الصوتية والفحصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {settings.globalQuietHoursEnabled ? <BellOff className="w-5 h-5 text-gray-600" /> : <Bell className="w-5 h-5 text-gray-400" />}
              <div>
                <p className="font-medium text-sm">تفعيل الساعات الهادئة</p>
                <p className="text-xs text-muted-foreground">إيقاف الإشعارات خلال الفترة المحددة</p>
              </div>
            </div>
            <Switch
              checked={settings.globalQuietHoursEnabled}
              onCheckedChange={(v) => updateSetting('globalQuietHoursEnabled', v)}
            />
          </div>

          {settings.globalQuietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>من الساعة</Label>
                <input
                  type="time"
                  value={settings.globalQuietHoursStart}
                  onChange={(e) => updateSetting('globalQuietHoursStart', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>إلى الساعة</Label>
                <input
                  type="time"
                  value={settings.globalQuietHoursEnd}
                  onChange={(e) => updateSetting('globalQuietHoursEnd', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>إعدادات إضافية للتنبيهات والإشعارات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">الصوت</p>
                <p className="text-xs text-muted-foreground">تشغيل صوت عند استلام تنبيه جديد</p>
              </div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(v) => updateSetting('soundEnabled', v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-sm">الملخص اليومي</p>
                <p className="text-xs text-muted-foreground">استلام ملخص يومي لجميع التنبيهات</p>
              </div>
            </div>
            <Switch
              checked={settings.dailyDigest}
              onCheckedChange={(v) => updateSetting('dailyDigest', v)}
            />
          </div>

          <div className="space-y-2">
            <Label>انتهاء صلاحية التنبيهات تلقائياً بعد (أيام)</Label>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.autoExpireDays}
              onChange={(e) => updateSetting('autoExpireDays', parseInt(e.target.value) || 30)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  )
}
