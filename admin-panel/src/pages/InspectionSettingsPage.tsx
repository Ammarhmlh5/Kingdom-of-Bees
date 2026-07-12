import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getInspectionSettings, 
  saveInspectionSetting, 
  InspectionSetting 
} from '../services/inspectionSettings';
import { toast } from 'sonner';
import { Settings, Save, RotateCcw, AlertCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Default inspection types
const DEFAULT_INSPECTION_TYPES = [
  { type: 'ROUTINE', nameAr: 'فحص روتيني', minInterval: 3, maxInterval: 10, description: 'الفحص الدوري الروتيني للخلايا' },
  { type: 'QUICK_CHECK', nameAr: 'فحص سريع', minInterval: 0, maxInterval: 1, description: 'فحص سريع حسب الحاجة' },
  { type: 'DISEASE_CHECK', nameAr: 'فحص أمراض', minInterval: 0, maxInterval: 3, description: 'فحص للمتابعة العلاجية' },
  { type: 'QUEEN_CHECK', nameAr: 'فحص ملكات', minInterval: 14, maxInterval: 21, description: 'فحص بعد التربية أو جني الغذاء الملكي' },
];

export function InspectionSettingsPage() {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InspectionSetting>>({});

  const { data: settings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inspectionSettings'],
    queryFn: getInspectionSettings,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<InspectionSetting>) => saveInspectionSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionSettings'] });
      toast.success('تم حفظ الإعداد بنجاح');
      setEditingType(null);
    },
    onError: () => {
      toast.error('فشل في حفظ الإعداد');
    },
  });

  const handleStartEdit = (type: string) => {
    const existing = settings.find((s: { type: string }) => s.type === type);
    if (existing) {
      setFormData(existing);
    } else {
      const defaultType = DEFAULT_INSPECTION_TYPES.find(t => t.type === type);
      if (defaultType) {
        setFormData({
          type: defaultType.type,
          nameAr: defaultType.nameAr,
          minInterval: defaultType.minInterval,
          maxInterval: defaultType.maxInterval,
          description: defaultType.description,
          isActive: true,
        });
      }
    }
    setEditingType(type);
  };

  const handleSave = () => {
    if (!formData.type) return;
    
    // Validation
    if (formData.minInterval !== undefined && formData.maxInterval !== undefined) {
      if (formData.minInterval > formData.maxInterval) {
        toast.error('الحد الأدنى يجب أن يكون أقل من الحد الأعلى');
        return;
      }
    }
    
    saveMutation.mutate(formData);
  };

  const handleResetToDefault = (type: string) => {
    const defaultType = DEFAULT_INSPECTION_TYPES.find(t => t.type === type);
    if (defaultType) {
      setFormData({
        type: defaultType.type,
        nameAr: defaultType.nameAr,
        minInterval: defaultType.minInterval,
        maxInterval: defaultType.maxInterval,
        description: defaultType.description,
        isActive: true,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p>فشل في تحميل الإعدادات</p>
        <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-destructive text-white rounded-lg text-sm">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            إعدادات الفحوصات
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            ضبط الحدود الزمنية لكل نوع فحص. هذه الإعدادات تُطبق على جميع المستخدمين.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-primary">كيف يعمل النظام؟</p>
          <p className="text-muted-foreground mt-1">
            عند تسجيل فحص، يقوم النظام بالتحقق من أن التاريخ ضمن الحدود المحددة، ثم يقوم بجدولة الفحص القادم تلقائياً.
            الحد الأدنى = أقل فترة بين الفحوصات، الحد الأعلى = أقصى فترة مسموحة.
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4">
        {DEFAULT_INSPECTION_TYPES.map((defaultType) => {
          const setting = settings.find((s: { type: string }) => s.type === defaultType.type);
          const isEditing = editingType === defaultType.type;
          
          return (
            <div 
              key={defaultType.type}
              className={cn(
                "glass-panel rounded-xl p-5 transition-all duration-300",
                isEditing && "ring-2 ring-primary"
              )}
            >
              {isEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{formData.nameAr || defaultType.nameAr}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResetToDefault(defaultType.type)}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                        title="إعادة للافتراضي"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingType(null)}
                        className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        الحد الأدنى (بالأيام)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minInterval ?? defaultType.minInterval}
                        onChange={(e) => setFormData({ ...formData, minInterval: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">أقل فترة مسموحة بين الفحوصات</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        الحد الأعلى (بالأيام)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxInterval ?? defaultType.maxInterval}
                        onChange={(e) => setFormData({ ...formData, maxInterval: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary outline-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">أقصى فترة مسموحة بين الفحوصات</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <label htmlFor="isActive" className="text-sm">تفعيل هذا النوع</label>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saveMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    حفظ الإعداد
                  </button>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      setting?.isActive === false ? "bg-destructive/20" : "bg-primary/20"
                    )}>
                      <Settings className={cn(
                        "w-6 h-6",
                        setting?.isActive === false ? "text-destructive" : "text-primary"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{setting?.nameAr || defaultType.nameAr}</h3>
                      <p className="text-sm text-muted-foreground">{setting?.description || defaultType.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{setting?.minInterval ?? defaultType.minInterval}</div>
                        <div className="text-xs text-muted-foreground">الحد الأدنى</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{setting?.maxInterval ?? defaultType.maxInterval}</div>
                        <div className="text-xs text-muted-foreground">الحد الأعلى</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {setting?.isActive === false && (
                        <span className="px-2 py-1 bg-destructive/20 text-destructive rounded-full text-xs">
                          معطل
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(defaultType.type)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        تعديل
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="glass-panel rounded-xl p-4">
        <h4 className="font-medium text-sm mb-3 text-muted-foreground">ملاحظات:</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary/30"></div>
            <span>الحد الأدنى: أقل فترة مسموحة قبل الفحص القادم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span>الحد الأعلى: أقصى فترة قبل إرسال تنبيه التأخير</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>الفحص السريع لا يقوم بجدولة تلقائية</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="w-3 h-3 text-destructive" />
            <span>عند تعطيل النوع، لا يتم التحقق من الحدود</span>
          </div>
        </div>
      </div>
    </div>
  );
}