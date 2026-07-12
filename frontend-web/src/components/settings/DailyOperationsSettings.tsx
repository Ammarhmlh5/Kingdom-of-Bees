import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInspectionSettings, saveInspectionSetting, InspectionSetting } from '@/services/inspectionSettings';
import { Save, RotateCcw, AlertCircle, Check, X, Clock, Activity, Stethoscope, Crown, Bell } from 'lucide-react';
import { toast } from 'sonner';

const INSPECTION_TYPES = [
  { type: 'QUICK_CHECK', nameAr: 'الفحص السريع', icon: Activity, defaultMin: 0, defaultMax: 1, description: 'فحص سريع حسب الحاجة للاطمئنان على حالة الخلية دون تسجيل مفصل' },
  { type: 'ROUTINE', nameAr: 'الفحص الروتيني', icon: Clock, defaultMin: 3, defaultMax: 10, description: 'الفحص الدوري المنتظم لجميع خلايا المنحل' },
  { type: 'TREATMENT', nameAr: 'الفحص العلاجي', icon: Stethoscope, defaultMin: 0, defaultMax: 7, description: 'فحص الخلايا بعد العلاج للتأكد من فعالية العلاج وعدم عودة المرض' },
  { type: 'QUEEN_INSPECTION', nameAr: 'فحص الملكات', icon: Crown, defaultMin: 0, defaultMax: 7, description: 'فحص دوري للملكات للتأكد من وضع البيض وصحة الملكة وأدائها' },
];

const TAB_OPERATIONS: Record<string, Array<{ type: string; nameAr: string; defaultMin: number; defaultMax: number; description: string }>> = {
  QUICK_CHECK: [],
  ROUTINE: [
    { type: 'FEEDING', nameAr: 'التغذية', defaultMin: 0, defaultMax: 7, description: 'جدولة التغذية الدورية للخلايا' },
    { type: 'FRAME_TRANSFER', nameAr: 'نقل إطارات', defaultMin: 0, defaultMax: 30, description: 'نقل الإطارات بين الخلايا' },
    { type: 'FOUNDATION_ADD', nameAr: 'إضافة شمع أساسات', defaultMin: 0, defaultMax: 60, description: 'إضافة شمع الأساسات للخلايا' },
    { type: 'ADD_SUPER', nameAr: 'إضافة عاسلة', defaultMin: 0, defaultMax: 30, description: 'إضافة عاسلة فوق الخلية' },
    { type: 'HARVEST', nameAr: 'الحصاد', defaultMin: 0, defaultMax: 30, description: 'جدولة مواعيد حصاد العسل' },
  ],
  TREATMENT: [
    { type: 'TREATMENT', nameAr: 'العلاج', defaultMin: 0, defaultMax: 14, description: 'متابعة جداول العلاج بعد الفحص العلاجي' },
  ],
  QUEEN_INSPECTION: [
    { type: 'QUEEN_REPLACE', nameAr: 'استبدال الملكات', defaultMin: 0, defaultMax: 30, description: 'جدولة استبدال الملكات عند الحاجة' },
    { type: 'SPLIT', nameAr: 'تقسيم الخلايا', defaultMin: 0, defaultMax: 60, description: 'تقسيم الخلايا لإنتاج طرود جديدة' },
    { type: 'MERGE', nameAr: 'دمج الخلايا', defaultMin: 0, defaultMax: 60, description: 'دمج خليتين في خلية واحدة' },
  ],
};

export function DailyOperationsSettings() {
  const [settings, setSettings] = useState<InspectionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('QUICK_CHECK');
  const [formData, setFormData] = useState<Record<string, Partial<InspectionSetting>>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const allTypes = INSPECTION_TYPES.flatMap(t => [t, ...TAB_OPERATIONS[t.type] || []]);

  const getDefault = (type: string) => {
    for (const t of INSPECTION_TYPES) {
      if (t.type === type) return t;
    }
    for (const ops of Object.values(TAB_OPERATIONS)) {
      const found = ops.find(o => o.type === type);
      if (found) return found;
    }
    return null;
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getInspectionSettings();
      setSettings(data || []);
      const forms: Record<string, Partial<InspectionSetting>> = {};
      for (const t of allTypes) {
        if (!t) continue;
        const existing = (data || []).find(s => s.type === t.type);
        forms[t.type] = existing
          ? { ...existing }
          : { type: t.type, nameAr: t.nameAr, minInterval: t.defaultMin, maxInterval: t.defaultMax, description: t.description, isActive: true };
      }
      setFormData(forms);
    } catch {
      toast.error('فشل تحميل إعدادات الفحوصات');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (type: string) => {
    const t = getDefault(type);
    if (!t) return;
    setFormData(prev => ({
      ...prev,
      [type]: { type, nameAr: t.nameAr, minInterval: t.defaultMin, maxInterval: t.defaultMax, description: t.description, isActive: true },
    }));
    toast.success('تمت إعادة الإعدادات للافتراضي');
  };

  const handleSave = async (type: string) => {
    const data = formData[type];
    if (!data) return;
    if (data.minInterval !== undefined && data.maxInterval !== undefined && data.minInterval > data.maxInterval) {
      toast.error('الحد الأدنى يجب أن يكون أقل من الحد الأعلى');
      return;
    }
    setSaving(type);
    try {
      await saveInspectionSetting({ ...data, type });
      toast.success('تم حفظ إعدادات ' + (data.nameAr || type));
      loadSettings();
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-brand-50/50 rounded-2xl p-5 border border-brand-100/50 flex gap-4 items-start">
        <AlertCircle className="w-6 h-6 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-brand-900">إعدادات العمليات اليومية</h3>
          <p className="text-brand-700/80 text-sm mt-1 leading-relaxed">
            تحكم في الفترات الزمنية والتنبيهات لكل نوع فحص وعملية. الحد الأدنى = أقل فترة مسموحة، الحد الأعلى = أقصى فترة قبل التذكير.
          </p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} dir="rtl">
        <TabsList className="grid grid-cols-4 h-auto p-1 bg-gray-100 rounded-xl">
          {INSPECTION_TYPES.map(t => (
            <TabsTrigger
              key={t.type}
              value={t.type}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 font-bold"
            >
              <t.icon className="w-4 h-4 ml-2" />
              {t.nameAr}
            </TabsTrigger>
          ))}
        </TabsList>

        {INSPECTION_TYPES.map(t => {
          const data = formData[t.type];
          const relatedOps = TAB_OPERATIONS[t.type] || [];
          if (!data) return null;
          return (
            <TabsContent key={t.type} value={t.type} className="mt-6 space-y-6">
              {/* Main inspection type settings */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.nameAr}</h3>
                    <p className="text-gray-500 text-sm mt-1">{data.description || t.description}</p>
                  </div>
                  <button
                    onClick={() => handleReset(t.type)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    title="إعادة للافتراضي"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الحد الأدنى (بالأيام)</label>
                    <input
                      type="number"
                      min="0"
                      value={data.minInterval ?? t.defaultMin}
                      onChange={e => setFormData(prev => ({ ...prev, [t.type]: { ...prev[t.type], minInterval: parseInt(e.target.value) || 0 } }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">أقل فترة مسموحة بين الفحوصات</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الحد الأعلى (بالأيام)</label>
                    <input
                      type="number"
                      min="1"
                      value={data.maxInterval ?? t.defaultMax}
                      onChange={e => setFormData(prev => ({ ...prev, [t.type]: { ...prev[t.type], maxInterval: parseInt(e.target.value) || 1 } }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">أقصى فترة مسموحة قبل التذكير بالفحص</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`active-${t.type}`}
                    checked={data.isActive ?? true}
                    onChange={e => setFormData(prev => ({ ...prev, [t.type]: { ...prev[t.type], isActive: e.target.checked } }))}
                    className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor={`active-${t.type}`} className="text-sm font-medium text-gray-700">تفعيل هذا النوع من الفحوصات</label>
                </div>

                <button
                  onClick={() => handleSave(t.type)}
                  disabled={saving === t.type}
                  className="w-full bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving === t.type ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  حفظ إعدادات {t.nameAr}
                </button>
              </div>

              {/* Related operations settings */}
              {relatedOps.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                    <Bell className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-gray-900">العمليات المرتبطة</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{relatedOps.length}</span>
                  </div>
                  <div className="space-y-4">
                    {relatedOps.map(op => {
                      const opData = formData[op.type];
                      if (!opData) return null;
                      return (
                        <div key={op.type} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900">{op.nameAr}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{opData.description || op.description}</p>
                            </div>
                            <button
                              onClick={() => handleReset(op.type)}
                              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                              title="إعادة للافتراضي"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">الحد الأدنى (أيام)</label>
                              <input
                                type="number"
                                min="0"
                                value={opData.minInterval ?? op.defaultMin}
                                onChange={e => setFormData(prev => ({ ...prev, [op.type]: { ...prev[op.type], minInterval: parseInt(e.target.value) || 0 } }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">الحد الأعلى (أيام)</label>
                              <input
                                type="number"
                                min="1"
                                value={opData.maxInterval ?? op.defaultMax}
                                onChange={e => setFormData(prev => ({ ...prev, [op.type]: { ...prev[op.type], maxInterval: parseInt(e.target.value) || 1 } }))}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`active-${op.type}`}
                                checked={opData.isActive ?? true}
                                onChange={e => setFormData(prev => ({ ...prev, [op.type]: { ...prev[op.type], isActive: e.target.checked } }))}
                                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              />
                              <label htmlFor={`active-${op.type}`} className="text-sm font-medium text-gray-700">تفعيل العملية</label>
                            </div>
                            <button
                              onClick={() => handleSave(op.type)}
                              disabled={saving === op.type}
                              className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving === op.type ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              حفظ
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <h4 className="font-bold text-sm text-gray-700 mb-3">ملاحظات:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-brand-300" />
            <span>الحد الأدنى: أقل فترة مسموحة قبل تكرار العملية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-brand-600" />
            <span>الحد الأعلى: أقصى فترة قبل إرسال تنبيه التذكير</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>عند تفعيل العملية، يتم جدولة تنبيهات تلقائية لها</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            <span>عند تعطيل العملية، لا يتم إرسال أي تنبيهات لها</span>
          </div>
        </div>
      </div>
    </div>
  );
}
