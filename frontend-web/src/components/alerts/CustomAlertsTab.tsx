import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, Edit3, AlertTriangle, GripVertical } from 'lucide-react'
import type { CustomAlertRule, AlertCondition, AlertRuleAction, AlertPriority, NotificationChannel, AlertType } from '@/types/alerts'
import { ALERT_TYPE_ICONS, ALERT_TYPE_LABELS, PRIORITY_LABELS, CHANNEL_LABELS } from '@/types/alerts'

const conditionFieldLabels: Record<AlertCondition['field'], string> = {
  hiveStrength: 'قوة الخلية',
  honeyLevel: 'مستوى العسل',
  queenAge: 'عمر الملكة',
  daysSinceInspection: 'أيام منذ آخر فحص',
  temperature: 'درجة الحرارة',
  frameCount: 'عدد الإطارات',
  diseaseDetected: 'اكتشاف مرض'
}

const conditionOperatorLabels: Record<AlertCondition['operator'], string> = {
  eq: 'يساوي',
  neq: 'لا يساوي',
  gt: 'أكبر من',
  gte: 'أكبر أو يساوي',
  lt: 'أقل من',
  lte: 'أقل أو يساوي',
  contains: 'يحتوي'
}

interface ConditionRowProps {
  condition: AlertCondition
  onChange: (condition: AlertCondition) => void
  onRemove: () => void
}

const ConditionRow: React.FC<ConditionRowProps> = ({ condition, onChange, onRemove }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value as AlertCondition['field'] })}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
      >
        {Object.entries(conditionFieldLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as AlertCondition['operator'] })}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
      >
        {Object.entries(conditionOperatorLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {condition.field === 'diseaseDetected' ? (
        <select
          value={condition.value.toString()}
          onChange={(e) => onChange({ ...condition, value: e.target.value === 'true' })}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      ) : (
        <input
          type="number"
          value={condition.value.toString()}
          onChange={(e) => onChange({ ...condition, value: parseFloat(e.target.value) || 0 })}
          className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
      )}

      <button onClick={onRemove} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

function createEmptyRule(): CustomAlertRule {
  return {
    id: crypto.randomUUID?.() || Date.now().toString(),
    name: '',
    description: '',
    enabled: true,
    conditions: [{ field: 'hiveStrength', operator: 'lt', value: 3 }],
    action: { type: 'NOTIFY', priority: 'MEDIUM', message: '', channels: ['in_app'] },
    createdAt: new Date().toISOString()
  }
}

export function CustomAlertsTab() {
  const [rules, setRules] = useState<CustomAlertRule[]>(() => {
    const saved = localStorage.getItem('customAlertRules')
    return saved ? JSON.parse(saved) : []
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const saveRules = (newRules: CustomAlertRule[]) => {
    setRules(newRules)
    localStorage.setItem('customAlertRules', JSON.stringify(newRules))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addRule = () => {
    const newRule = createEmptyRule()
    setRules(prev => [...prev, newRule])
    setEditingId(newRule.id)
  }

  const deleteRule = (id: string) => {
    saveRules(rules.filter(r => r.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const toggleRule = (id: string) => {
    saveRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const updateRule = (id: string, updates: Partial<CustomAlertRule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const addCondition = (ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      return { ...r, conditions: [...r.conditions, { field: 'hiveStrength', operator: 'lt', value: 3 }] }
    }))
  }

  const updateCondition = (ruleId: string, index: number, condition: AlertCondition) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      const conditions = [...r.conditions]
      conditions[index] = condition
      return { ...r, conditions }
    }))
  }

  const removeCondition = (ruleId: string, index: number) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      return { ...r, conditions: r.conditions.filter((_, i) => i !== index) }
    }))
  }

  const updateAction = (ruleId: string, updates: Partial<AlertRuleAction>) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      return { ...r, action: { ...r.action, ...updates } }
    }))
  }

  const toggleActionChannel = (ruleId: string, channel: NotificationChannel) => {
    setRules(prev => prev.map(r => {
      if (r.id !== ruleId) return r
      const channels = r.action.channels.includes(channel)
        ? r.action.channels.filter(c => c !== channel)
        : [...r.action.channels, channel]
      return { ...r, action: { ...r.action, channels } }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">أنشئ قواعد مخصصة للتنبيهات بناءً على شروط محددة</p>
        </div>
        <Button onClick={addRule} className="gap-2">
          <Plus className="w-4 h-4" />
          قاعدة جديدة
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">لا توجد قواعد مخصصة</p>
            <p className="text-sm text-gray-400 mt-1">أنشئ قاعدة جديدة لتلقي تنبيهات مخصصة حسب احتياجاتك</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rules.map(rule => (
            <Card key={rule.id} className={`border-2 transition-all ${rule.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-300 cursor-move" />
                    <div className="flex-1">
                      {editingId === rule.id ? (
                        <input
                          type="text"
                          value={rule.name}
                          onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                          placeholder="اسم القاعدة"
                          className="text-lg font-bold bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none px-1 w-full"
                          autoFocus
                        />
                      ) : (
                        <CardTitle className="text-lg">{rule.name || 'قاعدة بدون اسم'}</CardTitle>
                      )}
                      {editingId === rule.id ? (
                        <input
                          type="text"
                          value={rule.description}
                          onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                          placeholder="وصف القاعدة (اختياري)"
                          className="text-sm text-muted-foreground bg-transparent border-b border-gray-200 focus:border-primary outline-none px-1 w-full mt-1"
                        />
                      ) : (
                        <CardDescription>{rule.description || 'بدون وصف'}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <button
                      onClick={() => setEditingId(editingId === rule.id ? null : rule.id)}
                      className={`p-2 rounded-lg transition-colors ${editingId === rule.id ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>

              {editingId === rule.id && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">الشروط</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCondition(rule.id)}
                        className="gap-1 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        إضافة شرط
                      </Button>
                    </div>
                    {rule.conditions.map((condition, index) => (
                      <ConditionRow
                        key={index}
                        condition={condition}
                        onChange={(c) => updateCondition(rule.id, index, c)}
                        onRemove={() => removeCondition(rule.id, index)}
                      />
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <Label className="text-sm font-medium">الإجراء</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">الأولوية</Label>
                        <div className="flex gap-2">
                          {(['HIGH', 'MEDIUM', 'LOW'] as AlertPriority[]).map(p => (
                            <button
                              key={p}
                              onClick={() => updateAction(rule.id, { priority: p })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                rule.action.priority === p
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
                          {(['in_app', 'push', 'email', 'sms'] as NotificationChannel[]).map(ch => (
                            <button
                              key={ch}
                              onClick={() => toggleActionChannel(rule.id, ch)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                rule.action.channels.includes(ch)
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
                        <Label className="text-xs">رسالة التنبيه</Label>
                        <input
                          type="text"
                          value={rule.action.message}
                          onChange={(e) => updateAction(rule.id, { message: e.target.value })}
                          placeholder="نص التنبيه..."
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        saveRules(rules)
                        setEditingId(null)
                      }}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      حفظ القاعدة
                    </Button>
                  </div>
                </CardContent>
              )}

              {editingId !== rule.id && (
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {rule.conditions.map((condition, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-xs text-gray-400">و</span>}
                        <Badge variant="outline" className="text-xs">
                          {conditionFieldLabels[condition.field]} {conditionOperatorLabels[condition.operator]} {condition.value.toString()}
                        </Badge>
                      </React.Fragment>
                    ))}
                    <span className="text-xs text-gray-400 mx-1">←</span>
                    <Badge className={`text-xs ${
                      rule.action.priority === 'HIGH' ? 'bg-red-500' :
                      rule.action.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {PRIORITY_LABELS[rule.action.priority]}
                    </Badge>
                    {rule.action.channels.map(ch => (
                      <Badge key={ch} variant="secondary" className="text-xs">{CHANNEL_LABELS[ch]}</Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {rules.length > 0 && editingId === null && (
        <div className="flex justify-end">
          <Button onClick={() => saveRules(rules)} className="gap-2">
            <Save className="w-4 h-4" />
            {saved ? 'تم الحفظ ✓' : 'حفظ جميع القواعد'}
          </Button>
        </div>
      )}
    </div>
  )
}
