import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminPlantsService } from '../services/plants';
import type { Plant } from '../services/plants';
import { Flower2, ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';

const plantTypes = [
  { value: 'TREE', label: 'شجرة' },
  { value: 'SHRUB', label: 'شجيرة' },
  { value: 'HERB', label: 'عشبة' },
  { value: 'CROP', label: 'محصول' },
  { value: 'WILDFLOWER', label: 'زهرة برية' },
];

interface FormData {
  scientificName: string;
  commonNameAr: string;
  commonNameEn: string;
  localNames: string[];
  synonyms: string[];
  plantType: string;
  family: string;
  descriptionAr: string;
  descriptionEn: string;
  heightMinMeters: string;
  heightMaxMeters: string;
  nectarProduction: string;
  nectarRating: string;
  pollenProduction: string;
  pollenRating: string;
  attraction: string;
  startMonth: string;
  endMonth: string;
  peakMonth: string;
  durationWeeks: string;
  flowerColor: string;
  nativeRegions: string[];
  cultivatedRegions: string[];
  images: string[];
  videos: string[];
}

const emptyForm: FormData = {
  scientificName: '',
  commonNameAr: '',
  commonNameEn: '',
  localNames: [],
  synonyms: [],
  plantType: 'TREE',
  family: '',
  descriptionAr: '',
  descriptionEn: '',
  heightMinMeters: '',
  heightMaxMeters: '',
  nectarProduction: 'MEDIUM',
  nectarRating: '3',
  pollenProduction: 'MEDIUM',
  pollenRating: '3',
  attraction: 'MEDIUM',
  startMonth: '',
  endMonth: '',
  peakMonth: '',
  durationWeeks: '',
  flowerColor: '',
  nativeRegions: [],
  cultivatedRegions: [],
  images: [],
  videos: [],
};

function ArrayInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    onChange([...values, input.trim()]);
    setInput('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm"
        />
        <button type="button" onClick={add} className="p-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PlantFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await adminPlantsService.get(id);
        const plant: Plant = res.data || res;
        const bv = (plant.beekeepingValue || {}) as { nectar?: { production: string; rating: number }; pollen?: { production: string; rating: number }; attraction: string };
        const fl = (plant.flowering || {}) as { startMonth?: number; endMonth?: number; peakMonth?: number; flowerColor?: string; durationWeeks?: number };
        setForm({
          scientificName: plant.scientificName || '',
          commonNameAr: plant.commonNameAr || '',
          commonNameEn: plant.commonNameEn || '',
          localNames: plant.localNames || [],
          synonyms: plant.synonyms || [],
          plantType: plant.plantType || 'TREE',
          family: plant.family || '',
          descriptionAr: plant.descriptionAr || '',
          descriptionEn: plant.descriptionEn || '',
          heightMinMeters: plant.heightMinMeters?.toString() || '',
          heightMaxMeters: plant.heightMaxMeters?.toString() || '',
          nectarProduction: bv.nectar?.production || 'MEDIUM',
          nectarRating: bv.nectar?.rating?.toString() || '3',
          pollenProduction: bv.pollen?.production || 'MEDIUM',
          pollenRating: bv.pollen?.rating?.toString() || '3',
          attraction: bv.attraction || 'MEDIUM',
          startMonth: fl.startMonth?.toString() || '',
          endMonth: fl.endMonth?.toString() || '',
          peakMonth: fl.peakMonth?.toString() || '',
          durationWeeks: fl.durationWeeks?.toString() || '',
          flowerColor: fl.flowerColor || '',
          nativeRegions: plant.nativeRegions || [],
          cultivatedRegions: plant.cultivatedRegions || [],
          images: plant.images || [],
          videos: plant.videos || [],
        });
      } catch {
        showToast('فشل تحميل بيانات النبتة', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showToast]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => ({
    scientificName: form.scientificName,
    commonNameAr: form.commonNameAr,
    commonNameEn: form.commonNameEn || undefined,
    localNames: form.localNames,
    synonyms: form.synonyms,
    plantType: form.plantType,
    family: form.family || undefined,
    descriptionAr: form.descriptionAr || undefined,
    descriptionEn: form.descriptionEn || undefined,
    heightMinMeters: form.heightMinMeters ? Number(form.heightMinMeters) : undefined,
    heightMaxMeters: form.heightMaxMeters ? Number(form.heightMaxMeters) : undefined,
    beekeepingValue: {
      nectar: { production: form.nectarProduction, rating: Number(form.nectarRating) },
      pollen: { production: form.pollenProduction, rating: Number(form.pollenRating) },
      attraction: form.attraction,
    },
    flowering: {
      startMonth: form.startMonth ? Number(form.startMonth) : undefined,
      endMonth: form.endMonth ? Number(form.endMonth) : undefined,
      peakMonth: form.peakMonth ? Number(form.peakMonth) : undefined,
      durationWeeks: form.durationWeeks ? Number(form.durationWeeks) : undefined,
      flowerColor: form.flowerColor || undefined,
    },
    nativeRegions: form.nativeRegions,
    cultivatedRegions: form.cultivatedRegions,
    images: form.images,
    videos: form.videos,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.scientificName.trim() || !form.commonNameAr.trim()) {
      showToast('الاسم العلمي والاسم العربي إجباريان', 'error');
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        await adminPlantsService.update(id!, buildPayload());
        showToast('تم تحديث النبتة بنجاح');
      } else {
        await adminPlantsService.create(buildPayload());
        showToast('تم إضافة النبتة بنجاح');
      }
      navigate('/plants');
    } catch {
      showToast(isEdit ? 'فشل التحديث' : 'فشل الإضافة', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl font-bold shadow-xl text-white transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.text}
        </div>
      )}

      <button onClick={() => navigate('/plants')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowRight className="w-4 h-4" />
        العودة إلى مكتبة النباتات
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
          <Flower2 className="w-6 h-6 text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black">{isEdit ? 'تعديل نبات' : 'إضافة نبات جديد'}</h1>
          <p className="text-muted-foreground text-sm">أدخل جميع بيانات النبتة الرحيقية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Names */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">الأسماء</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">الاسم العلمي *</label>
              <input type="text" value={form.scientificName} onChange={e => updateField('scientificName', e.target.value)} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الاسم العربي *</label>
              <input type="text" value={form.commonNameAr} onChange={e => updateField('commonNameAr', e.target.value)} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الاسم الإنجليزي</label>
              <input type="text" value={form.commonNameEn} onChange={e => updateField('commonNameEn', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">الأسماء المحلية</label>
              <ArrayInput values={form.localNames} onChange={v => updateField('localNames', v)} placeholder="أضف اسماً محلياً..." />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">المرادفات العلمية</label>
              <ArrayInput values={form.synonyms} onChange={v => updateField('synonyms', v)} placeholder="أضف مرادفاً..." />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">التصنيف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">نوع النبات</label>
              <select value={form.plantType} onChange={e => updateField('plantType', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm">
                {plantTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">العائلة</label>
              <input type="text" value={form.family} onChange={e => updateField('family', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">الوصف</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">الوصف بالعربية</label>
              <textarea value={form.descriptionAr} onChange={e => updateField('descriptionAr', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الوصف بالإنجليزية</label>
              <textarea value={form.descriptionEn} onChange={e => updateField('descriptionEn', e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm resize-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-bold mb-1">الحد الأدنى للارتفاع (م)</label>
              <input type="number" step="0.1" min="0" value={form.heightMinMeters} onChange={e => updateField('heightMinMeters', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الحد الأقصى للارتفاع (م)</label>
              <input type="number" step="0.1" min="0" value={form.heightMaxMeters} onChange={e => updateField('heightMaxMeters', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
        </div>

        {/* Beekeeping Value */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">قيمة النحالة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">إنتاج الرحيق</label>
              <select value={form.nectarProduction} onChange={e => updateField('nectarProduction', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm">
                <option value="HIGH">عالي</option>
                <option value="MEDIUM">متوسط</option>
                <option value="LOW">منخفض</option>
                <option value="NONE">لا يوجد</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">تقييم الرحيق (1-5)</label>
              <input type="number" min="1" max="5" value={form.nectarRating} onChange={e => updateField('nectarRating', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">إنتاج حبوب اللقاح</label>
              <select value={form.pollenProduction} onChange={e => updateField('pollenProduction', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm">
                <option value="HIGH">عالي</option>
                <option value="MEDIUM">متوسط</option>
                <option value="LOW">منخفض</option>
                <option value="NONE">لا يوجد</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">تقييم اللقاح (1-5)</label>
              <input type="number" min="1" max="5" value={form.pollenRating} onChange={e => updateField('pollenRating', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-bold mb-1">جذب النحل</label>
            <select value={form.attraction} onChange={e => updateField('attraction', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm">
              <option value="HIGH">عالي</option>
              <option value="MEDIUM">متوسط</option>
              <option value="LOW">منخفض</option>
            </select>
          </div>
        </div>

        {/* Flowering */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">موسم الإزهار</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">شهر البداية (1-12)</label>
              <input type="number" min="1" max="12" value={form.startMonth} onChange={e => updateField('startMonth', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">شهر النهاية (1-12)</label>
              <input type="number" min="1" max="12" value={form.endMonth} onChange={e => updateField('endMonth', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">شهر الذروة (1-12)</label>
              <input type="number" min="1" max="12" value={form.peakMonth} onChange={e => updateField('peakMonth', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">المدة (أسابيع)</label>
              <input type="number" min="1" value={form.durationWeeks} onChange={e => updateField('durationWeeks', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">لون الزهر</label>
              <input type="text" value={form.flowerColor} onChange={e => updateField('flowerColor', e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm" />
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">التوزيع الجغرافي</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">المناطق الأصلية</label>
              <ArrayInput values={form.nativeRegions} onChange={v => updateField('nativeRegions', v)} placeholder="أضف منطقة..." />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">المناطق المزروعة</label>
              <ArrayInput values={form.cultivatedRegions} onChange={v => updateField('cultivatedRegions', v)} placeholder="أضف منطقة..." />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">الصور (روابط Google)</h2>
          <p className="text-xs text-muted-foreground mb-3">انسخ رابط الصورة من Google Images أو أي مصدر خارجي</p>
          <ArrayInput values={form.images} onChange={v => updateField('images', v)} placeholder="https://..." />
        </div>

        {/* Videos */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">الفيديو (روابط)</h2>
          <ArrayInput values={form.videos} onChange={v => updateField('videos', v)} placeholder="https://..." />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'حفظ التعديلات' : 'إضافة النبتة'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/plants')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 font-bold rounded-xl transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
